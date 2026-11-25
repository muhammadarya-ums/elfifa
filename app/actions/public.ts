'use server'

import { randomInt } from 'node:crypto'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { clientIp, rateLimit } from '@/lib/auth'
import { getPackageBySlug, getPaymentsTotal, getSettings } from '@/lib/data'
import { getDb, schema } from '@/lib/db'
import { PROGRAMS, type Program, type RegistrationStatus } from '@/lib/db/schema'
import { displayPhone, formatRupiah, normalizePhone, waLink } from '@/lib/format'
import { PROGRAM_LABELS } from '@/lib/labels'

/* ============================ PENDAFTARAN ============================ */

const registrationSchema = z.object({
  program: z.enum(PROGRAMS),
  packageSlug: z.string().trim().optional(),
  fullName: z.string().trim().min(3, 'Nama minimal 3 huruf').max(100),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((v) => /^62\d{8,13}$/.test(v), 'Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx)'),
  email: z.union([z.literal(''), z.email('Format email tidak valid')]).default(''),
  city: z.string().trim().max(60).default(''),
  pax: z.coerce.number().int().min(1, 'Minimal 1 orang').max(20, 'Maksimal 20 orang per pendaftaran'),
  hasPassport: z.enum(['ya', 'tidak']).default('tidak'),
  message: z.string().trim().max(1000).default(''),
  consent: z.literal('on', { error: 'Anda perlu menyetujui kebijakan privasi' }),
})

export type RegistrationState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[] | undefined> }
  | { status: 'success'; code: string; name: string; programLabel: string; waUrl: string }

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(program: Program) {
  const prefix = program === 'umroh' ? 'ELF' : 'KBH'
  let s = ''
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return `${prefix}-${s}`
}

function str(formData: FormData, key: string) {
  const v = formData.get(key)
  return typeof v === 'string' ? v : undefined
}

