'use server'

import { randomInt } from 'node:crypto'
import { and, count, eq, ne, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { audit } from '@/lib/audit'
import { blockSchema, describeIssuePath, getRevision, writeBlock } from '@/lib/content'
import { getBlockDef, isAllowedImageUrl } from '@/lib/content-def'
import { isMediaId, mediaUsage } from '@/lib/media'
import {
  bootstrapCredentials,
  clientIp,
  createPendingTwoFactor,
  createSession,
  destroySession,
  dummyPasswordHash,
  getCurrentAdmin,
  hashPassword,
  rateLimit,
  requireAdmin,
  resetRateLimit,
  revokeSessions,
  verifyPassword,
} from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import {
  ADMIN_ROLES,
  FAQ_CATEGORIES,
  PAYMENT_METHODS,
  PROGRAMS,
  REGISTRATION_STATUSES,
  type RegistrationStatus,
} from '@/lib/db/schema'
import { formatRupiah, normalizePhone, slugify, todayIso } from '@/lib/format'
import { STATUS_LABELS } from '@/lib/labels'
import { can } from '@/lib/permissions'
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

const LOGIN_MAX_FAILURES = 5
const LOGIN_LOCK_MS = 15 * 60 * 1000

export async function login(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const ip = await clientIp()
  const ipLimit = await rateLimit(`login-ip:${ip}`, 30, 15 * 60 * 1000)
  if (!ipLimit.allowed) return fail('Terlalu banyak percobaan login dari jaringan ini. Coba lagi dalam 15 menit.')

  const email = String(fd.get('email') ?? '').trim().toLowerCase()
  const password = String(fd.get('password') ?? '')
  if (!email || !password) return fail('Email dan password wajib diisi.')

  const db = await getDb()
  const failKey = `login-fail:${email}`
  const lock = await db.select().from(schema.rateLimits).where(eq(schema.rateLimits.key, failKey)).get()
  if (lock && lock.count >= LOGIN_MAX_FAILURES && lock.resetAt > Date.now()) {
    const minutes = Math.ceil((lock.resetAt - Date.now()) / 60000)
    return fail(`Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.`)
  }

  let admin = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).get()

  // Admin pertama dibuat otomatis dari kredensial bootstrap bila tabel masih kosong
  if (!admin) {
    const [{ n }] = await db.select({ n: count() }).from(schema.admins)
    const boot = bootstrapCredentials()
    if (n === 0 && boot && boot.email === email && boot.password === password) {
      admin = await db
        .insert(schema.admins)
        .values({ name: 'Administrator', email, role: 'owner', passwordHash: await hashPassword(password) })
        .returning()
        .get()
    }
  }

  // Selalu jalankan verifikasi hash agar waktu respons sama (anti user-enumeration)
  const valid = await verifyPassword(password, admin?.passwordHash ?? (await dummyPasswordHash()))

  if (!admin || !valid || !admin.isActive) {
    const r = await rateLimit(failKey, LOGIN_MAX_FAILURES, LOGIN_LOCK_MS)
    await audit(admin ?? null, r.count >= LOGIN_MAX_FAILURES ? 'auth.locked' : 'auth.login_failed', { type: 'admin', id: email }, `${email} · percobaan ke-${r.count} dalam 15 menit`)
    return fail('Email atau password salah.')
  }

  await resetRateLimit(failKey)
  const next = String(fd.get('next') ?? '')
  const safeNext = /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : '/admin'

  // 2FA aktif → password saja belum cukup: minta kode dari aplikasi authenticator
  if (admin.totpSecret) {
    await createPendingTwoFactor(admin)
    redirect(`/admin/login/verifikasi?next=${encodeURIComponent(safeNext)}`)
  }

  await db.update(schema.admins).set({ lastLoginAt: new Date() }).where(eq(schema.admins.id, admin.id))
  await createSession(admin)
  await audit(admin, 'auth.login', { type: 'admin', id: admin.id })
  redirect(safeNext)
}

