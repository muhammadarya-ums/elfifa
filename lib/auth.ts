import 'server-only'

import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { eq, lt, sql } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getDb, schema } from './db'
import type { Admin } from './db/schema'
import { can, type Permission } from './permissions'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>

const isProd = process.env.NODE_ENV === 'production'
/**
 * Prefix __Host- (produksi): cookie wajib Secure, path=/, tanpa Domain —
 * tidak bisa ditimpa subdomain lain.
 */
const COOKIE = isProd ? '__Host-elfifa_admin' : 'elfifa_admin'
const SESSION_HOURS = 12

/* ============================ PASSWORD ============================ */

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, 64)
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, saltB64, hashB64] = stored.split('$')
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false
  const expected = Buffer.from(hashB64, 'base64')
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length)
  return timingSafeEqual(expected, actual)
}

/** Hash tiruan untuk menyamakan waktu respons saat email tidak ditemukan (anti user-enumeration). */
let dummyHash: Promise<string> | undefined
export function dummyPasswordHash() {
  return (dummyHash ??= hashPassword(randomBytes(16).toString('hex')))
}

/* ============================ SESSION ============================ */

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret && secret.length >= 32) return secret
  if (isProd) {
    throw new Error('AUTH_SECRET belum di-set (minimal 32 karakter). Tambahkan di Environment Variables.')
  }
  return 'dev-only-insecure-secret-change-me-0000000'
}

/**
 * Versi sesi: berubah bila password diganti, admin logout, atau peran/status akun diubah,
 * sehingga cookie lama otomatis tidak berlaku lagi.
 */
function sessionVersion(admin: Pick<Admin, 'passwordHash' | 'sessionVersion'>) {
  return createHash('sha256').update(`${admin.passwordHash}:${admin.sessionVersion}`).digest('base64url').slice(0, 16)
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export async function createSession(admin: Admin) {
  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000
  const payload = `${admin.id}.${exp}.${sessionVersion(admin)}`
  const store = await cookies()
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: new Date(exp),
  })
}

/** Batalkan semua sesi admin tertentu di perangkat mana pun. */
export async function revokeSessions(adminId: number) {
  const db = await getDb()
  await db
    .update(schema.admins)
    .set({ sessionVersion: sql`${schema.admins.sessionVersion} + 1` })
    .where(eq(schema.admins.id, adminId))
}

/** Logout: hapus cookie & batalkan semua sesi admin ini. */
export async function destroySession() {
  const admin = await getCurrentAdmin()
  if (admin) await revokeSessions(admin.id)
  const store = await cookies()
  store.delete(COOKIE)
}

/** Admin yang sedang login, atau null. Di-cache per request. */
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 4) return null
  const [id, exp, version, sig] = parts
  if (!safeEqual(sig, sign(`${id}.${exp}.${version}`))) return null
  if (Number(exp) < Date.now()) return null

  const db = await getDb()
  const admin = await db.select().from(schema.admins).where(eq(schema.admins.id, Number(id))).get()
  if (!admin || !admin.isActive || sessionVersion(admin) !== version) return null
  return admin
})

/** Wajib dipanggil di setiap halaman & server action admin. */
export async function requireAdmin(permission?: Permission) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
  if (permission && !can(admin.role, permission)) redirect('/admin/tidak-diizinkan')
  return admin
}

/* ============================ BOOTSTRAP ============================ */

/**
 * Kredensial admin pertama. Dipakai HANYA saat tabel admin masih kosong.
 * Produksi: wajib lewat env ADMIN_EMAIL & ADMIN_PASSWORD.
 * Development: default admin@elfifa.id / admin12345.
 */
export function bootstrapCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (email && password) return { email, password, fromEnv: true }
  if (!isProd) return { email: 'admin@elfifa.id', password: 'admin12345', fromEnv: false }
  return null
}

/* ============================ RATE LIMIT ============================ */

/**
 * Rate limit berbasis database: atomik (satu query UPSERT) dan berlaku
 * lintas instance serverless.
 * @returns jumlah percobaan dalam jendela waktu saat ini & apakah masih diizinkan
 */
export async function rateLimit(key: string, max: number, windowMs: number) {
  const db = await getDb()
  const now = Date.now()
  const t = schema.rateLimits
  const row = await db
    .insert(t)
    .values({ key, count: 1, resetAt: now + windowMs })
    .onConflictDoUpdate({
      target: t.key,
      set: {
        count: sql`case when ${t.resetAt} < ${now} then 1 else ${t.count} + 1 end`,
        resetAt: sql`case when ${t.resetAt} < ${now} then ${now + windowMs} else ${t.resetAt} end`,
      },
    })
    .returning({ count: t.count, resetAt: t.resetAt })
    .get()

  // Bersihkan entri kedaluwarsa sesekali
  if (Math.random() < 0.02) {
    await db.delete(t).where(lt(t.resetAt, now - 24 * 60 * 60 * 1000))
  }
  return { allowed: row.count <= max, count: row.count, retryAfterMs: Math.max(0, row.resetAt - now) }
}

export async function resetRateLimit(key: string) {
  const db = await getDb()
  await db.delete(schema.rateLimits).where(eq(schema.rateLimits.key, key))
}

export async function clientIp() {
  const h = await headers()
  return h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
