'use server'

import { randomInt } from 'node:crypto'
import { and, count, eq, ne, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  bootstrapCredentials,
  clientIp,
  createSession,
  destroySession,
  hashPassword,
  rateLimit,
  requireAdmin,
  verifyPassword,
} from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { PAYMENT_METHODS, PROGRAMS, REGISTRATION_STATUSES, type RegistrationStatus } from '@/lib/db/schema'
import { normalizePhone, slugify, todayIso } from '@/lib/format'
import { SETTING_KEYS } from '@/lib/settings-def'

export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string[] | undefined> } | null

const fail = (message: string, fieldErrors?: Record<string, string[] | undefined>): ActionResult => ({
  ok: false,
  message,
  fieldErrors,
})

function formObject(fd: FormData) {
  const obj: Record<string, string> = {}
  for (const [k, v] of fd.entries()) if (typeof v === 'string') obj[k] = v
  return obj
}

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === 'on' || v === 'true' || v === '1')

const rupiah = z
  .string()
  .default('0')
  .transform((v) => Number(v.replace(/[^\d]/g, '') || '0'))
  .pipe(z.number().int().min(0).max(10_000_000_000))

function refreshAdmin() {
  revalidatePath('/admin', 'layout')
}

/* ============================ AUTH ============================ */

export async function login(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const ip = await clientIp()
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return fail('Terlalu banyak percobaan login. Coba lagi dalam 15 menit.')
  }

  const email = String(fd.get('email') ?? '').trim().toLowerCase()
  const password = String(fd.get('password') ?? '')
  if (!email || !password) return fail('Email dan password wajib diisi.')

  const db = await getDb()
  let admin = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).get()

  // Admin pertama dibuat otomatis dari kredensial bootstrap bila tabel masih kosong
  if (!admin) {
    const [{ n }] = await db.select({ n: count() }).from(schema.admins)
    const boot = bootstrapCredentials()
    if (n === 0 && boot && boot.email === email && boot.password === password) {
      admin = await db
        .insert(schema.admins)
        .values({ name: 'Administrator', email, passwordHash: await hashPassword(password) })
        .returning()
        .get()
    }
  }

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return fail('Email atau password salah.')
  }

  await db.update(schema.admins).set({ lastLoginAt: new Date() }).where(eq(schema.admins.id, admin.id))
  await createSession(admin)
  const next = String(fd.get('next') ?? '')
  redirect(next.startsWith('/admin') ? next : '/admin')
}

export async function logout() {
  await destroySession()
  redirect('/admin/login')
}

/* ============================ PENDAFTARAN ============================ */

const STATUS_ORDER: RegistrationStatus[] = ['baru', 'dihubungi', 'dp', 'lunas', 'berangkat', 'selesai']

/** Naikkan status otomatis berdasarkan pembayaran (tidak pernah menurunkan). */
async function syncPaymentStatus(registrationId: number) {
  const db = await getDb()
  const reg = await db.select().from(schema.registrations).where(eq(schema.registrations.id, registrationId)).get()
  if (!reg || reg.status === 'batal') return
  const [{ paid }] = await db
    .select({ paid: sql<number>`coalesce(sum(${schema.payments.amountIdr}), 0)` })
    .from(schema.payments)
    .where(eq(schema.payments.registrationId, registrationId))
  const paidNum = Number(paid)
  let target: RegistrationStatus | null = null
  if (reg.totalPriceIdr > 0 && paidNum >= reg.totalPriceIdr) target = 'lunas'
  else if (paidNum > 0) target = 'dp'
  if (target && STATUS_ORDER.indexOf(target) > STATUS_ORDER.indexOf(reg.status)) {
    await db.update(schema.registrations).set({ status: target }).where(eq(schema.registrations.id, registrationId))
  }
}

