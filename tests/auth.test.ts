import { describe, expect, it } from 'vitest'
import { hashPassword, rateLimit, resetRateLimit, verifyPassword } from '@/lib/auth'

describe('password', () => {
  it('hash scrypt dengan salt unik & verifikasi benar', async () => {
    const a = await hashPassword('rahasia-123')
    const b = await hashPassword('rahasia-123')
    expect(a).not.toBe(b)
    expect(a.startsWith('scrypt$')).toBe(true)
    expect(await verifyPassword('rahasia-123', a)).toBe(true)
    expect(await verifyPassword('salah', a)).toBe(false)
  })

  it('menolak format hash yang tidak dikenal', async () => {
    expect(await verifyPassword('x', 'md5$abc')).toBe(false)
  })
})

describe('rateLimit (database)', () => {
  it('mengizinkan hingga batas lalu menolak', async () => {
    const key = `test:${Date.now()}`
    const results = []
    for (let i = 0; i < 4; i++) results.push((await rateLimit(key, 3, 60_000)).allowed)
    expect(results).toEqual([true, true, true, false])
  })

  it('jendela waktu kedaluwarsa → dihitung ulang dari 1', async () => {
    const key = `test-window:${Date.now()}`
    await rateLimit(key, 1, 30)
    expect((await rateLimit(key, 1, 30)).allowed).toBe(false)
    await new Promise((r) => setTimeout(r, 60))
    const again = await rateLimit(key, 1, 30)
    expect(again.allowed).toBe(true)
    expect(again.count).toBe(1)
  })

  it('reset menghapus penghitung', async () => {
    const key = `test-reset:${Date.now()}`
    await rateLimit(key, 1, 60_000)
    await resetRateLimit(key)
    expect((await rateLimit(key, 1, 60_000)).allowed).toBe(true)
  })

  it('aman terhadap permintaan bersamaan (atomik)', async () => {
    const key = `test-concurrent:${Date.now()}`
    const results = await Promise.all(Array.from({ length: 10 }, () => rateLimit(key, 5, 60_000)))
    expect(results.filter((r) => r.allowed)).toHaveLength(5)
    expect(Math.max(...results.map((r) => r.count))).toBe(10)
  })
})
