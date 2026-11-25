import { requireAdmin } from '@/lib/auth'
import AdminNav from './admin-nav'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Penegakan 2FA wajib dilakukan per halaman (layout juga membungkus /admin/akun)
  const admin = await requireAdmin(undefined, { allowWithout2fa: true })

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
      <AdminNav adminName={admin.name} adminEmail={admin.email} role={admin.role} />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  )
}
