import { Download, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { btnPrimary, btnSecondary, EmptyState, inputCls, Notice, PageHeader, StatusBadge } from '@/components/admin/ui'
import { getAllPackages, listRegistrations, parseFilters } from '@/lib/admin-queries'
import { requireAdmin } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { PROGRAMS, REGISTRATION_STATUSES } from '@/lib/db/schema'
import { displayPhone, formatDateTime, formatRupiah } from '@/lib/format'
import { PROGRAM_LABELS, STATUS_LABELS } from '@/lib/labels'

export const metadata = { title: 'Pendaftaran' }

type SP = Record<string, string | string[] | undefined>

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const admin = await requireAdmin('registration.view')
  const sp = await searchParams
  const filters = parseFilters(sp)
  const page = Math.max(1, Number(sp.page) || 1)
  const [{ rows, total, pageCount }, packages] = await Promise.all([listRegistrations(filters, page), getAllPackages()])

  const qs = (extra: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status) params.set('status', filters.status)
    if (filters.program) params.set('program', filters.program)
    if (filters.packageId) params.set('paket', String(filters.packageId))
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined || v === '') params.delete(k)
      else params.set(k, String(v))
    }
    const s = params.toString()
    return s ? `?${s}` : ''
  }

  const hasFilter = Boolean(filters.q || filters.status || filters.program || filters.packageId)

  return (
    <>
      <PageHeader
        title="Pendaftaran"
        description={`${total} data${hasFilter ? ' sesuai filter' : ''}`}
        actions={
          <>
            {can(admin.role, 'export') && (
              <a href={`/api/admin/export${qs({})}`} className={btnSecondary}>
                <Download className="size-4" /> Ekspor CSV
              </a>
            )}
            <Link href="/admin/pendaftaran/baru" className={btnPrimary}>
              <Plus className="size-4" /> Tambah manual
            </Link>
          </>
        }
      />

      {sp.dihapus && <Notice>Pendaftaran berhasil dihapus.</Notice>}

      <form className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={filters.q} placeholder="Cari nama, kode, no. HP, kota…" className={`${inputCls} pl-9`} aria-label="Cari" />
        </div>
        <select name="status" defaultValue={filters.status ?? ''} className={inputCls} aria-label="Status">
          <option value="">Semua status</option>
          {REGISTRATION_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select name="program" defaultValue={filters.program ?? ''} className={inputCls} aria-label="Program">
          <option value="">Semua program</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>{PROGRAM_LABELS[p]}</option>
          ))}
        </select>
        <select name="paket" defaultValue={filters.packageId ?? ''} className={inputCls} aria-label="Paket">
          <option value="">Semua paket</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>Filter</button>
          {hasFilter && (
            <Link href="/admin/pendaftaran" className={btnSecondary}>Reset</Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <EmptyState>{hasFilter ? 'Tidak ada data yang cocok dengan filter.' : 'Belum ada pendaftaran.'}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Jamaah</th>
                  <th className="px-4 py-3 font-semibold">Program / Paket</th>
                  <th className="px-4 py-3 font-semibold">Kontak</th>
                  <th className="px-4 py-3 text-right font-semibold">Pembayaran</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ reg, packageName, paid }) => (
                  <tr key={reg.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pendaftaran/${reg.id}`} className="font-semibold text-slate-900 hover:text-[#007a82]">
                        {reg.fullName}
                      </Link>
                      <p className="font-mono text-xs text-slate-500">{reg.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{packageName ?? PROGRAM_LABELS[reg.program]}</p>
                      <p className="text-xs text-slate-500">{reg.pax} jamaah{reg.city ? ` · ${reg.city}` : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`https://wa.me/${reg.phone}`} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-emerald-600">
                        {displayPhone(reg.phone)}
                      </a>
                      {reg.email && <p className="max-w-[180px] truncate text-xs text-slate-500">{reg.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {reg.totalPriceIdr > 0 ? (
                        <>
                          <p className="font-medium text-slate-900">{formatRupiah(paid)}</p>
                          <p className="text-xs text-slate-500">dari {formatRupiah(reg.totalPriceIdr)}</p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={reg.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDateTime(reg.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Halaman">
          <span className="text-slate-500">Halaman {page} dari {pageCount}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className={btnSecondary}>← Sebelumnya</Link>}
            {page < pageCount && <Link href={qs({ page: page + 1 })} className={btnSecondary}>Berikutnya →</Link>}
          </div>
        </nav>
      )}
    </>
  )
}
