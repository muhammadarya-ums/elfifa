import { getSettings } from '@/lib/data'
import { MAIN_URL } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

/** RFC 9116: cara peneliti keamanan melaporkan celah secara bertanggung jawab. */
export async function GET() {
  const s = await getSettings()
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
  const body = [
    `Contact: mailto:${s.travel_email}`,
    `Expires: ${expires}`,
    'Preferred-Languages: id, en',
    `Canonical: ${MAIN_URL}/.well-known/security.txt`,
    `Policy: ${MAIN_URL}/kebijakan-privasi`,
    '',
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } })
}
