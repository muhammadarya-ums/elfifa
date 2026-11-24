import 'server-only'

import { and, asc, count, desc, eq, gte, like, ne, or, sql, type SQL } from 'drizzle-orm'
import { getDb, schema } from './db'
import { PROGRAMS, REGISTRATION_STATUSES, type Program, type RegistrationStatus } from './db/schema'
import { todayIso } from './format'

export type RegistrationFilters = {
  q?: string
  status?: RegistrationStatus
  program?: Program
  packageId?: number
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): RegistrationFilters {
  const get = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined)
  const status = get('status')
  const program = get('program')
  const packageId = Number(get('paket'))
  return {
    q: get('q')?.trim() || undefined,
    status: REGISTRATION_STATUSES.includes(status as RegistrationStatus) ? (status as RegistrationStatus) : undefined,
    program: PROGRAMS.includes(program as Program) ? (program as Program) : undefined,
    packageId: Number.isInteger(packageId) && packageId > 0 ? packageId : undefined,
  }
}

function whereFor(f: RegistrationFilters) {
  const r = schema.registrations
  const conds: SQL[] = []
  if (f.status) conds.push(eq(r.status, f.status))
  if (f.program) conds.push(eq(r.program, f.program))
  if (f.packageId) conds.push(eq(r.packageId, f.packageId))
  if (f.q) {
    const term = `%${f.q.replace(/[%_]/g, '')}%`
    const digits = f.q.replace(/\D/g, '')
    const parts: SQL[] = [like(r.fullName, term), like(r.code, term.toUpperCase()), like(r.city, term), like(r.email, term)]
    if (digits.length >= 4) parts.push(like(r.phone, `%${digits.replace(/^0/, '')}%`))
    conds.push(or(...parts)!)
  }
  return conds.length ? and(...conds) : undefined
}

const paidSubquery = sql<number>`coalesce((select sum(${schema.payments.amountIdr}) from ${schema.payments} where ${schema.payments.registrationId} = ${schema.registrations.id}), 0)`

export async function listRegistrations(f: RegistrationFilters, page = 1, pageSize = 25) {
  const db = await getDb()
  const where = whereFor(f)
  const [{ total }] = await db.select({ total: count() }).from(schema.registrations).where(where)
  const rows = await db
    .select({
      reg: schema.registrations,
      packageName: schema.packages.name,
      paid: paidSubquery,
    })
    .from(schema.registrations)
    .leftJoin(schema.packages, eq(schema.packages.id, schema.registrations.packageId))
    .where(where)
    .orderBy(desc(schema.registrations.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  return { total, rows: rows.map((r) => ({ ...r, paid: Number(r.paid) })), pageCount: Math.max(1, Math.ceil(total / pageSize)) }
}

export async function exportRegistrations(f: RegistrationFilters) {
  const db = await getDb()
  return db
    .select({ reg: schema.registrations, packageName: schema.packages.name, paid: paidSubquery })
    .from(schema.registrations)
    .leftJoin(schema.packages, eq(schema.packages.id, schema.registrations.packageId))
    .where(whereFor(f))
    .orderBy(desc(schema.registrations.createdAt))
}

export async function getRegistrationDetail(id: number) {
  const db = await getDb()
  const row = await db
    .select({ reg: schema.registrations, pkg: schema.packages })
    .from(schema.registrations)
    .leftJoin(schema.packages, eq(schema.packages.id, schema.registrations.packageId))
    .where(eq(schema.registrations.id, id))
    .get()
  if (!row) return null
  const payments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.registrationId, id))
    .orderBy(asc(schema.payments.paidOn), asc(schema.payments.id))
  const paid = payments.reduce((s, p) => s + p.amountIdr, 0)
  return { ...row, payments, paid }
}

export async function getAllPackages() {
  const db = await getDb()
  const rows = await db
    .select({
      pkg: schema.packages,
      seatsTaken: sql<number>`coalesce((select sum(${schema.registrations.pax}) from ${schema.registrations} where ${schema.registrations.packageId} = ${schema.packages.id} and ${schema.registrations.status} != 'batal'), 0)`,
      registrations: sql<number>`(select count(*) from ${schema.registrations} where ${schema.registrations.packageId} = ${schema.packages.id})`,
    })
    .from(schema.packages)
    .orderBy(desc(schema.packages.isActive), asc(schema.packages.sortOrder), asc(schema.packages.departureDate))
  return rows.map((r) => ({ ...r.pkg, seatsTaken: Number(r.seatsTaken), registrations: Number(r.registrations) }))
}

export async function getDashboardStats() {
  const db = await getDb()
  const r = schema.registrations
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthStartIso = todayIso().slice(0, 8) + '01'

  const [totals] = await db
    .select({
      active: sql<number>`sum(case when ${r.status} != 'batal' then 1 else 0 end)`,
      pax: sql<number>`coalesce(sum(case when ${r.status} != 'batal' then ${r.pax} else 0 end), 0)`,
      fresh: sql<number>`sum(case when ${r.status} = 'baru' then 1 else 0 end)`,
      thisMonth: sql<number>`sum(case when ${r.createdAt} >= ${monthStart.getTime()} then 1 else 0 end)`,
      billed: sql<number>`coalesce(sum(case when ${r.status} != 'batal' then ${r.totalPriceIdr} else 0 end), 0)`,
    })
    .from(r)

  const [paidAll] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.payments.amountIdr}), 0)` })
    .from(schema.payments)
    .innerJoin(r, eq(r.id, schema.payments.registrationId))
    .where(ne(r.status, 'batal'))

  const [paidMonth] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.payments.amountIdr}), 0)` })
    .from(schema.payments)
    .where(gte(schema.payments.paidOn, monthStartIso))

  const byStatus = await db.select({ status: r.status, n: count() }).from(r).groupBy(r.status)

  const recent = await db
    .select({ reg: r, packageName: schema.packages.name })
    .from(r)
    .leftJoin(schema.packages, eq(schema.packages.id, r.packageId))
    .orderBy(desc(r.createdAt))
    .limit(8)

  const activePackages = (await getAllPackages()).filter((p) => p.isActive)

  const schedules = await db
    .select()
    .from(schema.schedules)
    .where(gte(schema.schedules.date, todayIso()))
    .orderBy(asc(schema.schedules.date))
    .limit(4)

  const paid = Number(paidAll?.total ?? 0)
  const billed = Number(totals?.billed ?? 0)
  return {
    active: Number(totals?.active ?? 0),
    pax: Number(totals?.pax ?? 0),
    fresh: Number(totals?.fresh ?? 0),
    thisMonth: Number(totals?.thisMonth ?? 0),
    paid,
    outstanding: Math.max(0, billed - paid),
    paidThisMonth: Number(paidMonth?.total ?? 0),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s.n])) as Partial<Record<RegistrationStatus, number>>,
    recent,
    activePackages,
    schedules,
  }
}