export async function logout() {
  const admin = await getCurrentAdmin()
  if (admin) await audit(admin, 'auth.logout', { type: 'admin', id: admin.id })
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
  /** Opsional: di halaman detail, status diubah lewat kontrol terpisah */
  status: z.enum(REGISTRATION_STATUSES).optional(),
  totalPriceIdr: rupiah,
  adminNotes: z.string().trim().max(5000).default(''),
  message: z.string().trim().max(2000).default(''),
})

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export async function createRegistrationAdmin(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('registration.edit')
  const parsed = registrationAdminSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian formulir.', z.flattenError(parsed.error).fieldErrors)
  const d = parsed.data
  const db = await getDb()

  let total = can(admin.role, 'payment.manage') ? d.totalPriceIdr : 0
  if (d.program === 'umroh' && d.packageId && total === 0) {
    const pkg = await db.select().from(schema.packages).where(eq(schema.packages.id, d.packageId)).get()
    if (pkg) total = pkg.priceIdr * d.pax
  }

  let id = 0
  let code = ''
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    code = d.program === 'umroh' ? 'ELF-' : 'KBH-'
    for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    try {
      const row = await db
        .insert(schema.registrations)
        .values({ ...d, status: d.status ?? 'baru', packageId: d.program === 'umroh' ? d.packageId : null, code, totalPriceIdr: total, source: 'admin' })
        .returning({ id: schema.registrations.id })
        .get()
      id = row.id
    } catch (err) {
      if (attempt === 4 || !String(err).includes('UNIQUE')) throw err
    }
  }
  await audit(admin, 'registration.create', { type: 'registration', id }, `${code} · ${d.fullName}`)
  refreshAdmin()
  redirect(`/admin/pendaftaran/${id}?dibuat=1`)
}

export async function updateRegistration(id: number, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('registration.edit')
  const parsed = registrationAdminSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian formulir.', z.flattenError(parsed.error).fieldErrors)
  const d = parsed.data
  const db = await getDb()
  const before = await db.select().from(schema.registrations).where(eq(schema.registrations.id, id)).get()
  if (!before) return fail('Data tidak ditemukan.')

  // Staf tidak boleh mengubah nilai tagihan
  const totalPriceIdr = can(admin.role, 'payment.manage') ? d.totalPriceIdr : before.totalPriceIdr
  const status = d.status ?? before.status

  await db
    .update(schema.registrations)
    .set({ ...d, status, totalPriceIdr, packageId: d.program === 'umroh' ? d.packageId : null })
    .where(eq(schema.registrations.id, id))

  const changes: string[] = []
  if (before.status !== status) changes.push(`status ${STATUS_LABELS[before.status]} → ${STATUS_LABELS[status]}`)
  if (before.totalPriceIdr !== totalPriceIdr) changes.push(`tagihan ${formatRupiah(before.totalPriceIdr)} → ${formatRupiah(totalPriceIdr)}`)
  if (before.pax !== d.pax) changes.push(`jamaah ${before.pax} → ${d.pax}`)
  await audit(admin, 'registration.update', { type: 'registration', id }, `${before.code}${changes.length ? ' · ' + changes.join(', ') : ''}`)
  refreshAdmin()
  return { ok: true, message: 'Perubahan tersimpan.' }
}

export async function quickUpdateStatus(id: number, fd: FormData) {
  const admin = await requireAdmin('registration.edit')
  const status = String(fd.get('status'))
  if (!REGISTRATION_STATUSES.includes(status as RegistrationStatus)) return
  const db = await getDb()
  const before = await db.select().from(schema.registrations).where(eq(schema.registrations.id, id)).get()
  if (!before || before.status === status) return
  await db.update(schema.registrations).set({ status: status as RegistrationStatus }).where(eq(schema.registrations.id, id))
  await audit(admin, 'registration.status', { type: 'registration', id }, `${before.code} · ${STATUS_LABELS[before.status]} → ${STATUS_LABELS[status as RegistrationStatus]}`)
  refreshAdmin()
}

export async function deleteRegistration(id: number) {
  const admin = await requireAdmin('registration.delete')
  const db = await getDb()
  const reg = await db.select().from(schema.registrations).where(eq(schema.registrations.id, id)).get()
  if (reg) {
    await db.delete(schema.registrations).where(eq(schema.registrations.id, id))
    await audit(admin, 'registration.delete', { type: 'registration', id }, `${reg.code} · ${reg.fullName}`)
  }
  refreshAdmin()
  redirect('/admin/pendaftaran?dihapus=1')
}

const paymentSchema = z.object({
  amountIdr: rupiah.pipe(z.number().min(1, 'Nominal wajib diisi')),
  paidOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid')
    .refine((v) => v <= todayIso(), 'Tanggal tidak boleh di masa depan'),
  method: z.enum(PAYMENT_METHODS),
  note: z.string().trim().max(300).default(''),
})

