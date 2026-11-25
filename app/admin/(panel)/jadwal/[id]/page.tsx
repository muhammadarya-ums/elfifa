import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { saveSchedule } from '@/app/actions/admin'
import { ActionForm } from '@/components/admin/forms'
import { Card, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import ScheduleFields from '../schedule-fields'

export const metadata = { title: 'Edit Jadwal' }

export default async function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('catalog.manage')
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const db = await getDb()
  const schedule = await db.select().from(schema.schedules).where(eq(schema.schedules.id, id)).get()
  if (!schedule) notFound()

  return (
    <>
      <PageHeader title="Edit jadwal" back={{ href: '/admin/jadwal', label: 'Jadwal Manasik' }} />
      <Card className="max-w-lg">
        <ActionForm action={saveSchedule.bind(null, schedule.id)} submitLabel="Simpan">
          <ScheduleFields schedule={schedule} />
        </ActionForm>
      </Card>
    </>
  )
}
