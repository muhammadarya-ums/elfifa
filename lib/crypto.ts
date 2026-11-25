import 'server-only'

import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto'

function masterSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET belum di-set (minimal 32 karakter).')
  return 'dev-only-insecure-secret-change-me-0000000'
}

/** Kunci turunan per keperluan (HKDF), sehingga satu kunci bocor tidak membuka keperluan lain. */
function deriveKey(purpose: string) {
  return Buffer.from(hkdfSync('sha256', masterSecret(), 'elfifa', purpose, 32))
}

/** Enkripsi AES-256-GCM (rahasia + integritas). Format: v1.<iv>.<tag>.<ciphertext> base64url */
export function encryptSecret(plain: string, purpose: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(purpose), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), enc.toString('base64url')].join('.')
}

export function decryptSecret(payload: string, purpose: string) {
  const [v, iv, tag, enc] = payload.split('.')
  if (v !== 'v1' || !iv || !tag || !enc) throw new Error('Format rahasia tidak dikenal')
  const decipher = createDecipheriv('aes-256-gcm', deriveKey(purpose), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(enc, 'base64url')), decipher.final()]).toString('utf8')
}

export function sha256(text: string) {
  return createHash('sha256').update(text).digest('hex')
}

export function safeEqualStr(a: string, b: string) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}