export async function addPayment(registrationId: number, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('payment.manage')
  const parsed = paymentSchema.safeParse({ ...formObject(fd), paidOn: String(fd.get('paidOn') || todayIso()) })
  if (!parsed.success) return fail('Periksa data pembayaran.', z.flattenError(parsed.error).fieldErrors)
  const db = await getDb()
  const reg = await db.select().from(schema.registrations).where(eq(schema.registrations.id, registrationId)).get()
  if (!reg) return fail('Pendaftaran tidak ditemukan.')
  await db.insert(schema.payments).values({ registrationId, ...parsed.data })
  await syncPaymentStatus(registrationId)
  await audit(admin, 'payment.create', { type: 'registration', id: registrationId }, `${reg.code} · ${formatRupiah(parsed.data.amountIdr)} (${parsed.data.method})`)
  refreshAdmin()
  return { ok: true, message: 'Pembayaran dicatat.' }
}

export async function deletePayment(paymentId: number, registrationId: number) {
  const admin = await requireAdmin('payment.manage')
  const db = await getDb()
  const pay = await db
    .select()
    .from(schema.payments)
    .where(and(eq(schema.payments.id, paymentId), eq(schema.payments.registrationId, registrationId)))
    .get()
  if (pay) {
    await db.delete(schema.payments).where(eq(schema.payments.id, paymentId))
    await audit(admin, 'payment.delete', { type: 'registration', id: registrationId }, `${formatRupiah(pay.amountIdr)} tgl ${pay.paidOn}`)
  }
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
  imageUrl: z
    .string()
    .trim()
    .default('')
    .refine((v) => v === '' || isAllowedImageUrl(v), 'Gambar harus dari pustaka media'),
  isFeatured: checkbox,
  isActive: checkbox,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
})

export async function savePackage(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('catalog.manage')
  const parsed = packageSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian paket.', z.flattenError(parsed.error).fieldErrors)
  const data = { ...parsed.data, slug: slugify(parsed.data.slug || parsed.data.name) }
  if (!data.slug) return fail('Slug tidak valid.', { slug: ['Slug tidak valid'] })
  if (data.originalPriceIdr !== null && data.originalPriceIdr <= data.priceIdr) {
    return fail('Harga coret harus lebih besar dari harga jual.', { originalPriceIdr: ['Harus lebih besar dari harga jual'] })
  }

  const db = await getDb()
  const clash = await db
    .select({ id: schema.packages.id })
    .from(schema.packages)
    .where(id ? and(eq(schema.packages.slug, data.slug), ne(schema.packages.id, id)) : eq(schema.packages.slug, data.slug))
    .get()
  if (clash) return fail('Slug sudah dipakai paket lain.', { slug: ['Gunakan slug lain'] })

  if (id) {
    const [{ taken }] = await db
      .select({ taken: sql<number>`coalesce(sum(${schema.registrations.pax}), 0)` })
      .from(schema.registrations)
      .where(and(eq(schema.registrations.packageId, id), ne(schema.registrations.status, 'batal')))
    if (data.quota < Number(taken)) {
      return fail(`Kuota tidak boleh kurang dari kursi terisi (${taken}).`, { quota: [`Minimal ${taken}`] })
    }
  }

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
  await audit(admin, id ? 'package.update' : 'package.create', { type: 'package', id: savedId! }, data.name)
  refreshAdmin()
  revalidatePath('/')
  if (!id) redirect(`/admin/paket/${savedId}?disimpan=1`)
  return { ok: true, message: 'Paket tersimpan.' }
}

