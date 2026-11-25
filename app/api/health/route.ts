import { sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Health check untuk monitoring uptime: memastikan aplikasi & database merespons. */
export async function GET() {
  const started = Date.now()
  try {
    const db = await getDb()
    await db.run(sql`select 1`)
    return Response.json({ status: 'ok', db: 'ok', latencyMs: Date.now() - started }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'error', db: 'unreachable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
