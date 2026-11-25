import { changePassword } from '@/app/actions/admin'
import { ActionForm, FormField } from '@/components/admin/forms'
import { Card, inputCls, Notice, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { formatDateTime } from '@/lib/format'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/permissions'
import TwoFactorCard from './two-factor-card'

export const metadata = { title: 'Akun Saya' }

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ wajib2fa?: string }> }) {
  const me = await requireAdmin(undefined, { allowWithout2fa: true })
  return (
    <>
      <PageHeader title="Akun saya" description="Informasi akun dan keamanan login Anda." />
      {(await searchParams).wajib2fa && !me.totpSecret && (
        <Notice tone="warning">Pemilik mewajibkan verifikasi dua langkah (2FA). Aktifkan 2FA di bawah untuk melanjutkan ke panel admin.</Notice>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Profil">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Nama</dt>
              <dd className="mt-1 font-medium text-slate-900">{me.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Email</dt>
              <dd className="mt-1 font-medium text-slate-900">{me.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Peran</dt>
              <dd className="mt-1 font-medium text-slate-900">{ROLE_LABELS[me.role]}</dd>
              <dd className="mt-0.5 text-slate-500">{ROLE_DESCRIPTIONS[me.role]}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Login terakhir</dt>
              <dd className="mt-1 font-medium text-slate-900">{formatDateTime(me.lastLoginAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Ganti password">
          <ActionForm action={changePassword} submitLabel="Ganti password" resetOnSuccess>
            <FormField label="Password saat ini" name="current">
              <input id="current" name="current" type="password" autoComplete="current-password" className={inputCls} />
            </FormField>
            <FormField label="Password baru" name="next" hint="Minimal 10 karakter, kombinasi huruf dan angka">
              <input id="next" name="next" type="password" autoComplete="new-password" className={inputCls} />
            </FormField>
            <FormField label="Ulangi password baru" name="confirm">
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" className={inputCls} />
            </FormField>
          </ActionForm>
          <p className="mt-4 text-xs text-slate-500">Setelah password diganti, sesi di perangkat lain otomatis keluar.</p>
        </Card>

        <Card title="Verifikasi dua langkah (2FA)" className="xl:col-span-2">
          <TwoFactorCard enabled={!!me.totpSecret} recoveryLeft={(JSON.parse(me.recoveryCodes || '[]') as string[]).length} />
        </Card>
      </div>
    </>
  )
}
