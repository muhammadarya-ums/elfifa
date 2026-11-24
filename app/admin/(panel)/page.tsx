import { ArrowRight, CalendarDays, Clock, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { Card, EmptyState, PageHeader, StatusBadge } from '@/components/admin/ui'
import { getDashboardStats } from '@/lib/admin-queries'
import { REGISTRATION_STATUSES } from '@/lib/db/schema'
import { formatDate, formatDateTime, formatRupiah } from '@/lib/format'
import { PROGRAM_LABELS, STATUS_LABELS } from '@/lib/labels'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const s = await getDashboardStats()

  const stats = [
    { label: 'Perlu ditindaklanjuti', value: s.fresh, sub: 'Status "Baru"', icon: Clock, href: '/admin/pendaftaran?status=baru', accent: 'text-sky-600 bg-sky-50' },
    { label: 'Pendaftar aktif', value: s.active, sub: `${s.pax} jamaah · ${s.thisMonth} bulan ini`, icon: Users, href: '/admin/pendaftaran', accent: 'text-[#007a82] bg-teal-50' },
    { label: 'Dana masuk', value: formatRupiah(s.paid), sub: `${formatRupiah(s.paidThisMonth)} bulan ini`, icon: Wallet, accent: 'text-emerald-600 bg-emerald-50' },
    { label: 'Piutang', value: formatRupiah(s.outstanding), sub: 'Sisa tagihan pendaftar aktif', icon: Wallet, accent: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan pendaftaran, pembayaran, dan kuota paket." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href, accent }) => {
          const body = (
            <div className="flex h-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 break-words text-xl font-bold leading-tight text-slate-900 2xl:text-2xl">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{sub}</p>
              </div>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="size-5" />
              </span>
            </div>
          )
          return href ? (
            <Link key={label} href={href}>
              {body}
            </Link>
          ) : (
            <div key={label}>{body}</div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title="Pendaftaran terbaru"
          actions={
            <Link href="/admin/pendaftaran" className="inline-flex items-center gap-1 text-xs font-semibold text-[#007a82] hover:underline">
              Semua <ArrowRight className="size-3.5" />
            </Link>
          }
          className="overflow-hidden [&>div:last-child]:p-0"
        >
          {s.recent.length === 0 ? (
            <EmptyState>Belum ada pendaftaran. Pendaftaran dari website akan muncul di sini.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100">
              {s.recent.map(({ reg, packageName }) => (
                <li key={reg.id}>
                  <Link href={`/admin/pendaftaran/${reg.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{reg.fullName}</p>
                      <p className="truncate text-xs text-slate-500">
                        <span className="font-mono">{reg.code}</span> · {packageName ?? PROGRAM_LABELS[reg.program]} · {reg.pax} org
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={reg.status} />
                      <span className="text-[11px] text-slate-400">{formatDateTime(reg.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid content-start gap-6">
          <Card title="Status pendaftaran">
            <ul className="grid gap-2">
              {REGISTRATION_STATUSES.map((st) => (
                <li key={st}>
                  <Link href={`/admin/pendaftaran?status=${st}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    <span className="text-slate-600">{STATUS_LABELS[st]}</span>
                    <span className="font-bold text-slate-900">{s.byStatus[st] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Kuota paket aktif">
            {s.activePackages.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada paket aktif.</p>
            ) : (
              <ul className="grid gap-4">
                {s.activePackages.map((p) => {
                  const pct = Math.min(100, Math.round((p.seatsTaken / p.quota) * 100))
                  return (
                    <li key={p.id}>
                      <div className="flex justify-between gap-2 text-sm">
                        <Link href={`/admin/pendaftaran?paket=${p.id}`} className="truncate font-medium text-slate-800 hover:text-[#007a82]">
                          {p.name}
                        </Link>
                        <span className="shrink-0 text-slate-500">
                          {p.seatsTaken}/{p.quota}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#007a82]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      {p.departureDate && <p className="mt-1 text-[11px] text-slate-400">Berangkat {formatDate(p.departureDate)}</p>}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Manasik terdekat"
            actions={
              <Link href="/admin/jadwal" className="text-xs font-semibold text-[#007a82] hover:underline">
                Kelola
              </Link>
            }
          >
            {s.schedules.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada jadwal mendatang.</p>
            ) : (
              <ul className="grid gap-3">
                {s.schedules.map((sc) => (
                  <li key={sc.id} className="flex gap-3 text-sm">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#007a82]" />
                    <div>
                      <p className="font-medium text-slate-800">{sc.topic}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(sc.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {sc.startTime} · {sc.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