export async function deletePackage(id: number) {
  const admin = await requireAdmin('catalog.manage')
  const db = await getDb()
  const pkg = await db.select().from(schema.packages).where(eq(schema.packages.id, id)).get()
  if (!pkg) redirect('/admin/paket')
  const [{ n }] = await db.select({ n: count() }).from(schema.registrations).where(eq(schema.registrations.packageId, id))
  if (n > 0) {
    // Ada pendaftar: nonaktifkan saja agar riwayat tetap utuh
    await db.update(schema.packages).set({ isActive: false, isFeatured: false }).where(eq(schema.packages.id, id))
    await audit(admin, 'package.deactivate', { type: 'package', id }, pkg.name)
    refreshAdmin()
    redirect('/admin/paket?dinonaktifkan=1')
  }
  await db.delete(schema.packages).where(eq(schema.packages.id, id))
  await audit(admin, 'package.delete', { type: 'package', id }, pkg.name)
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
  const admin = await requireAdmin('catalog.manage')
  const parsed = scheduleSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian jadwal.', z.flattenError(parsed.error).fieldErrors)
  if (parsed.data.endTime <= parsed.data.startTime) return fail('Jam selesai harus setelah jam mulai.', { endTime: ['Harus setelah jam mulai'] })
  const db = await getDb()
  let savedId = id
  if (id) await db.update(schema.schedules).set(parsed.data).where(eq(schema.schedules.id, id))
  else savedId = (await db.insert(schema.schedules).values(parsed.data).returning({ id: schema.schedules.id }).get()).id
  await audit(admin, id ? 'schedule.update' : 'schedule.create', { type: 'schedule', id: savedId! }, `${parsed.data.date} · ${parsed.data.topic}`)
  refreshAdmin()
  if (id) redirect('/admin/jadwal?disimpan=1')
  return { ok: true, message: 'Jadwal ditambahkan.' }
}

export async function deleteSchedule(id: number) {
  const admin = await requireAdmin('catalog.manage')
  const db = await getDb()
  const row = await db.delete(schema.schedules).where(eq(schema.schedules.id, id)).returning().get()
  if (row) await audit(admin, 'schedule.delete', { type: 'schedule', id }, `${row.date} · ${row.topic}`)
  refreshAdmin()
}

/* ============================ KONTEN: TESTIMONI & FAQ ============================ */

const testimonialSchema = z.object({
  name: z.string().trim().min(2, 'Nama wajib diisi').max(80),
  city: z.string().trim().max(60).default(''),
  tripLabel: z.string().trim().max(80).default(''),
  quote: z.string().trim().min(20, 'Minimal 20 karakter').max(800, 'Maksimal 800 karakter'),
  isPublished: checkbox,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
})

export async function saveTestimonial(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('content.manage')
  const parsed = testimonialSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian testimoni.', z.flattenError(parsed.error).fieldErrors)
  const db = await getDb()
  let savedId = id
  if (id) await db.update(schema.testimonials).set(parsed.data).where(eq(schema.testimonials.id, id))
  else savedId = (await db.insert(schema.testimonials).values(parsed.data).returning({ id: schema.testimonials.id }).get()).id
  await audit(admin, 'testimonial.save', { type: 'testimonial', id: savedId! }, parsed.data.name)
  refreshAdmin()
  revalidatePath('/')
  if (id) redirect('/admin/konten?disimpan=1')
  return { ok: true, message: 'Testimoni ditambahkan.' }
}

export async function deleteTestimonial(id: number) {
  const admin = await requireAdmin('content.manage')
  const db = await getDb()
  const row = await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id)).returning().get()
  if (row) await audit(admin, 'testimonial.delete', { type: 'testimonial', id }, row.name)
  refreshAdmin()
}

const faqSchema = z.object({
  question: z.string().trim().min(8, 'Pertanyaan terlalu pendek').max(200),
  answer: z.string().trim().min(10, 'Jawaban terlalu pendek').max(2000),
  category: z.enum(FAQ_CATEGORIES),
  isPublished: checkbox,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
})

export async function saveFaq(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('content.manage')
  const parsed = faqSchema.safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian FAQ.', z.flattenError(parsed.error).fieldErrors)
  const db = await getDb()
  let savedId = id
  if (id) await db.update(schema.faqs).set(parsed.data).where(eq(schema.faqs.id, id))
  else savedId = (await db.insert(schema.faqs).values(parsed.data).returning({ id: schema.faqs.id }).get()).id
  await audit(admin, 'faq.save', { type: 'faq', id: savedId! }, parsed.data.question)
  refreshAdmin()
  revalidatePath('/')
  if (id) redirect('/admin/konten?disimpan=1')
  return { ok: true, message: 'FAQ ditambahkan.' }
}

export async function deleteFaq(id: number) {
  const admin = await requireAdmin('content.manage')
  const db = await getDb()
  const row = await db.delete(schema.faqs).where(eq(schema.faqs.id, id)).returning().get()
  if (row) await audit(admin, 'faq.delete', { type: 'faq', id }, row.question)
  refreshAdmin()
}

