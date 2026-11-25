import { asc } from 'drizzle-orm'
import { Trash2 } from 'lucide-react'
import { createAdmin, deleteAdmin, saveSettings, updateAdmin } from '@/app/actions/admin'
import { resetAdminTotp, setRequireTwoFactor } from '@/app/actions/two-factor'
import { ActionForm, ConfirmButton, FormField, SubmitButton } from '@/components/admin/forms'
import { Card, inputCls, PageHeader } from '@/components/admin/ui'
import { isTwoFactorRequired, requireAdmin } from '@/lib/auth'
import { getSettings } from '@/lib/data'
import { getDb, schema } from '@/lib/db'
import { ADMIN_ROLES } from '@/lib/db/schema'
import { formatDateTime } from '@/lib/format'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/permissions'
import { SETTING_GROUPS } from '@/lib/settings-def'

export const metadata = { title: 'Pengaturan' }

export default async function SettingsPage() {
  const me = await requireAdmin('settings.manage')
  const db = await getDb()
  const [settings, admins, require2fa] = await Promise.all([
    getSettings(),
    db.select().from(schema.admins).orderBy(asc(schema.admins.createdAt)),
    isTwoFactorRequired(),
  ])

  return (
    <>
      <PageHeader title="Pengaturan" description="Identitas brand, kontak, rekening, dan akses tim. Perubahan langsung tampil di website." />

      <ActionForm action={saveSettings} submitLabel="Simpan pengaturan" className="gap-6">
        <div className="grid gap-6 xl:grid-cols-3">
          {SETTING_GROUPS.map((group) => (
            <Card key={group.id} title={group.title}>
              <div className="grid gap-4">
                {group.fields.map((f) => (
                  <FormField key={f.key} label={f.label} name={f.key} hint={'hint' in f ? f.hint : undefined}>
                    <input id={f.key} name={f.key} defaultValue={settings[f.key]} className={inputCls} />
                  </FormField>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </ActionForm>

      <Card title="Akses tim" className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2.5 pr-4 font-semibold">Admin</th>
                <th className="py-2.5 pr-4 font-semibold">Login terakhir</th>
                <th className="py-2.5 pr-4 font-semibold">2FA</th>
                <th className="py-2.5 pr-4 font-semibold">Peran &amp; status</th>
                <th className="py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((a) => (
                <tr key={a.id} className={a.isActive ? '' : 'text-slate-400'}>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-900">
                      {a.name} {a.id === me.id && <span className="text-xs font-normal text-slate-500">(Anda)</span>}
                    </p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{formatDateTime(a.lastLoginAt)}</td>
                  <td className="py-3 pr-4">
                    {a.totpSecret ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Aktif</span>
                        {a.id !== me.id && (
                          <form action={resetAdminTotp.bind(null, a.id)}>
                            <ConfirmButton message={`Reset 2FA ${a.email}? Admin ini akan keluar dari semua perangkat dan perlu mengaktifkan 2FA lagi.`} className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline">
                              Reset
                            </ConfirmButton>
                          </form>
                        )}
                      </div>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Belum</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {a.id === me.id ? (
                      <span className="text-sm font-medium text-slate-700">{ROLE_LABELS[a.role]}</span>
                    ) : (
                      <form action={updateAdmin.bind(null, a.id)} className="flex flex-wrap items-center gap-2">
                        <select name="role" defaultValue={a.role} className="rounded-md border border-slate-300 px-2 py-1 text-sm" aria-label={`Peran ${a.email}`}>
                          {ADMIN_ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600">
                          <input type="checkbox" name="isActive" defaultChecked={a.isActive} className="accent-[#007a82]" /> Aktif
                        </label>
                        <SubmitButton className="px-3 py-1 text-xs">Terapkan</SubmitButton>
                      </form>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {a.id !== me.id && (
                      <form action={deleteAdmin.bind(null, a.id)}>
                        <ConfirmButton message={`Hapus akses admin ${a.email}? Riwayat audit tetap tersimpan.`} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="size-4" />
                          <span className="sr-only">Hapus</span>
                        </ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">Perubahan peran atau penonaktifan langsung mengeluarkan admin tersebut dari semua perangkat. Sistem selalu menyisakan minimal satu Pemilik aktif.</p>

        <form action={setRequireTwoFactor} className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="require" defaultChecked={require2fa} disabled={!me.totpSecret} className="size-4 accent-[#007a82]" />
            <span>
              <strong>Wajibkan 2FA untuk semua admin.</strong> Admin tanpa 2FA hanya bisa membuka Akun Saya sampai mengaktifkannya.
            </span>
          </label>
          <SubmitButton className="px-3 py-1 text-xs">Simpan</SubmitButton>
          {!me.totpSecret && <p className="w-full text-xs text-amber-700">Aktifkan 2FA pada akun Anda sendiri dulu (Akun Saya) agar Anda tidak terkunci.</p>}
        </form>

        <div className="mt-8 grid gap-8 border-t border-slate-100 pt-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Tambah anggota tim</p>
            <ActionForm action={createAdmin} submitLabel="Tambah admin" resetOnSuccess>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Nama" name="name">
                  <input id="name" name="name" className={inputCls} />
                </FormField>
                <FormField label="Email" name="email">
                  <input id="email" name="email" type="email" className={inputCls} />
                </FormField>
                <FormField label="Peran" name="role">
                  <select id="role" name="role" defaultValue="staff" className={inputCls}>
                    {ADMIN_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Password awal" name="password" hint="Min. 10 karakter, huruf & angka">
                  <input id="password" name="password" type="text" autoComplete="off" className={inputCls} />
                </FormField>
              </div>
            </ActionForm>
          </div>
          <dl className="grid content-start gap-3 rounded-lg bg-slate-50 p-4 text-sm">
            {ADMIN_ROLES.map((r) => (
              <div key={r}>
                <dt className="font-semibold text-slate-800">{ROLE_LABELS[r]}</dt>
                <dd className="text-slate-500">{ROLE_DESCRIPTIONS[r]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>
      <p className="mt-4 text-xs text-slate-500">
        Ingin mengganti password Anda? Buka <a href="/admin/akun" className="font-semibold text-[#007a82] underline">Akun Saya</a>.
      </p>
    </>
  )
}
