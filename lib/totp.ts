import { createHmac, randomBytes } from 'node:crypto'

/**
 * TOTP (RFC 6238) — kompatibel Google Authenticator, Authy, Microsoft Authenticator, 1Password.
 * SHA-1, 6 digit, periode 30 detik.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const PERIOD = 30

export function base32Encode(buf: Buffer) {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(str: string) {
  const clean = str.replace(/=+$/, '').toUpperCase().replace(/\s/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch)
    if (idx < 0) throw new Error('Base32 tidak valid')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

export const generateTotpSecret = () => base32Encode(randomBytes(20))
export const isTotpSecret = (s: string) => /^[A-Z2-7]{32}$/.test(s)

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / PERIOD)

export function totpAt(secret: string, step: number) {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const bin = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(bin % 1_000_000).padStart(6, '0')
}

/**
 * Verifikasi kode dengan toleransi ±1 periode (selisih jam HP).
 * Kode dengan step ≤ lastStep ditolak → mencegah kode yang sama dipakai ulang (replay).
 * @returns step yang cocok, atau null
 */
export function verifyTotp(secret: string, code: string, lastStep = 0, now = Date.now()) {
  const clean = code.replace(/\s/g, '')
  if (!/^\d{6}$/.test(clean)) return null
  const step = currentStep(now)
  for (const s of [step - 1, step, step + 1]) {
    if (s > lastStep && totpAt(secret, s) === clean) return s
  }
  return null
}

export function otpauthUri(secret: string, account: string, issuer = 'Elfifa Admin') {
  const label = encodeURIComponent(`${issuer}:${account}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${PERIOD}`
}

/** 10 kode cadangan, format XXXX-XXXX (tanpa huruf yang mirip angka). */
export function generateRecoveryCodes() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 10 }, () => {
    const bytes = randomBytes(8)
    const s = Array.from(bytes, (b) => chars[b % chars.length]).join('')
    return `${s.slice(0, 4)}-${s.slice(4)}`
  })
}

export const normalizeRecoveryCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '')
