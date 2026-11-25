import { createRegistrationAdmin } from '@/app/actions/admin'
import { ActionForm } from '@/components/admin/forms'
import { Card, PageHeader } from '@/components/admin/ui'
import { getAllPackages } from '@/lib/admin-queries'
import { requireAdmin } from '@/lib/auth'
import { can } from '@/lib/permissions'
import RegistrationFields from '../registration-fields'

export const metadata = { title: 'Tambah Pendaftaran' }

export default async function NewRegistrationPage() {
  const admin = await requireAdmin('registration.edit')
  const packages = await getAllPackages()
  return (
    <>
      <PageHeader
        title="Tambah pendaftaran manual"
        description="Untuk jamaah yang mendaftar langsung di kantor atau via telepon. Kode pendaftaran dibuat otomatis."
        back={{ href: '/admin/pendaftaran', label: 'Pendaftaran' }}
      />
      <Card className="max-w-3xl">
        <ActionForm action={createRegistrationAdmin} submitLabel="Simpan pendaftaran">
          <RegistrationFields packages={packages} canEditPrice={can(admin.role, 'payment.manage')} />
        </ActionForm>
      </Card>
    </>
  )
}