export async function submitRegistration(_prev: RegistrationState, formData: FormData): Promise<RegistrationState> {
  // Honeypot anti-bot: field tersembunyi yang tidak diisi manusia
  if (str(formData, 'website')) {
    return { status: 'error', message: 'Pendaftaran gagal diproses.' }
  }

  const ip = await clientIp()
  if (!(await rateLimit(`reg:${ip}`, 5, 10 * 60 * 1000)).allowed) {
    return { status: 'error', message: 'Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi atau hubungi kami via WhatsApp.' }
  }

  const parsed = registrationSchema.safeParse({
    program: str(formData, 'program'),
    packageSlug: str(formData, 'packageSlug') || undefined,
    fullName: str(formData, 'fullName') ?? '',
    phone: str(formData, 'phone') ?? '',
    email: str(formData, 'email') ?? '',
    city: str(formData, 'city') ?? '',
    pax: str(formData, 'pax') ?? '1',
    hasPassport: str(formData, 'hasPassport') ?? 'tidak',
    message: str(formData, 'message') ?? '',
    consent: str(formData, 'consent'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Mohon periksa kembali data yang Anda isi.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const data = parsed.data
  let packageId: number | null = null
  let totalPriceIdr = 0
  let packageName = ''

  if (data.program === 'umroh') {
    if (!data.packageSlug) {
      return { status: 'error', message: 'Silakan pilih paket umroh.', fieldErrors: { packageSlug: ['Pilih paket'] } }
    }
    const pkg = await getPackageBySlug(data.packageSlug)
    if (!pkg) return { status: 'error', message: 'Paket tidak ditemukan atau sudah tidak tersedia.' }
    if (pkg.seatsLeft < data.pax) {
      return {
        status: 'error',
        message:
          pkg.seatsLeft === 0
            ? 'Mohon maaf, kuota paket ini sudah penuh. Silakan pilih paket lain atau hubungi kami.'
            : `Sisa kursi paket ini tinggal ${pkg.seatsLeft}. Kurangi jumlah jamaah atau hubungi kami.`,
      }
    }
    packageId = pkg.id
    packageName = pkg.name
    totalPriceIdr = pkg.priceIdr * data.pax
  }

  const db = await getDb()
  let code = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateCode(data.program)
    try {
      await db.insert(schema.registrations).values({
        code,
        program: data.program,
        packageId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email.toLowerCase(),
        city: data.city,
        pax: data.pax,
        hasPassport: data.hasPassport === 'ya',
        message: data.message,
        totalPriceIdr,
        consentAt: new Date(),
      })
      break
    } catch (err) {
      if (attempt === 4 || !String(err).includes('UNIQUE')) {
        console.error('[registration] insert failed', err)
        return { status: 'error', message: 'Terjadi kesalahan pada server. Silakan coba lagi atau hubungi kami via WhatsApp.' }
      }
    }
  }

  revalidatePath('/admin', 'layout')

  const settings = await getSettings()
  const isUmroh = data.program === 'umroh'
  const waNumber = isUmroh ? settings.travel_whatsapp : settings.kbihu_whatsapp
  const programLabel = isUmroh ? packageName : PROGRAM_LABELS[data.program]
  const waUrl = waLink(
    waNumber,
    `Assalamu'alaikum, saya ${data.fullName} sudah mendaftar ${programLabel} dengan kode pendaftaran ${code}. Mohon informasi langkah selanjutnya.`,
  )

  return { status: 'success', code, name: data.fullName, programLabel, waUrl }
}

/* ============================ CEK STATUS ============================ */

export type StatusResult = {
  code: string
  fullName: string
  programLabel: string
  packageName: string | null
  departureDate: string | null
  pax: number
  status: RegistrationStatus
  createdAt: string
  totalPriceIdr: number
  paidIdr: number
  payments: { paidOn: string; amount: string }[]
  phone: string
}

export type StatusState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'found'; result: StatusResult }

export async function checkStatus(_prev: StatusState, formData: FormData): Promise<StatusState> {
  const ip = await clientIp()
  if (!(await rateLimit(`status:${ip}`, 20, 10 * 60 * 1000)).allowed) {
    return { status: 'error', message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }
  }

  const code = (str(formData, 'code') ?? '').trim().toUpperCase()
  const phone = normalizePhone(str(formData, 'phone') ?? '')
  if (!/^(ELF|KBH)-[A-Z0-9]{6}$/.test(code) || phone.length < 10) {
    return { status: 'error', message: 'Masukkan kode pendaftaran (contoh: ELF-AB12CD) dan nomor WhatsApp yang didaftarkan.' }
  }

  const db = await getDb()
  const row = await db
    .select({ reg: schema.registrations, pkg: schema.packages })
    .from(schema.registrations)
    .leftJoin(schema.packages, eq(schema.packages.id, schema.registrations.packageId))
    .where(and(eq(schema.registrations.code, code), eq(schema.registrations.phone, phone)))
    .get()

  if (!row) {
    return { status: 'error', message: 'Data tidak ditemukan. Pastikan kode dan nomor WhatsApp sesuai dengan saat mendaftar.' }
  }

  const { reg, pkg } = row
  const paymentRows = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.registrationId, reg.id))
    .orderBy(asc(schema.payments.paidOn))

  return {
    status: 'found',
    result: {
      code: reg.code,
      fullName: reg.fullName,
      programLabel: PROGRAM_LABELS[reg.program],
      packageName: pkg?.name ?? null,
      departureDate: pkg?.departureDate ?? null,
      pax: reg.pax,
      status: reg.status,
      createdAt: reg.createdAt.toISOString(),
      totalPriceIdr: reg.totalPriceIdr,
      paidIdr: await getPaymentsTotal(reg.id),
      payments: paymentRows.map((p) => ({ paidOn: p.paidOn, amount: formatRupiah(p.amountIdr) })),
      phone: displayPhone(reg.phone),
    },
  }
}
