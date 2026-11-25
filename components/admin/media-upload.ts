'use client'

export type MediaItem = { id: string; url: string; width: number; height: number; bytes: number; fileName: string }

const MAX_EDGE = 2400

/**
 * Perkecil gambar di browser sebelum dikirim (hemat kuota & lolos batas body 4,5 MB Vercel).
 * Server tetap memvalidasi & meng-encode ulang — ini hanya optimasi, bukan pengaman.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.88))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file // format yang tak bisa dibaca browser (mis. HEIC di Chrome) → kirim apa adanya
  }
}

export async function uploadImage(file: File): Promise<MediaItem> {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) throw new Error('File harus berupa gambar.')
  if (file.type === 'image/svg+xml') throw new Error('SVG tidak diizinkan demi keamanan.')
  const body = await shrink(file)
  if (body.size > 4 * 1024 * 1024) throw new Error('Gambar terlalu besar setelah dikompres (maks. 4 MB).')
  const fd = new FormData()
  fd.append('file', body, file.name.replace(/\.[^.]+$/, '') + (body === file ? '' : '.webp'))
  const res = await fetch('/api/admin/media', { method: 'POST', body: fd, credentials: 'same-origin' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? 'Upload gagal.')
  return { ...json, fileName: file.name }
}
