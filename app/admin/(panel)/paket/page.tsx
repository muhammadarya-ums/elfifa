import { ExternalLink, Plus, Star } from 'lucide-react'
import Link from 'next/link'
import { btnPrimary, EmptyState, Notice, PageHeader } from '@/components/admin/ui'
import { getAllPackages } from '@/lib/admin-queries'
import { requireAdmin } from '@/lib/auth'
import { formatDate, formatRupiah } from '@/lib/format'

export const metadata = { title: 'Paket Umroh' }

export default async function PackagesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin('catalog.manage')
  const [packages, sp] = await Promise.all([getAllPackages(), searchParams])

  return (
    <>
      <PageHeader
        title="Paket Umroh"
        description="Paket aktif tampil di website. Paket unggulan tampil besar di bagian atas beranda."
        actions={
          <Link href="/admin/paket/baru" className={btnPrimary}>
            <Plus className="size-4" /> Paket baru
          </Link>
        }
      />
      {sp.dihapus && <Notice>Paket berhasil dihapus.</Notice>}
      {sp.dinonaktifkan && <Notice tone="warning">Paket memiliki pendaftar sehingga tidak dihapus, melainkan dinonaktifkan (disembunyikan dari website).</Notice>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {packages.length === 0 ? (
          <EmptyState>Belum ada paket. Klik “Paket baru” untuk menambahkan.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Paket</th>
                  <th className="px-4 py-3 font-semibold">Keberangkatan</th>
                  <th className="px-4 py-3 text-right font-semibold">Harga</th>
                  <th className="px-4 py-3 font-semibold">Kuota terisi</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((p) => {
                  const pct = Math.min(100, Math.round((p.seatsTaken / p.quota) * 100))
                  return (
                    <tr key={p.id} className={p.isActive ? 'hover:bg-slate-50' : 'bg-slate-50/60 text-slate-400'}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/paket/${p.id}`} className="flex items-center gap-1.5 font-semibold text-slate-900 hover:text-[#007a82]">
                          {p.isFeatured && <Star className="size-4 fill-amber-400 text-amber-400" aria-label="Unggulan" />}
                          {p.name}
                        </Link>
                        <p className="text-xs text-slate-500">{p.durationDays} hari · {p.registrations} pendaftaran</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(p.departureDate)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">{formatRupiah(p.priceIdr)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-[#007a82]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-600">{p.seatsTaken}/{p.quota}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {p.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.isActive && (
                          <a href={`/paket/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-[#007a82] hover:underline">
                            Lihat <ExternalLink className="size-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