const registrationAdminSchema = z.object({
  program: z.enum(PROGRAMS),
  packageId: z
    .string()
    .optional()
    .transform((v) => (v && Number(v) > 0 ? Number(v) : null)),
  fullName: z.string().trim().min(2, 'Nama wajib diisi').max(100),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((v) => /^62\d{8,13}$/.test(v), 'Nomor WhatsApp tidak valid'),
  email: z.union([z.literal(''), z.email('Email tidak valid')]).default(''),
  city: z.string().trim().max(60).default(''),
  pax: z.coerce.number().int().min(1).max(50),
  hasPassport: checkbox,
  status: z.enum(REGISTRATION_STATUSES),
  totalPriceIdr: rupiah,
  adminNotes: z.string().trim().max(5000).default(''),
  message: z.string().trim().max(2000).default(''),
})

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export async function createRegistrationAdmin(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const parsed = registrationAdminSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian formulir.', z.flattenError(parsed.error).fieldErrors)
  const d = parsed.data
  const db = await getDb()

  let total = d.totalPriceIdr
  if (d.program === 'umroh' && d.packageId && total === 0) {
    const pkg = await db.select().from(schema.packages).where(eq(schema.packages.id, d.packageId)).get()
    if (pkg) total = pkg.priceIdr * d.pax
  }

  let id = 0
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    let code = d.program === 'umroh' ? 'ELF-' : 'KBH-'
    for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    try {
      const row = await db
        .insert(schema.registrations)
        .values({ ...d, packageId: d.program === 'umroh' ? d.packageId : null, code, totalPriceIdr: total, source: 'admin' })
        .returning({ id: schema.registrations.id })
        .get()
      id = row.id
    } catch (err) {
      if (attempt === 4 || !String(err).includes('UNIQUE')) throw err
    }
  }
  refreshAdmin()
  redirect(`/admin/pendaftaran/${id}?dibuat=1`)
}

export async function updateRegistration(id: number, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const parsed = registrationAdminSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian formulir.', z.flattenError(parsed.error).fieldErrors)
  const d = parsed.data
  const db = await getDb()
  await db
    .update(schema.registrations)
    .set({ ...d, packageId: d.program === 'umroh' ? d.packageId : null })
    .where(eq(schema.registrations.id, id))
  refreshAdmin()
  return { ok: true, message: 'Perubahan tersimpan.' }
}

export async function quickUpdateStatus(id: number, fd: FormData) {
  await requireAdmin()
  const status = String(fd.get('status'))
  if (!REGISTRATION_STATUSES.includes(status as RegistrationStatus)) return
  const db = await getDb()
  await db.update(schema.registrations).set({ status: status as RegistrationStatus }).where(eq(schema.registrations.id, id))
  refreshAdmin()
}

export async function deleteRegistration(id: number) {
  await requireAdmin()
  const db = await getDb()
  await db.delete(schema.registrations).where(eq(schema.registrations.id, id))
  refreshAdmin()
  redirect('/admin/pendaftaran?dihapus=1')
}

const paymentSchema = z.object({
  amountIdr: rupiah.pipe(z.number().min(1, 'Nominal wajib diisi')),
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid'),
  method: z.enum(PAYMENT_METHODS),
  note: z.string().trim().max(300).default(''),
})

export async function addPayment(registrationId: number, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const parsed = paymentSchema.safeParse({ ...formObject(fd), paidOn: String(fd.get('paidOn') || todayIso()) })
  if (!parsed.success) return fail('Periksa data pembayaran.', z.flattenError(parsed.error).fieldErrors)
  const db = await getDb()
  await db.insert(schema.payments).values({ registrationId, ...parsed.data })
  await syncPaymentStatus(registrationId)
  refreshAdmin()
  return { ok: true, message: 'Pembayaran dicatat.' }
}

export async function deletePayment(paymentId: number, registrationId: number) {
  await requireAdmin()
  const db = await getDb()
  await db
    .delete(schema.payments)
    .where(and(eq(schema.payments.id, paymentId), eq(schema.payments.registrationId, registrationId)))
  refreshAdmin()
}

/* ============================ PAKET ============================ */

