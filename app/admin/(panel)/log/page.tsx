import { and, count, desc, eq, like, type SQL } from 'drizzle-orm'
import Link from 'next/link'
import { btnPrimary, btnSecondary, EmptyState, inputCls, PageHeader } from '@/components/admin/ui'
import { AUDIT_LABELS } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { formatDateTime } from '@/lib/format'

export const metadata = { title: 'Log Audit' }

const PAGE_SIZE = 50

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin('audit.view')
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const action = sp.aksi && AUDIT_LABELS[sp.aksi] ? sp.aksi : undefined
  const actor = sp.oleh?.trim() || undefined

  const t = schema.auditLogs
  const conds: SQL[] = []
  if (action) conds.push(eq(t.action, action))
  if (actor) conds.push(like(t.actor, `%${actor.replace(/[%_]/g, '')}%`))
  const where = conds.length ? and(...conds) : undefined

  const db = await getDb()
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(t).where(where),
    db.select().from(t).where(where).orderBy(desc(t.createdAt), desc(t.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
  ])
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const qs = (p: number) => {
    const params = new URLSearchParams()
    if (action) params.set('aksi', action)
    if (actor) params.set('oleh', actor)
    params.set('page', String(p))
    return `?${params}`
  }

  const entityHref = (type: string, id: string) =>
    type === 'registration' ? `/admin/pendaftaran/${id}` : type === 'package' ? `/admin/paket/${id}` : null

  return (
    <>
      <PageHeader title="Log audit" description={`Riwayat seluruh aktivitas admin — ${total} entri. Log tidak dapat diubah atau dihapus dari panel.`} />

      <form className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
        <select name="aksi" defaultValue={action ?? ''} className={inputCls} aria-label="Jenis aksi">
          <option value="">Semua aksi</option>
          {Object.entries(AUDIT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input name="oleh" defaultValue={actor} placeholder="Email admin…" className={inputCls} aria-label="Pelaku" />
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>Filter</button>
          {(action || actor) && <Link href="/admin/log" className={btnSecondary}>Reset</Link>}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <EmptyState>Belum ada aktivitas tercatat.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Waktu</th>
                  <th className="px-4 py-3 font-semibold">Pelaku</th>
                  <th className="px-4 py-3 font-semibold">Aksi</th>
                  <th className="px-4 py-3 font-semibold">Detail</th>
                  <th className="px-4 py-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const href = entityHref(r.entityType, r.entityId)
                  const danger = r.action.endsWith('delete') || r.action === 'auth.locked' || r.action === 'auth.login_failed'
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">{formatDateTime(r.createdAt)}</td>
                      <td className="px-4 py-2.5 text-slate-700">{r.actor}</td>
                      <td className="px-4 py-2.5">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${danger ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          {AUDIT_LABELS[r.action] ?? r.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {href ? (
                          <Link href={href} className="hover:text-[#007a82] hover:underline">{r.summary || `#${r.entityId}`}</Link>
                        ) : (
                          r.summary || '—'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-400">{r.ip}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Halaman">
          <span className="text-slate-500">Halaman {page} dari {pageCount}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs(page - 1)} className={btnSecondary}>← Sebelumnya</Link>}
            {page < pageCount && <Link href={qs(page + 1)} className={btnSecondary}>Berikutnya →</Link>}
          </div>
        </nav>
      )}
    </>
  )
}