/* ============================ PENGATURAN ============================ */

export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('settings.manage')
  const errors: Record<string, string[]> = {}
  const values: { key: string; value: string }[] = []
  for (const key of SETTING_KEYS) {
    const raw = String(fd.get(key) ?? '').trim()
    let value = raw
    if (key.endsWith('_whatsapp')) {
      value = normalizePhone(raw)
      if (!/^62\d{8,13}$/.test(value)) errors[key] = ['Nomor WhatsApp tidak valid']
    }
    if ((key.endsWith('_instagram') || key.endsWith('_facebook') || key.endsWith('_youtube')) && raw && !/^https:\/\//.test(raw)) {
      errors[key] = ['Harus diawali https://']
    }
    if (value.length > 300) errors[key] = ['Terlalu panjang']
    values.push({ key, value })
  }
  if (Object.keys(errors).length) return fail('Beberapa isian tidak valid.', errors)

  const db = await getDb()
  const current = new Map((await db.select().from(schema.settings)).map((r) => [r.key, r.value]))
  const changed = values.filter((v) => current.get(v.key) !== v.value)
  for (const v of changed) {
    await db
      .insert(schema.settings)
      .values({ ...v, updatedAt: new Date() })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: v.value, updatedAt: new Date() } })
  }
  if (changed.length) await audit(admin, 'settings.update', { type: 'settings' }, changed.map((c) => c.key).join(', '))
  revalidatePath('/', 'layout')
  return { ok: true, message: changed.length ? 'Pengaturan tersimpan. Perubahan langsung tampil di website.' : 'Tidak ada perubahan.' }
}

/* ============================ AKUN ADMIN ============================ */

const passwordRule = z
  .string()
  .min(10, 'Minimal 10 karakter')
  .max(100)
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), 'Harus mengandung huruf dan angka')

export async function changePassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin(undefined, { allowWithout2fa: true })
  const current = String(fd.get('current') ?? '')
  const next = passwordRule.safeParse(String(fd.get('next') ?? ''))
  if (!next.success) return fail('Password baru tidak valid.', { next: next.error.issues.map((i) => i.message) })
  if (next.data !== String(fd.get('confirm') ?? '')) return fail('Konfirmasi password tidak sama.', { confirm: ['Tidak sama'] })
  if (next.data === current) return fail('Password baru harus berbeda.', { next: ['Harus berbeda dari password lama'] })
  if (!(await verifyPassword(current, admin.passwordHash))) return fail('Password saat ini salah.', { current: ['Salah'] })

  const db = await getDb()
  const updated = await db
    .update(schema.admins)
    .set({ passwordHash: await hashPassword(next.data) })
    .where(eq(schema.admins.id, admin.id))
    .returning()
    .get()
  await createSession(updated) // perbarui sesi ini; sesi di perangkat lain otomatis keluar
  await audit(admin, 'auth.password_changed', { type: 'admin', id: admin.id })
  return { ok: true, message: 'Password berhasil diganti. Sesi di perangkat lain otomatis keluar.' }
}

export async function createAdmin(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const me = await requireAdmin('admins.manage')
  const parsed = z
    .object({
      name: z.string().trim().min(2, 'Nama wajib diisi').max(80),
      email: z.email('Email tidak valid').transform((v) => v.toLowerCase()),
      role: z.enum(ADMIN_ROLES),
      password: passwordRule,
    })
    .safeParse(formObject(fd))
  if (!parsed.success) return fail('Periksa kembali isian.', z.flattenError(parsed.error).fieldErrors)
  const db = await getDb()
  const exists = await db.select().from(schema.admins).where(eq(schema.admins.email, parsed.data.email)).get()
  if (exists) return fail('Email sudah terdaftar sebagai admin.', { email: ['Sudah terdaftar'] })
  const row = await db
    .insert(schema.admins)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    })
    .returning({ id: schema.admins.id })
    .get()
  await audit(me, 'admin.create', { type: 'admin', id: row.id }, `${parsed.data.email} (${parsed.data.role})`)
  refreshAdmin()
  return { ok: true, message: `Admin ${parsed.data.email} ditambahkan.` }
}

async function ownersRemaining(excludeId: number) {
  const db = await getDb()
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.admins)
    .where(and(eq(schema.admins.role, 'owner'), eq(schema.admins.isActive, true), ne(schema.admins.id, excludeId)))
  return n
}

