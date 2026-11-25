import { audit } from '@/lib/audit'
import { getCurrentAdmin, rateLimit } from '@/lib/auth'
import { MAX_UPLOAD_BYTES, MediaError, saveMedia } from '@/lib/media'
import { can } from '@/lib/permissions'
import { isSameOrigin, jsonError } from '@/lib/security'

export const dynamic = 'force-dynamic'

/** Upload gambar ke pustaka media (admin dengan izin kelola konten). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError('Permintaan ditolak.', 403)
  const admin = await getCurrentAdmin()
  if (!admin) return jsonError('Sesi berakhir, silakan login ulang.', 401)
  if (!can(admin.role, 'content.manage') && !can(admin.role, 'catalog.manage')) return jsonError('Akses ditolak.', 403)

  const limit = await rateLimit(`upload:${admin.id}`, 60, 10 * 60 * 1000)
  if (!limit.allowed) return jsonError('Terlalu banyak upload. Coba lagi beberapa menit lagi.', 429)

  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return jsonError('Ukuran file maksimal 8 MB.', 413)

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return jsonError('Data upload tidak valid.', 400)
  }
  if (!(file instanceof File)) return jsonError('Pilih file gambar.', 400)

  try {
    const saved = await saveMedia(Buffer.from(await file.arrayBuffer()), file.name, admin.email)
    await audit(admin, 'media.upload', { type: 'media', id: saved.id }, `${file.name} · ${saved.width}×${saved.height} · ${Math.round(saved.bytes / 1024)} KB`)
    return Response.json(saved, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    if (err instanceof MediaError) return jsonError(err.message, 415)
    console.error('[media] upload gagal', err)
    return jsonError('Upload gagal diproses.', 500)
  }
}
