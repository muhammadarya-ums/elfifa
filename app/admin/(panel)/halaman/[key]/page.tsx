import { ExternalLink, History, RotateCcw } from 'lucide-react'
import { notFound } from 'next/navigation'
import { resetContentBlock, restoreContentRevision, saveContentBlock } from '@/app/actions/admin'
import BlockEditor from '@/components/admin/block-editor'
import { ConfirmButton } from '@/components/admin/forms'
import { btnSecondary, Card, Notice, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getBlockForEdit, listRevisions } from '@/lib/content'
import { formatDateTime } from '@/lib/format'
import { listMedia } from '@/lib/media'

export const metadata = { title: 'Edit Konten' }

export default async function EditContentBlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>
  searchParams: Promise<{ dipulihkan?: string; direset?: string }>
}) {
  await requireAdmin('content.manage')
  const [{ key: rawKey }, sp] = await Promise.all([params, searchParams])
  const key = decodeURIComponent(rawKey)
  const data = await getBlockForEdit(key)
  if (!data) notFound()
  const [revisions, library] = await Promise.all([listRevisions(key), listMedia()])
  const { def, value, updatedAt, updatedBy } = data

  return (
    <>
      <PageHeader
        title={def.title}
        description={def.description}
        back={{ href: '/admin/halaman', label: 'Konten halaman' }}
        actions={
          <a href={def.preview} target="_blank" className={btnSecondary}>
            <ExternalLink className="size-4" /> Lihat di website
          </a>
        }
      />
      {sp.dipulihkan && <Notice>Versi lama berhasil dipulihkan dan sudah tayang.</Notice>}
      {sp.direset && <Notice>Konten dikembalikan ke teks bawaan.</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="[&>div]:pb-0">
          <BlockEditor
            /* remount hanya setelah pulihkan/reset (nilai dari server berubah di luar editor) */
            key={sp.dipulihkan ?? sp.direset ?? 'editor'}
            def={def}
            initial={value as Record<string, string | Record<string, string>[]>}
            library={library.map((m) => ({ id: m.id, url: m.url, width: m.width, height: m.height, bytes: m.bytes, fileName: m.fileName }))}
            action={saveContentBlock.bind(null, key)}
          />
        </Card>

        <div className="grid content-start gap-6">
          <Card title="Status">
            <p className="text-sm text-slate-600">
              {updatedAt ? (
                <>
                  Terakhir diubah <strong>{formatDateTime(updatedAt)}</strong> oleh {updatedBy}.
                </>
              ) : (
                'Masih memakai teks bawaan.'
              )}
            </p>
          </Card>

          <Card title="Riwayat versi" actions={<History className="size-4 text-slate-400" />}>
            {revisions.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada versi sebelumnya.</p>
            ) : (
              <ul className="grid gap-2">
                {revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="text-slate-800">{formatDateTime(r.createdAt)}</p>
                      <p className="truncate text-xs text-slate-500">sebelum diubah · {r.actor}</p>
                    </div>
                    <form action={restoreContentRevision.bind(null, r.id)}>
                      <ConfirmButton message="Pulihkan versi ini? Versi yang sekarang tetap tersimpan di riwayat." className="rounded-md px-2 py-1 text-xs font-semibold text-[#007a82] hover:bg-teal-50">
                        Pulihkan
                      </ConfirmButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Kembalikan ke bawaan">
            <p className="mb-3 text-sm text-slate-500">Mengganti isi dengan teks bawaan. Isi sekarang tetap bisa dipulihkan dari riwayat.</p>
            <form action={resetContentBlock.bind(null, key)}>
              <ConfirmButton message="Kembalikan bagian ini ke teks bawaan?" className={btnSecondary}>
                <RotateCcw className="size-4" /> Reset
              </ConfirmButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