export async function updateAdmin(id: number, fd: FormData) {
  const me = await requireAdmin('admins.manage')
  if (id === me.id) return // tidak boleh mengubah peran/status diri sendiri
  const role = String(fd.get('role'))
  const isActive = fd.get('isActive') === 'on'
  if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) return
  const db = await getDb()
  const target = await db.select().from(schema.admins).where(eq(schema.admins.id, id)).get()
  if (!target) return
  if (target.role === 'owner' && (role !== 'owner' || !isActive) && (await ownersRemaining(id)) === 0) return
  await db
    .update(schema.admins)
    .set({ role: role as (typeof ADMIN_ROLES)[number], isActive })
    .where(eq(schema.admins.id, id))
  // Perubahan hak akses berlaku segera: paksa login ulang
  await revokeSessions(id)
  await audit(me, 'admin.update', { type: 'admin', id }, `${target.email}: ${target.role} → ${role}, ${isActive ? 'aktif' : 'nonaktif'}`)
  refreshAdmin()
}

export async function deleteAdmin(id: number) {
  const me = await requireAdmin('admins.manage')
  if (me.id === id) return
  const db = await getDb()
  const target = await db.select().from(schema.admins).where(eq(schema.admins.id, id)).get()
  if (!target) return
  if (target.role === 'owner' && (await ownersRemaining(id)) === 0) return
  await db.delete(schema.admins).where(eq(schema.admins.id, id))
  await audit(me, 'admin.delete', { type: 'admin', id }, target.email)
  refreshAdmin()
}

/* ============================ CMS: KONTEN HALAMAN ============================ */

export async function saveContentBlock(key: string, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('content.manage')
  const def = getBlockDef(key)
  if (!def) return fail('Blok konten tidak dikenal.')
  const raw = String(fd.get('value') ?? '')
  if (raw.length > 200_000) return fail('Konten terlalu besar.')
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return fail('Data tidak valid.')
  }
  const parsed = blockSchema(def).safeParse(json)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${describeIssuePath(def, i.path)}: ${i.message}`)
    return fail('Periksa kembali isian berikut.', { _: [...new Set(issues)] })
  }
  await writeBlock(key, parsed.data, admin.email)
  await audit(admin, 'content.save', { type: 'content', id: key }, def.title)
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Tersimpan dan sudah tampil di website.' }
}

export async function restoreContentRevision(revisionId: number) {
  const admin = await requireAdmin('content.manage')
  const rev = await getRevision(revisionId)
  if (!rev) return
  const def = getBlockDef(rev.key)
  if (!def) return
  let value: unknown = def.defaults
  try {
    const parsed = blockSchema(def).safeParse(JSON.parse(rev.value))
    if (parsed.success) value = parsed.data
  } catch {}
  await writeBlock(rev.key, value, admin.email)
  await audit(admin, 'content.restore', { type: 'content', id: rev.key }, `${def.title} · versi #${rev.id}`)
  revalidatePath('/', 'layout')
  redirect(`/admin/halaman/${encodeURIComponent(rev.key)}?dipulihkan=${Date.now()}`)
}

export async function resetContentBlock(key: string) {
  const admin = await requireAdmin('content.manage')
  const def = getBlockDef(key)
  if (!def) return
  await writeBlock(key, def.defaults, admin.email)
  await audit(admin, 'content.reset', { type: 'content', id: key }, def.title)
  revalidatePath('/', 'layout')
  redirect(`/admin/halaman/${encodeURIComponent(key)}?direset=${Date.now()}`)
}

/* ============================ PUSTAKA MEDIA ============================ */

export async function deleteMedia(id: string, _prev: ActionResult, _fd: FormData): Promise<ActionResult> {
  const admin = await requireAdmin('content.manage')
  if (!isMediaId(id)) return fail('ID tidak valid.')
  const usage = await mediaUsage(id)
  if (usage.length) return fail(`Gambar masih dipakai di ${usage.join(', ')}. Ganti dulu di sana sebelum menghapus.`)
  const db = await getDb()
  const row = await db.delete(schema.media).where(eq(schema.media.id, id)).returning({ fileName: schema.media.fileName }).get()
  if (row) await audit(admin, 'media.delete', { type: 'media', id }, row.fileName)
  refreshAdmin()
  return { ok: true, message: 'Gambar dihapus.' }
}
