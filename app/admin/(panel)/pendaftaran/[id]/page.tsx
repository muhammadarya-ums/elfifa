import { Trash2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { addPayment, deletePayment, deleteRegistration, quickUpdateStatus, updateRegistration } from '@/app/actions/admin'
import { ActionForm, AutoSubmitSelect, ConfirmButton, FormField } from '@/components/admin/forms'
import { btnDanger, Card, inputCls, Notice, PageHeader, StatusBadge } from '@/components/admin/ui'
import { WhatsAppIcon } from '@/components/social-icons'
import { getAllPackages, getRegistrationDetail } from '@/lib/admin-queries'
import { PAYMENT_METHODS, REGISTRATION_STATUSES } from '@/lib/db/schema'
import { displayPhone, formatDate, formatDateTime, formatRupiah, todayIso, waLink } from '@/lib/format'
import { PROGRAM_LABELS, STATUS_LABELS } from '@/lib/labels'
import RegistrationFields from '../registration-fields'

export const metadata = { title: 'Detail Pendaftaran' }

const METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  transfer: 'Transfer bank',
  tunai: 'Tunai',
  lainnya: 'Lainnya',
}

export default async function RegistrationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ dibuat?: string }>
}) {
  const [{ id: idParam }, sp] = await Promise.all([params, searchParams])
  const id = Number(idParam)
  if (!Number.isInteger(id)) notFound()
  const [detail, packages] = await Promise.all([getRegistrationDetail(id), getAllPackages()])
  if (!detail) notFound()

  const { reg, pkg, payments, paid } = detail
  const remaining = Math.max(0, reg.totalPriceIdr - paid)
  const progress = reg.totalPriceIdr > 0 ? Math.min(100, Math.round((paid / reg.totalPriceIdr) * 100)) : 0
  const greeting = `Assalamu'alaikum ${reg.fullName}, kami dari ${reg.program === 'umroh' ? 'Elfifa Travel Umroh' : 'KBIHU Elfifa'} terkait pendaftaran ${pkg?.name ?? PROGRAM_LABELS[reg.program]} (kode ${reg.code}).`

  return (
    <>
      <PageHeader
        title={reg.fullName}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{reg.code}</span> · {pkg?.name ?? PROGRAM_LABELS[reg.program]} · masuk {formatDateTime(reg.createdAt)}
            {reg.source === 'admin' && <span className="rounded bg-slate-200 px-1.5 text-[11px]">input admin</span>}
          </span>
        }
        back={{ href: '/admin/pendaftaran', label: 'Pendaftaran' }}
        actions={
          <a
            href={waLink(reg.phone, greeting)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1fb457]"
          >
            <WhatsAppIcon className="size-4" /> Chat {displayPhone(reg.phone)}
          </a>
        }
      />

      {sp.dibuat && <Notice>Pendaftaran berhasil dibuat dengan kode <strong className="font-mono">{reg.code}</strong>.</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-6">
          <Card title="Ringkasan">
            <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
                <form key={reg.status} action={quickUpdateStatus.bind(null, reg.id)} className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={reg.status} />
                  <AutoSubmitSelect name="status" defaultValue={reg.status} className="rounded-md border border-slate-300 px-2 py-1 text-xs" aria-label="Ubah status">
                    {REGISTRATION_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </AutoSubmitSelect>
                </form>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Jamaah</p>
                <p className="mt-1.5 font-semibold text-slate-900">
                  {reg.pax} orang · paspor {reg.hasPassport ? 'ada' : 'belum'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Keberangkatan</p>
                <p className="mt-1.5 font-semibold text-slate-900">{formatDate(pkg?.departureDate)}</p>
              </div>
            </div>
            {reg.message && (
              <blockquote className="mt-4 rounded-lg border-l-4 border-[#d9923b] bg-amber-50/60 px-4 py-3 text-sm text-slate-700">
                “{reg.message}”
              </blockquote>
            )}
          </Card>

          <Card title="Data pendaftaran">
            {/* key: remount bila status berubah dari luar form agar tidak menimpa dengan nilai lama */}
            <ActionForm key={reg.status} action={updateRegistration.bind(null, reg.id)} submitLabel="Simpan perubahan">
              <RegistrationFields reg={reg} packages={packages} />
            </ActionForm>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card title="Pembayaran">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatRupiah(paid)}</p>
                <p className="text-xs text-slate-500">dari {reg.totalPriceIdr > 0 ? formatRupiah(reg.totalPriceIdr) : 'tagihan belum diisi'}</p>
              </div>
              {reg.totalPriceIdr > 0 && (
                <p className={`text-sm font-bold ${remaining === 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                  {remaining === 0 ? 'Lunas' : `Sisa ${formatRupiah(remaining)}`}
                </p>
              )}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
            </div>

            {payments.length > 0 && (
              <ul className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{formatRupiah(p.amountIdr)}</p>
                      <p className="truncate text-xs text-slate-500">
                        {formatDate(p.paidOn)} · {METHOD_LABELS[p.method]}
                        {p.note ? ` · ${p.note}` : ''}
                      </p>
                    </div>
                    <form action={deletePayment.bind(null, p.id, reg.id)}>
                      <ConfirmButton message="Hapus catatan pembayaran ini?" className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="size-4" />
                        <span className="sr-only">Hapus</span>
                      </ConfirmButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Catat pembayaran</p>
              <ActionForm action={addPayment.bind(null, reg.id)} submitLabel="Tambah pembayaran" resetOnSuccess>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Nominal (Rp)" name="amountIdr">
                    <input id="amountIdr" name="amountIdr" inputMode="numeric" placeholder={remaining ? remaining.toLocaleString('id-ID') : '5.000.000'} className={inputCls} />
                  </FormField>
                  <FormField label="Tanggal" name="paidOn">
                    <input id="paidOn" name="paidOn" type="date" defaultValue={todayIso()} className={inputCls} />
                  </FormField>
                  <FormField label="Metode" name="method">
                    <select id="method" name="method" defaultValue="transfer" className={inputCls}>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{METHOD_LABELS[m]}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Keterangan" name="note">
                    <input id="note" name="note" placeholder="cth. DP, pelunasan" className={inputCls} />
                  </FormField>
                </div>
              </ActionForm>
              <p className="mt-3 text-xs text-slate-500">Status otomatis naik ke “DP diterima” atau “Lunas” sesuai total pembayaran.</p>
            </div>
          </Card>

          <Card title="Zona berbahaya">
            <p className="mb-3 text-sm text-slate-500">Menghapus pendaftaran juga menghapus seluruh catatan pembayarannya. Untuk pembatalan biasa, cukup ubah status menjadi “Batal”.</p>
            <form action={deleteRegistration.bind(null, reg.id)}>
              <ConfirmButton message={`Hapus permanen pendaftaran ${reg.fullName} (${reg.code})?`} className={btnDanger}>
                <Trash2 className="size-4" /> Hapus pendaftaran
              </ConfirmButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
