import { ExternalLink, FileText, Images, Scale } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { listBlockStatus } from '@/lib/content'
import { formatDateTime } from '@/lib/format'

export const metadata = { title: 'Konten Halaman' }

const PAGE_ICONS = { Beranda: FileText, KBIHU: FileText, Legal: Scale } as const

export default async function ContentPagesIndex() {
  await requireAdmin('content.manage')
  const blocks = await listBlockStatus()
  const pages = ['Beranda', 'KBIHU', 'Legal'] as const

  return (
    <>
      <PageHeader
        title="Konten halaman"
        description="Ubah teks, foto, dan daftar di setiap bagian website. Setiap simpan langsung tayang dan versi sebelumnya tersimpan otomatis."
        actions={
          <Link href="/admin/media" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <Images className="size-4" /> Pustaka media
          </Link>
        }
      />
      <div className="grid gap-6">
        {pages.map((page) => {
          const Icon = PAGE_ICONS[page]
          return (
            <section key={page} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 text-sm font-bold text-slate-800">
                <Icon className="size-4 text-slate-400" /> {page === 'Legal' ? 'Halaman legal' : `Halaman ${page}`}
              </h2>
              <ul className="divide-y divide-slate-100">
                {blocks
                  .filter((b) => b.def.page === page)
                  .map(({ def, row }) => (
                    <li key={def.key} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50">
                      <Link href={`/admin/halaman/${encodeURIComponent(def.key)}`} className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{def.title}</p>
                        <p className="truncate text-xs text-slate-500">{def.description}</p>
                      </Link>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="hidden text-right text-xs text-slate-500 sm:block">
                          {row ? (
                            <>
                              Diubah {formatDateTime(row.updatedAt)}
                              <br />
                              oleh {row.updatedBy}
                            </>
                          ) : (
                            'Teks bawaan'
                          )}
                        </span>
                        <a href={def.preview} target="_blank" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Lihat ${def.title} di website`}>
                          <ExternalLink className="size-4" />
                        </a>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
