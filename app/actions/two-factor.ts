'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { audit } from '@/lib/audit'
import {
  clearPendingTwoFactor,
  clientIp,
  createSession,
  rateLimit,
  readPendingTwoFactor,
  REQUIRE_2FA_KEY,
  requireAdmin,
  resetRateLimit,
  revokeSessions,
  verifyPassword,
} from '@/lib/auth'
import { decryptSecret, encryptSecret, sha256 } from '@/lib/crypto'
import { getDb, schema } from '@/lib/db'
import { generateRecoveryCodes, generateTotpSecret, isTotpSecret, normalizeRecoveryCode, otpauthUri, verifyTotp } from '@/lib/totp'

const PURPOSE = 'totp-secret'
const MAX_2FA_FAILURES = 5

/** Dekripsi aman: gagal (mis. AUTH_SECRET diganti) → null, bukan crash. */
function readSecret(enc: string) {
  try {
    return decryptSecret(enc, PURPOSE)
  } catch {
    return null
  }
}

export type TotpSetupState =
  | { step: 'idle'; error?: string }
  | { step: 'scan'; secret: string; qr: string; error?: string }
  | { step: 'done'; recoveryCodes: string[] }

/* ============================ VERIFIKASI SAAT LOGIN ============================ */

export async function verifyTwoFactor(_prev: { error: string } | null, fd: FormData): Promise<{ error: string } | null> {
  const ip = await clientIp()
  if (!(await rateLimit(`2fa-ip:${ip}`, 30, 15 * 60 * 1000)).allowed) return { error: 'Terlalu banyak percobaan. Coba lagi nanti.' }

  const admin = await readPendingTwoFactor()
  if (!admin) redirect('/admin/login?sesi=habis')

  const failKey = `2fa-fail:${admin.id}`
  const db = await getDb()
  const lock = await db.select().from(schema.rateLimits).where(eq(schema.rateLimits.key, failKey)).get()
  if (lock && lock.count >= MAX_2FA_FAILURES && lock.resetAt > Date.now()) {
    return { error: 'Terlalu banyak kode salah. Akun dikunci sementara 15 menit.' }
  }

  const code = String(fd.get('code') ?? '').trim()
  let ok = false
  let usedRecovery = false

  const secret = readSecret(admin.totpSecret!)
  if (/^\d{3}\s?\d{3}$/.test(code)) {
    if (!secret) return { error: 'Konfigurasi 2FA akun ini tidak dapat dibaca. Gunakan kode cadangan atau minta Pemilik mereset 2FA Anda.' }
    const step = verifyTotp(secret, code, admin.totpLastStep)
    if (step) {
      await db.update(schema.admins).set({ totpLastStep: step }).where(eq(schema.admins.id, admin.id))
      ok = true
    }
  } else if (code) {
    const hashes: string[] = JSON.parse(admin.recoveryCodes || '[]')
    const h = sha256(normalizeRecoveryCode(code))
    if (hashes.includes(h)) {
      // Kode cadangan sekali pakai
      await db
        .update(schema.admins)
        .set({ recoveryCodes: JSON.stringify(hashes.filter((x) => x !== h)) })
        .where(eq(schema.admins.id, admin.id))
      ok = true
      usedRecovery = true
    }
  }

  if (!ok) {
    const r = await rateLimit(failKey, MAX_2FA_FAILURES, 15 * 60 * 1000)
    await audit(admin, 'auth.2fa_failed', { type: 'admin', id: admin.id }, `percobaan ke-${r.count}`)
    return { error: 'Kode tidak valid atau sudah dipakai.' }
  }

  await resetRateLimit(failKey)
  await clearPendingTwoFactor()
  await db.update(schema.admins).set({ lastLoginAt: new Date() }).where(eq(schema.admins.id, admin.id))
  const fresh = await db.select().from(schema.admins).where(eq(schema.admins.id, admin.id)).get()
  await createSession(fresh!)
  await audit(admin, usedRecovery ? 'auth.recovery_used' : 'auth.login', { type: 'admin', id: admin.id }, usedRecovery ? 'dengan kode cadangan' : 'dengan 2FA')
  const next = String(fd.get('next') ?? '')
  redirect(/^\/admin(\/[\w\-/]*)?$/.test(next) ? next : '/admin')
}

/* ============================ AKTIVASI ============================ */

