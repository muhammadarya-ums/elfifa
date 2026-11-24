import 'server-only'

import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getDb, schema } from './db'
import type { Admin } from './db/schema'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>

const COOKIE = 'elfifa_admin'
const SESSION_DAYS = 7

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

/* ============================ SESSION ============================ */

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret && secret.length >= 16) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET belum di-set (minimal 16 karakter). Tambahkan di Environment Variables.')
  }
  return 'dev-only-insecure-secret-change-me'
}

/**
 * Versi sesi: berubah bila password diganti atau admin logout,
 * sehingga cookie lama otomatis tidak berlaku lagi.
 */
function sessionVersion(admin: Pick<Admin, 'passwordHash' | 'sessionVersion'>) {
  return createHash('sha256').update(`${admin.passwordHash}:${admin.sessionVersion}`).digest('base64url').slice(0, 12)
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
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `${admin.id}.${exp}.${sessionVersion(admin)}`
  const store = await cookies()
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(exp),
  })
}

/** Logout: hapus cookie & batalkan semua sesi admin ini di perangkat mana pun. */
export async function destroySession() {
  const admin = await getCurrentAdmin()
  if (admin) {
    const db = await getDb()
    await db
      .update(schema.admins)
      .set({ sessionVersion: admin.sessionVersion + 1 })
      .where(eq(schema.admins.id, admin.id))
  }
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
  if (!admin || sessionVersion(admin) !== version) return null
  return admin
})

/** Wajib dipanggil di setiap halaman & server action admin. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
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
  if (process.env.NODE_ENV !== 'production') {
    return { email: 'admin@elfifa.id', password: 'admin12345', fromEnv: false }
  }
  return null
}

/* ============================ RATE LIMIT ============================ */

const buckets = new Map<string, { count: number; resetAt: number }>()

/**
 * Pembatas sederhana di memori (per instance). Cukup untuk menahan spam/brute-force ringan.
 * @returns true bila masih diizinkan
 */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k)
    }
    return true
  }
  bucket.count += 1
  return bucket.count <= max
}

export async function clientIp() {
  const { headers } = await import('next/headers')
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}