const packageSchema = z.object({
  name: z.string().trim().min(3, 'Nama paket wajib diisi').max(120),
  slug: z.string().trim().max(80).default(''),
  tagline: z.string().trim().max(80).default(''),
  description: z.string().trim().max(3000).default(''),
  durationDays: z.coerce.number().int().min(1, 'Minimal 1 hari').max(60),
  departureDate: z
    .string()
    .default('')
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Tanggal tidak valid')
    .transform((v) => v || null),
  airline: z.string().trim().max(80).default(''),
  priceIdr: rupiah.pipe(z.number().min(1_000_000, 'Harga minimal Rp 1.000.000')),
  originalPriceIdr: rupiah.transform((v) => (v > 0 ? v : null)),
  quota: z.coerce.number().int().min(1).max(1000),
  hotelMakkah: z.string().trim().max(100).default(''),
  hotelMakkahStars: z.coerce.number().int().min(1).max(5),
  hotelMakkahNights: z.coerce.number().int().min(0).max(60),
  hotelMakkahNote: z.string().trim().max(120).default(''),
  hotelMadinah: z.string().trim().max(100).default(''),
  hotelMadinahStars: z.coerce.number().int().min(1).max(5),
  hotelMadinahNights: z.coerce.number().int().min(0).max(60),
  hotelMadinahNote: z.string().trim().max(120).default(''),
  includes: z.string().max(3000).default(''),
  bonuses: z.string().max(3000).default(''),
  isFeatured: checkbox,
  isActive: checkbox,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
})

export async function savePackage(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const parsed = packageSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian paket.', z.flattenError(parsed.error).fieldErrors)
  const data = { ...parsed.data, slug: slugify(parsed.data.slug || parsed.data.name) }
  if (!data.slug) return fail('Slug tidak valid.', { slug: ['Slug tidak valid'] })

  const db = await getDb()
  const clash = await db
    .select({ id: schema.packages.id })
    .from(schema.packages)
    .where(id ? and(eq(schema.packages.slug, data.slug), ne(schema.packages.id, id)) : eq(schema.packages.slug, data.slug))
    .get()
  if (clash) return fail('Slug sudah dipakai paket lain.', { slug: ['Gunakan slug lain'] })

  // Hanya boleh ada satu paket unggulan
  if (data.isFeatured) {
    await db.update(schema.packages).set({ isFeatured: false }).where(eq(schema.packages.isFeatured, true))
  }

  let savedId = id
  if (id) {
    await db.update(schema.packages).set(data).where(eq(schema.packages.id, id))
  } else {
    savedId = (await db.insert(schema.packages).values(data).returning({ id: schema.packages.id }).get()).id
  }
  refreshAdmin()
  revalidatePath('/')
  if (!id) redirect(`/admin/paket/${savedId}?disimpan=1`)
  return { ok: true, message: 'Paket tersimpan.' }
}

export async function deletePackage(id: number) {
  await requireAdmin()
  const db = await getDb()
  const [{ n }] = await db.select({ n: count() }).from(schema.registrations).where(eq(schema.registrations.packageId, id))
  if (n > 0) {
    // Ada pendaftar: nonaktifkan saja agar riwayat tetap utuh
    await db.update(schema.packages).set({ isActive: false, isFeatured: false }).where(eq(schema.packages.id, id))
    refreshAdmin()
    redirect('/admin/paket?dinonaktifkan=1')
  }
  await db.delete(schema.packages).where(eq(schema.packages.id, id))
  refreshAdmin()
  redirect('/admin/paket?dihapus=1')
}

/* ============================ JADWAL ============================ */

const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal wajib diisi'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Jam tidak valid'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Jam tidak valid'),
  topic: z.string().trim().min(3, 'Materi wajib diisi').max(150),
  location: z.string().trim().min(2, 'Lokasi wajib diisi').max(150),
  isPublished: checkbox,
})