export async function totpSetup(prev: TotpSetupState, fd: FormData): Promise<TotpSetupState> {
  const admin = await requireAdmin(undefined, { allowWithout2fa: true })
  if (admin.totpSecret) return { step: 'idle', error: '2FA sudah aktif.' }
  if (!(await rateLimit(`2fa-setup:${admin.id}`, 15, 15 * 60 * 1000)).allowed) {
    return { ...prev, error: 'Terlalu banyak percobaan. Coba lagi nanti.' } as TotpSetupState
  }

  const password = String(fd.get('password') ?? '')
  if (!(await verifyPassword(password, admin.passwordHash))) {
    return { ...(prev.step === 'scan' ? prev : { step: 'idle' as const }), error: 'Password salah.' }
  }

  // Langkah 1: buat rahasia baru & tampilkan QR
  if (prev.step !== 'scan') {
    const secret = generateTotpSecret()
    const qr = await QRCode.toDataURL(otpauthUri(secret, admin.email), { margin: 1, width: 232, errorCorrectionLevel: 'M' })
    return { step: 'scan', secret, qr }
  }

  // Langkah 2: konfirmasi dengan kode dari aplikasi
  const secret = String(fd.get('secret') ?? '')
  if (!isTotpSecret(secret) || secret !== prev.secret) return { step: 'idle', error: 'Sesi aktivasi tidak valid. Mulai lagi.' }
  const step = verifyTotp(secret, String(fd.get('code') ?? ''))
  if (!step) return { ...prev, error: 'Kode tidak cocok. Pastikan jam HP akurat lalu coba lagi.' }

  const codes = generateRecoveryCodes()
  const db = await getDb()
  await db
    .update(schema.admins)
    .set({
      totpSecret: encryptSecret(secret, PURPOSE),
      totpLastStep: step,
      recoveryCodes: JSON.stringify(codes.map((c) => sha256(normalizeRecoveryCode(c)))),
    })
    .where(eq(schema.admins.id, admin.id))
  // Keluarkan sesi di perangkat lain, perbarui sesi ini
  await revokeSessions(admin.id)
  const fresh = await db.select().from(schema.admins).where(eq(schema.admins.id, admin.id)).get()
  await createSession(fresh!)
  await audit(admin, 'auth.2fa_enabled', { type: 'admin', id: admin.id })
  revalidatePath('/admin', 'layout')
  return { step: 'done', recoveryCodes: codes }
}

/* ============================ NONAKTIFKAN & RESET ============================ */

export async function disableTotp(_prev: { error?: string; ok?: boolean } | null, fd: FormData) {
  const admin = await requireAdmin(undefined, { allowWithout2fa: true })
  if (!admin.totpSecret) return { error: '2FA belum aktif.' }
  if (!(await rateLimit(`2fa-disable:${admin.id}`, 10, 15 * 60 * 1000)).allowed) return { error: 'Terlalu banyak percobaan.' }
  if (!(await verifyPassword(String(fd.get('password') ?? ''), admin.passwordHash))) return { error: 'Password salah.' }
  const secret = readSecret(admin.totpSecret)
  const step = secret ? verifyTotp(secret, String(fd.get('code') ?? ''), admin.totpLastStep) : null
  if (!step) return { error: 'Kode 2FA tidak valid.' }

  const db = await getDb()
  await db.update(schema.admins).set({ totpSecret: null, totpLastStep: 0, recoveryCodes: '[]' }).where(eq(schema.admins.id, admin.id))
  await revokeSessions(admin.id)
  const fresh = await db.select().from(schema.admins).where(eq(schema.admins.id, admin.id)).get()
  await createSession(fresh!)
  await audit(admin, 'auth.2fa_disabled', { type: 'admin', id: admin.id })
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/** Pemilik mereset 2FA admin lain (mis. HP hilang). Admin tersebut langsung keluar dari semua perangkat. */
export async function resetAdminTotp(id: number) {
  const me = await requireAdmin('admins.manage')
  if (me.id === id) return
  const db = await getDb()
  const target = await db.select().from(schema.admins).where(eq(schema.admins.id, id)).get()
  if (!target?.totpSecret) return
  await db.update(schema.admins).set({ totpSecret: null, totpLastStep: 0, recoveryCodes: '[]' }).where(eq(schema.admins.id, id))
  await revokeSessions(id)
  await audit(me, 'auth.2fa_reset', { type: 'admin', id }, target.email)
  revalidatePath('/admin', 'layout')
}

/** Pemilik mewajibkan (atau tidak) 2FA untuk seluruh admin. */
export async function setRequireTwoFactor(fd: FormData) {
  const me = await requireAdmin('admins.manage')
  const on = fd.get('require') === 'on'
  if (on && !me.totpSecret) return // aktifkan 2FA sendiri dulu agar tidak terkunci
  const db = await getDb()
  await db
    .insert(schema.settings)
    .values({ key: REQUIRE_2FA_KEY, value: on ? 'ya' : 'tidak', updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: on ? 'ya' : 'tidak', updatedAt: new Date() } })
  await audit(me, 'settings.update', { type: 'settings' }, `wajib 2FA: ${on ? 'ya' : 'tidak'}`)
  revalidatePath('/admin', 'layout')
}
