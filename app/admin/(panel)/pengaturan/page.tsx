import { asc } from 'drizzle-orm'
import { Trash2 } from 'lucide-react'
import { changePassword, createAdmin, deleteAdmin, saveSettings } from '@/app/actions/admin'
import { ActionForm, ConfirmButton, FormField } from '@/components/admin/forms'
import { Card, inputCls, PageHeader } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getSettings } from '@/lib/data'
import { getDb, schema } from '@/lib/db'
import { formatDateTime } from '@/lib/format'
import { SETTING_GROUPS } from '@/lib/settings-def'

export const metadata = { title: 'Pengaturan' }

export default async function SettingsPage() {
  const me = await requireAdmin()
  const db = await getDb()
  const [settings, admins] = await Promise.all([
    getSettings(),
    db.select().from(schema.admins).orderBy(asc(schema.admins.createdAt)),
  ])

  return (
    <>
      <PageHeader title="Pengaturan" description="Kontak, nomor WhatsApp, rekening, dan akun admin." />

      <ActionForm action={saveSettings} submitLabel="Simpan pengaturan" className="gap-6">
        <div className="grid gap-6 xl:grid-cols-2">
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

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Ganti password Anda">
          <ActionForm action={changePassword} submitLabel="Ganti password" resetOnSuccess>
            <FormField label="Password saat ini" name="current">
              <input id="current" name="current" type="password" autoComplete="current-password" className={inputCls} />
            </FormField>
            <FormField label="Password baru" name="next" hint="Minimal 8 karakter">
              <input id="next" name="next" type="password" autoComplete="new-password" className={inputCls} />
            </FormField>
            <FormField label="Ulangi password baru" name="confirm">
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" className={inputCls} />
            </FormField>
          </ActionForm>
        </Card>

        <Card title="Akun admin">
          <ul className="mb-6 divide-y divide-slate-100 border-y border-slate-100">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {a.name} {a.id === me.id && <span className="text-xs font-normal text-slate-500">(Anda)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {a.email} · login terakhir {formatDateTime(a.lastLoginAt)}
                  </p>
                </div>
                {a.id !== me.id && (
                  <form action={deleteAdmin.bind(null, a.id)}>
                    <ConfirmButton message={`Hapus akses admin ${a.email}?`} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="size-4" />
                      <span className="sr-only">Hapus</span>
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <p className="mb-3 text-sm font-semibold text-slate-700">Tambah admin</p>
          <ActionForm action={createAdmin} submitLabel="Tambah admin" resetOnSuccess>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Nama" name="name">
                <input id="name" name="name" className={inputCls} />
              </FormField>
              <FormField label="Email" name="email">
                <input id="email" name="email" type="email" className={inputCls} />
              </FormField>
            </div>
            <FormField label="Password awal" name="password" hint="Minimal 8 karakter. Minta admin baru menggantinya setelah login.">
              <input id="password" name="password" type="text" autoComplete="off" className={inputCls} />
            </FormField>
          </ActionForm>
        </Card>
      </div>
    </>
  )
}
