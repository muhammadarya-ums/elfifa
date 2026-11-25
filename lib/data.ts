import 'server-only'

import { and, asc, desc, eq, gte, inArray, ne, sql } from 'drizzle-orm'
import { cache } from 'react'
import { getDb, schema } from './db'
import type { FaqCategory, Package } from './db/schema'
import { todayIso } from './format'
import { DEFAULT_SETTINGS, SETTING_KEYS, type SiteSettings } from './settings-def'

export type PackageWithSeats = Package & { seatsTaken: number; seatsLeft: number }

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const db = await getDb()
  const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, SETTING_KEYS))
  const result = { ...DEFAULT_SETTINGS }
  for (const row of rows) result[row.key as keyof SiteSettings] = row.value
  return result
})

async function seatsByPackage(packageIds: number[]) {
  if (packageIds.length === 0) return new Map<number, number>()
  const db = await getDb()
  const rows = await db
    .select({
      packageId: schema.registrations.packageId,
      seats: sql<number>`coalesce(sum(${schema.registrations.pax}), 0)`,
    })
    .from(schema.registrations)
    .where(and(inArray(schema.registrations.packageId, packageIds), ne(schema.registrations.status, 'batal')))
    .groupBy(schema.registrations.packageId)
  return new Map(rows.map((r) => [r.packageId as number, Number(r.seats)]))
}

function withSeats(pkg: Package, seats: Map<number, number>): PackageWithSeats {
  const seatsTaken = seats.get(pkg.id) ?? 0
  return { ...pkg, seatsTaken, seatsLeft: Math.max(0, pkg.quota - seatsTaken) }
}

/** Paket aktif untuk ditampilkan ke publik (unggulan lebih dulu). */
export const getActivePackages = cache(async (): Promise<PackageWithSeats[]> => {
  const db = await getDb()
  const rows = await db
    .select()
    .from(schema.packages)
    .where(eq(schema.packages.isActive, true))
    .orderBy(desc(schema.packages.isFeatured), asc(schema.packages.sortOrder), asc(schema.packages.departureDate))
  const seats = await seatsByPackage(rows.map((r) => r.id))
  return rows.map((r) => withSeats(r, seats))
})

export const getPackageBySlug = cache(async (slug: string): Promise<PackageWithSeats | null> => {
  const db = await getDb()
  const pkg = await db
    .select()
    .from(schema.packages)
    .where(and(eq(schema.packages.slug, slug), eq(schema.packages.isActive, true)))
    .get()
  if (!pkg) return null
  return withSeats(pkg, await seatsByPackage([pkg.id]))
})

/** Jadwal manasik yang belum lewat & dipublikasikan. */
export const getUpcomingSchedules = cache(async (limit = 6) => {
  const db = await getDb()
  return db
    .select()
    .from(schema.schedules)
    .where(and(eq(schema.schedules.isPublished, true), gte(schema.schedules.date, todayIso())))
    .orderBy(asc(schema.schedules.date), asc(schema.schedules.startTime))
    .limit(limit)
})

export async function getPaymentsTotal(registrationId: number) {
  const db = await getDb()
  const row = await db
    .select({ total: sql<number>`coalesce(sum(${schema.payments.amountIdr}), 0)` })
    .from(schema.payments)
    .where(eq(schema.payments.registrationId, registrationId))
    .get()
  return Number(row?.total ?? 0)
}

export const getPublishedTestimonials = cache(async () => {
  const db = await getDb()
  return db
    .select()
    .from(schema.testimonials)
    .where(eq(schema.testimonials.isPublished, true))
    .orderBy(asc(schema.testimonials.sortOrder), desc(schema.testimonials.createdAt))
    .limit(9)
})

export const getPublishedFaqs = cache(async (categories?: FaqCategory[]) => {
  const db = await getDb()
  const where = categories?.length
    ? and(eq(schema.faqs.isPublished, true), inArray(schema.faqs.category, categories))
    : eq(schema.faqs.isPublished, true)
  return db.select().from(schema.faqs).where(where).orderBy(asc(schema.faqs.sortOrder), asc(schema.faqs.id))
})
