import { PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { listMedia } from '@/lib/media'
import MediaLibrary from './media-library'

export const metadata = { title: 'Pustaka Media' }

export default async function MediaPage() {
  await requireAdmin('content.manage')
  const items = await listMedia()
  return (
    <>
      <PageHeader
        title="Pustaka media"
        description="Semua gambar yang di-upload. Setiap gambar otomatis dikompres ke WebP dan metadata (termasuk lokasi GPS) dihapus."
      />
      <MediaLibrary
        items={items.map((m) => ({
          id: m.id,
          url: m.url,
          fileName: m.fileName,
          width: m.width,
          height: m.height,
          bytes: m.bytes,
          uploadedBy: m.uploadedBy,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </>
  )
}
