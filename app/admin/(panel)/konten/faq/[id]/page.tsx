import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { saveFaq } from '@/app/actions/admin'
import { ActionForm } from '@/components/admin/forms'
import { Card, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { FaqFields } from '../../fields'

export const metadata = { title: 'Edit FAQ' }

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('content.manage')
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const db = await getDb()
  const f = await db.select().from(schema.faqs).where(eq(schema.faqs.id, id)).get()
  if (!f) notFound()
  return (
    <>
      <PageHeader title="Edit FAQ" back={{ href: '/admin/konten', label: 'Testimoni & FAQ' }} />
      <Card className="max-w-2xl">
        <ActionForm action={saveFaq.bind(null, f.id)}>
          <FaqFields f={f} />
        </ActionForm>
      </Card>
    </>
  )
}
