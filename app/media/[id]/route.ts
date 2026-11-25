import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { isMediaId } from '@/lib/media'

/**
 * Menyajikan gambar dari pustaka media.
 * Isi per ID tidak pernah berubah → cache 1 tahun (immutable) di browser & CDN.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isMediaId(id)) return new Response('Not found', { status: 404 })

  const etag = `"${id}"`
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: { ETag: etag } })

  const db = await getDb()
  const row = await db
    .select({ data: schema.media.data, mime: schema.media.mime })
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .get()
  if (!row) return new Response('Not found', { status: 404 })

  return new Response(new Uint8Array(row.data), {
    headers: {
      'Content-Type': row.mime,
      'Content-Length': String(row.data.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: etag,
      'X-Content-Type-Options': 'nosniff',
      // Bila dibuka langsung, file tidak dapat menjalankan apa pun
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      'Cross-Origin-Resource-Policy': 'same-site',
    },
  })
}
