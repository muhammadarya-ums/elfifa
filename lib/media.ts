import 'server-only'

import { randomBytes } from 'node:crypto'
import { eq, like, or } from 'drizzle-orm'
import sharp from 'sharp'
import { getDb, schema } from './db'

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
/** Format yang diterima. SVG sengaja ditolak (dapat memuat skrip). */
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'heif', 'gif', 'tiff'])
const MAX_EDGE = 2400

export class MediaError extends Error {}

/**
 * Proses upload dengan aman:
 * 1. Format dideteksi dari ISI file (bukan nama/ekstensi/Content-Type dari browser).
 * 2. Gambar di-decode lalu di-encode ULANG ke WebP — payload tersembunyi (polyglot)
 *    dan seluruh metadata (EXIF, lokasi GPS) ikut terbuang.
 * 3. Batas piksel mencegah "decompression bomb".
 */
export async function processImage(input: Buffer) {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new MediaError('Ukuran file maksimal 8 MB.')
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>
  try {
    meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata()
  } catch {
    throw new MediaError('File bukan gambar yang valid.')
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new MediaError('Format tidak didukung. Gunakan JPG, PNG, WebP, AVIF, atau HEIC.')
  }
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 60_000_000, animated: false })
      .rotate() // ikuti orientasi kamera, lalu metadata dibuang
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true })
    return { data, width: info.width, height: info.height, bytes: data.byteLength, mime: 'image/webp' }
  } catch {
    throw new MediaError('Gambar tidak dapat diproses. Coba simpan ulang sebagai JPG.')
  }
}

export async function saveMedia(input: Buffer, fileName: string, uploadedBy: string) {
  const img = await processImage(input)
  const id = randomBytes(12).toString('base64url')
  const db = await getDb()
  await db.insert(schema.media).values({
    id,
    fileName: fileName.replace(/[^\w.\- ]/g, '').slice(0, 120) || 'gambar',
    mime: img.mime,
    width: img.width,
    height: img.height,
    bytes: img.bytes,
    data: img.data,
    uploadedBy,
  })
  return { id, url: mediaUrl(id), width: img.width, height: img.height, bytes: img.bytes }
}

export const mediaUrl = (id: string) => `/media/${id}`

/** ID media hanya huruf, angka, - dan _ (mencegah input aneh pada lookup). */
export const isMediaId = (id: string) => /^[\w-]{8,40}$/.test(id)

/** Di mana saja sebuah media dipakai — untuk mencegah penghapusan gambar yang masih tampil. */
export async function mediaUsage(id: string) {
  const db = await getDb()
  const url = mediaUrl(id)
  const [blocks, pkgs] = await Promise.all([
    db.select({ key: schema.contentBlocks.key }).from(schema.contentBlocks).where(like(schema.contentBlocks.value, `%${url}%`)),
    db
      .select({ name: schema.packages.name })
      .from(schema.packages)
      .where(or(eq(schema.packages.imageUrl, url), like(schema.packages.imageUrl, `%${url}%`))),
  ])
  return [...blocks.map((b) => `konten "${b.key}"`), ...pkgs.map((p) => `paket "${p.name}"`)]
}

/** Daftar media untuk pustaka/pemilih — tanpa kolom data biner. */
export async function listMedia(limit = 300) {
  const { desc } = await import('drizzle-orm')
  const db = await getDb()
  const rows = await db
    .select({
      id: schema.media.id,
      fileName: schema.media.fileName,
      width: schema.media.width,
      height: schema.media.height,
      bytes: schema.media.bytes,
      uploadedBy: schema.media.uploadedBy,
      createdAt: schema.media.createdAt,
    })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt))
    .limit(limit)
  return rows.map((r) => ({ ...r, url: mediaUrl(r.id) }))
}