export async function saveSchedule(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const parsed = scheduleSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian jadwal.', z.flattenError(parsed.error).fieldErrors)
  if (parsed.data.endTime <= parsed.data.startTime) return fail('Jam selesai harus setelah jam mulai.', { endTime: ['Harus setelah jam mulai'] })
  const db = await getDb()
  if (id) await db.update(schema.schedules).set(parsed.data).where(eq(schema.schedules.id, id))
  else await db.insert(schema.schedules).values(parsed.data)
  refreshAdmin()
  if (id) redirect('/admin/jadwal?disimpan=1')
  return { ok: true, message: 'Jadwal ditambahkan.' }
}

export async function deleteSchedule(id: number) {
  await requireAdmin()
  const db = await getDb()
  await db.delete(schema.schedules).where(eq(schema.schedules.id, id))
  refreshAdmin()
}

/* ============================ PENGATURAN ============================ */

export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const errors: Record<string, string[]> = {}
  const values: { key: string; value: string }[] = []
  for (const key of SETTING_KEYS) {
    const raw = String(fd.get(key) ?? '').trim()
    let value = raw
    if (key.endsWith('_whatsapp')) {
      value = normalizePhone(raw)
      if (!/^62\d{8,13}$/.test(value)) errors[key] = ['Nomor WhatsApp tidak valid']
    }
    if ((key.endsWith('_instagram') || key.endsWith('_facebook') || key.endsWith('_youtube')) && raw && !/^https?:\/\//.test(raw)) {
      errors[key] = ['Harus diawali https://']
    }
    if (value.length > 300) errors[key] = ['Terlalu panjang']
    values.push({ key, value })
  }
  if (Object.keys(errors).length) return fail('Beberapa isian tidak valid.', errors)

  const db = await getDb()
  for (const v of values) {
    await db
      .insert(schema.settings)
      .values({ ...v, updatedAt: new Date() })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: v.value, updatedAt: new Date() } })
  }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Pengaturan tersimpan. Perubahan langsung tampil di website.' }
}

const passwordRule = z.string().min(8, 'Minimal 8 karakter').max(100)

export async function changePassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin()
  const current = String(fd.get('current') ?? '')
  const next = passwordRule.safeParse(String(fd.get('next') ?? ''))
  if (!next.success) return fail('Password baru tidak valid.', { next: next.error.issues.map((i) => i.message) })
  if (next.data !== String(fd.get('confirm') ?? '')) return fail('Konfirmasi password tidak sama.', { confirm: ['Tidak sama'] })
  if (!(await verifyPassword(current, admin.passwordHash))) return fail('Password saat ini salah.', { current: ['Salah'] })

  const db = await getDb()
  const updated = await db
    .update(schema.admins)
    .set({ passwordHash: await hashPassword(next.data) })
    .where(eq(schema.admins.id, admin.id))
    .returning()
    .get()
  await createSession(updated) // perbarui sesi; sesi di perangkat lain otomatis keluar
  return { ok: true, message: 'Password berhasil diganti.' }
}

export async function createAdmin(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin()
  const parsed = z
    .object({
      name: z.string().trim().min(2, 'Nama wajib diisi').max(80),
      email: z.email('Email tidak valid').transform((v) => v.toLowerCase()),
      password: passwordRule,
    })
    .safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian.', z.flattenError(parsed.error).fieldErrors)
  const db = await getDb()
  const exists = await db.select().from(schema.admins).where(eq(schema.admins.email, parsed.data.email)).get()
  if (exists) return fail('Email sudah terdaftar sebagai admin.', { email: ['Sudah terdaftar'] })
  await db.insert(schema.admins).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
  })
  refreshAdmin()
  return { ok: true, message: `Admin ${parsed.data.email} ditambahkan.` }
}

export async function deleteAdmin(id: number) {
  const admin = await requireAdmin()
  if (admin.id === id) return
  const db = await getDb()
  await db.delete(schema.admins).where(eq(schema.admins.id, id))
  refreshAdmin()
}
