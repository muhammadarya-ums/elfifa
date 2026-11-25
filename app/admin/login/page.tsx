import { count } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { bootstrapCredentials, getCurrentAdmin } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import LoginForm from './login-form'

export const metadata = { title: 'Login' }
export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; sesi?: string }> }) {
  if (await getCurrentAdmin()) redirect('/admin')
  const { next, sesi } = await searchParams

  const db = await getDb()
  const [{ n }] = await db.select({ n: count() }).from(schema.admins)
  const boot = n === 0 ? bootstrapCredentials() : null

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo-sm.png" alt="Elfifa" width={333} height={160} className="mx-auto h-14 w-auto" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Panel Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Elfifa Travel Umroh &amp; KBIHU</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {sesi === 'habis' && (
            <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              Waktu verifikasi habis. Silakan login kembali.
            </p>
          )}
          {n === 0 && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
              {boot && !boot.fromEnv ? (
                <>
                  <strong>Setup awal (development):</strong> login dengan <code>{boot.email}</code> / <code>{boot.password}</code>, lalu
                  segera ganti password di menu Pengaturan.
                </>
              ) : boot ? (
                <>
                  <strong>Setup awal:</strong> login memakai <code>ADMIN_EMAIL</code> &amp; <code>ADMIN_PASSWORD</code> dari environment
                  variable.
                </>
              ) : (
                <>
                  <strong>Belum ada admin.</strong> Set environment variable <code>ADMIN_EMAIL</code> dan <code>ADMIN_PASSWORD</code>, lalu
                  login dengan kredensial tersebut.
                </>
              )}
            </div>
          )}
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          <a href="/" className="hover:text-slate-600">← Kembali ke website</a>
        </p>
      </div>
    </div>
  )
}
