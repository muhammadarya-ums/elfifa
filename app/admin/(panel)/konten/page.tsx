import { asc } from 'drizzle-orm'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteFaq, deleteTestimonial, saveFaq, saveTestimonial } from '@/app/actions/admin'
import { ActionForm, ConfirmButton } from '@/components/admin/forms'
import { Card, EmptyState, Notice, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { FAQ_CATEGORY_LABELS, FaqFields, TestimonialFields } from './fields'

export const metadata = { title: 'Testimoni & FAQ' }

function RowActions({ editHref, onDelete, label }: { editHref: string; onDelete: () => Promise<void>; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link href={editHref} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${label}`}>
        <Pencil className="size-4" />
      </Link>
      <form action={onDelete}>
        <ConfirmButton message={`Hapus "${label}"?`} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
          <Trash2 className="size-4" />
          <span className="sr-only">Hapus</span>
        </ConfirmButton>
      </form>
    </div>
  )
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ disimpan?: string }> }) {
  await requireAdmin('content.manage')
  const sp = await searchParams
  const db = await getDb()
  const [testimonials, faqs] = await Promise.all([
    db.select().from(schema.testimonials).orderBy(asc(schema.testimonials.sortOrder), asc(schema.testimonials.id)),
    db.select().from(schema.faqs).orderBy(asc(schema.faqs.sortOrder), asc(schema.faqs.id)),
  ])

  return (
    <>
      <PageHeader title="Testimoni & FAQ" description="Konten yang tampil di beranda dan halaman KBIHU." />
      {sp.disimpan && <Notice>Perubahan tersimpan.</Notice>}

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card title={`Testimoni (${testimonials.length})`}>
          <Notice tone="info">
            Bagian testimoni di beranda otomatis tersembunyi sampai ada testimoni yang diterbitkan. Gunakan hanya testimoni asli dari jamaah,
            dengan persetujuan mereka.
          </Notice>
          {testimonials.length === 0 ? (
            <EmptyState>Belum ada testimoni.</EmptyState>
          ) : (
            <ul className="mb-6 divide-y divide-slate-100 border-y border-slate-100">
              {testimonials.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                      {!t.isPublished && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">Draft</span>}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-500">“{t.quote}”</p>
                  </div>
                  <RowActions editHref={`/admin/konten/testimoni/${t.id}`} onDelete={deleteTestimonial.bind(null, t.id)} label={t.name} />
                </li>
              ))}
            </ul>
          )}
          <p className="mb-3 text-sm font-semibold text-slate-700">Tambah testimoni</p>
          <ActionForm action={saveTestimonial.bind(null, null)} submitLabel="Tambah testimoni" resetOnSuccess>
            <TestimonialFields />
          </ActionForm>
        </Card>

        <Card title={`Tanya jawab (${faqs.length})`}>
          {faqs.length === 0 ? (
            <EmptyState>Belum ada FAQ.</EmptyState>
          ) : (
            <ul className="mb-6 divide-y divide-slate-100 border-y border-slate-100">
              {faqs.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {f.question}
                      {!f.isPublished && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">Draft</span>}
                    </p>
                    <p className="text-xs text-slate-500">{FAQ_CATEGORY_LABELS[f.category]}</p>
                  </div>
                  <RowActions editHref={`/admin/konten/faq/${f.id}`} onDelete={deleteFaq.bind(null, f.id)} label={f.question} />
                </li>
              ))}
            </ul>
          )}
          <p className="mb-3 text-sm font-semibold text-slate-700">Tambah FAQ</p>
          <ActionForm action={saveFaq.bind(null, null)} submitLabel="Tambah FAQ" resetOnSuccess>
            <FaqFields />
          </ActionForm>
        </Card>
      </div>
    </>
  )
}
