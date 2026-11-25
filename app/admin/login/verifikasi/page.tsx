import { redirect } from 'next/navigation'
import { readPendingTwoFactor } from '@/lib/auth'
import VerifyForm from './verify-form'

export const metadata = { title: 'Verifikasi 2FA' }
export const dynamic = 'force-dynamic'

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const admin = await readPendingTwoFactor()
  if (!admin) redirect('/admin/login?sesi=habis')
  const { next } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo-sm.png" alt="Elfifa" width={333} height={160} className="mx-auto h-14 w-auto" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Verifikasi dua langkah</h1>
          <p className="mt-1 text-sm text-slate-500">Masukkan 6 digit kode dari aplikasi authenticator untuk {admin.email}.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <VerifyForm next={next} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          HP hilang? Gunakan salah satu kode cadangan, atau minta Pemilik mereset 2FA Anda.
        </p>
      </div>
    </div>
  )
}
