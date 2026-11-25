import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import Markdown from '@/components/markdown'
import { blockSchema } from '@/lib/content'
import { getBlockDef, isAllowedImageUrl } from '@/lib/content-def'
import { decryptSecret, encryptSecret } from '@/lib/crypto'
import { MediaError, processImage } from '@/lib/media'
import { base32Encode, generateRecoveryCodes, totpAt, verifyTotp } from '@/lib/totp'

describe('TOTP (RFC 6238)', () => {
  // Vektor uji resmi RFC 6238 (SHA-1, seed "12345678901234567890"), 6 digit terakhir
  const secret = base32Encode(Buffer.from('12345678901234567890'))
  it.each([
    [59, '287082'],
    [1111111109, '081804'],
    [1234567890, '005924'],
    [2000000000, '279037'],
  ])('t=%i → %s', (t, code) => {
    expect(totpAt(secret, Math.floor(t / 30))).toBe(code)
  })

  it('menerima selisih ±30 detik & menolak kode yang sudah dipakai', () => {
    const now = 1_700_000_000_000
    const step = Math.floor(now / 30_000)
    const code = totpAt(secret, step)
    expect(verifyTotp(secret, code, 0, now)).toBe(step)
    expect(verifyTotp(secret, code, 0, now + 30_000)).toBe(step)
    expect(verifyTotp(secret, code, step, now)).toBeNull() // replay
    expect(verifyTotp(secret, '000000', 0, now)).toBeNull()
    expect(verifyTotp(secret, 'abc123', 0, now)).toBeNull()
  })

  it('kode cadangan unik & berformat XXXX-XXXX', () => {
    const codes = generateRecoveryCodes()
    expect(codes).toHaveLength(10)
    expect(new Set(codes).size).toBe(10)
    codes.forEach((c) => expect(c).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/))
  })
})

describe('enkripsi rahasia (AES-256-GCM)', () => {
  it('bolak-balik & IV acak', () => {
    const a = encryptSecret('RAHASIA', 'uji')
    const b = encryptSecret('RAHASIA', 'uji')
    expect(a).not.toBe(b)
    expect(decryptSecret(a, 'uji')).toBe('RAHASIA')
  })

  it('menolak data yang dimodifikasi atau keperluan berbeda', () => {
    const enc = encryptSecret('RAHASIA', 'uji')
    const parts = enc.split('.')
    const tampered = [...parts.slice(0, 3), Buffer.from('XXXXXXX').toString('base64url')].join('.')
    expect(() => decryptSecret(tampered, 'uji')).toThrow()
    expect(() => decryptSecret(enc, 'keperluan-lain')).toThrow()
  })
})

describe('Markdown aman', () => {
  const html = (src: string) => renderToStaticMarkup(<Markdown source={src} />)

  it('merender format dasar', () => {
    const out = html('## Judul\n\nTeks **tebal** dan [tautan](https://elfifa.id).\n\n- satu\n- dua')
    expect(out).toContain('<h2>Judul</h2>')
    expect(out).toContain('<strong>tebal</strong>')
    expect(out).toContain('href="https://elfifa.id"')
    expect(out).toContain('rel="noopener noreferrer nofollow"')
    expect(out).toContain('<li>dua</li>')
  })

  it('tidak pernah menghasilkan HTML/skrip dari input', () => {
    const out = html('<script>alert(1)</script>\n\n[klik](javascript:alert(1)) [x](data:text/html,1) [y](//evil.com)')
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
    expect(out).not.toMatch(/href="(javascript|data):/i)
    expect(out).not.toContain('href="//evil.com"')
  })
})

describe('validasi konten CMS', () => {
  it('hanya menerima gambar dari sumber yang diizinkan', () => {
    expect(isAllowedImageUrl('/media/AbCdEf123456')).toBe(true)
    expect(isAllowedImageUrl('/galeri/jamaah1.webp')).toBe(true)
    expect(isAllowedImageUrl('https://evil.example/pixel.png')).toBe(false)
    expect(isAllowedImageUrl('javascript:alert(1)')).toBe(false)
    expect(isAllowedImageUrl('/media/../../etc/passwd')).toBe(false)
  })

  it('nilai bawaan setiap blok lolos validasinya sendiri', () => {
    for (const key of ['home.hero', 'home.gallery', 'kbihu.asatidz', 'legal.privacy']) {
      const def = getBlockDef(key)!
      expect(blockSchema(def).safeParse(def.defaults).success, key).toBe(true)
    }
  })

  it('menolak field asing, teks terlalu panjang, & gambar luar', () => {
    const def = getBlockDef('home.hero')!
    const schema = blockSchema(def)
    expect(schema.safeParse({ ...def.defaults, injected: 'x' }).success).toBe(false)
    expect(schema.safeParse({ ...def.defaults, eyebrow: 'x'.repeat(61) }).success).toBe(false)
    expect(schema.safeParse({ ...def.defaults, image: 'https://evil.example/a.jpg' }).success).toBe(false)
  })
})

describe('upload gambar', () => {
  it('menolak file yang bukan gambar & SVG', async () => {
    await expect(processImage(Buffer.from('<?php system($_GET[1]); ?>'))).rejects.toBeInstanceOf(MediaError)
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)" width="10" height="10"/>')
    await expect(processImage(svg)).rejects.toBeInstanceOf(MediaError)
  })

  it('meng-encode ulang ke WebP, memperkecil, & membuang metadata EXIF/GPS', async () => {
    const jpeg = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#007a82' } })
      .withExif({ IFD0: { Make: 'Kamera', Copyright: 'rahasia' } })
      .jpeg()
      .toBuffer()
    expect((await sharp(jpeg).metadata()).exif).toBeDefined()
    const out = await processImage(jpeg)
    expect(out.mime).toBe('image/webp')
    expect(Math.max(out.width, out.height)).toBe(2400)
    const meta = await sharp(out.data).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.exif).toBeUndefined()
  })
})
