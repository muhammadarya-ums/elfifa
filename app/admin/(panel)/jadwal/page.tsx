import { desc } from 'drizzle-orm'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteSchedule, saveSchedule } from '@/app/actions/admin'
import { ActionForm, ConfirmButton } from '@/components/admin/forms'
import { Card, EmptyState, Notice, PageHeader } from '@/components/admin/ui'
import { getDb, schema } from '@/lib/db'
import { formatDate, todayIso } from '@/lib/format'
import ScheduleFields from './schedule-fields'

export const metadata = { title: 'Jadwal Manasik' }

export default async function SchedulesPage({ searchParams }: { searchParams: Promise<{ disimpan?: string }> }) {
  const sp = await searchParams
  const db = await getDb()
  const rows = await db.select().from(schema.schedules).orderBy(desc(schema.schedules.date))
  const today = todayIso()
  const upcoming = rows.filter((r) => r.date >= today).reverse()
  const past = rows.filter((r) => r.date < today)

  return (
    <>
      <PageHeader title="Jadwal Manasik" description="Jadwal mendatang yang dipublikasikan otomatis tampil di halaman KBIHU. Jadwal yang sudah lewat disembunyikan otomatis." />
      {sp.disimpan && <Notice>Jadwal berhasil diperbarui.</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-6">
          <ScheduleTable title={`Mendatang (${upcoming.length})`} rows={upcoming} empty="Belum ada jadwal mendatang." />
          {past.length > 0 && <ScheduleTable title={`Sudah lewat (${past.length})`} rows={past.slice(0, 20)} muted />}
        </div>
        <Card title="Tambah jadwal" className="h-fit">
          <ActionForm action={saveSchedule.bind(null, null)} submitLabel="Tambah jadwal" resetOnSuccess>
            <ScheduleFields />
          </ActionForm>
        </Card>
      </div>
    </>
  )
}

function ScheduleTable({
  title,
  rows,
  empty,
  muted,
}: {
  title: string
  rows: (typeof schema.schedules.$inferSelect)[]
  empty?: string
  muted?: boolean
}) {
  return (
    <Card title={title} className="overflow-hidden [&>div:last-child]:p-0">
      {rows.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <ul className={`divide-y divide-slate-100 ${muted ? 'opacity-70' : ''}`}>
          {rows.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-4">
                <div className="w-14 shrink-0 text-center">
                  <p className="text-xl font-bold leading-none text-slate-900">{formatDate(s.date, { day: 'numeric' })}</p>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">{formatDate(s.date, { month: 'short', year: '2-digit' })}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {s.topic}
                    {!s.isPublished && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">Draft</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {formatDate(s.date, { weekday: 'long' })} · {s.startTime}–{s.endTime} · {s.location}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/jadwal/${s.id}`} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Edit">
                  <Pencil className="size-4" />
                </Link>
                <form action={deleteSchedule.bind(null, s.id)}>
                  <ConfirmButton message={`Hapus jadwal "${s.topic}"?`} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="size-4" />
                    <span className="sr-only">Hapus</span>
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
