import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { saveTestimonial } from '@/app/actions/admin'
import { ActionForm } from '@/components/admin/forms'
import { Card, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { TestimonialFields } from '../../fields'

export const metadata = { title: 'Edit Testimoni' }

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('content.manage')
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const db = await getDb()
  const t = await db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id)).get()
  if (!t) notFound()
  return (
    <>
      <PageHeader title="Edit testimoni" back={{ href: '/admin/konten', label: 'Testimoni & FAQ' }} />
      <Card className="max-w-2xl">
        <ActionForm action={saveTestimonial.bind(null, t.id)}>
          <TestimonialFields t={t} />
        </ActionForm>
      </Card>
    </>
  )
}
