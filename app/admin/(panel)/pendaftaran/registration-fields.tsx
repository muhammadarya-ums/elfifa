import { FormField } from '@/components/admin/forms'
import { inputCls } from '@/components/admin/ui'
import { PROGRAMS, REGISTRATION_STATUSES, type Package, type Registration } from '@/lib/db/schema'
import { displayPhone } from '@/lib/format'
import { PROGRAM_LABELS, STATUS_LABELS } from '@/lib/labels'

/** Field form pendaftaran untuk tambah & edit di panel admin. */
export default function RegistrationFields({ reg, packages }: { reg?: Registration; packages: Pick<Package, 'id' | 'name' | 'isActive'>[] }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Program" name="program">
          <select id="program" name="program" defaultValue={reg?.program ?? 'umroh'} className={inputCls}>
            {PROGRAMS.map((p) => (
              <option key={p} value={p}>{PROGRAM_LABELS[p]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Paket (khusus umroh)" name="packageId">
          <select id="packageId" name="packageId" defaultValue={reg?.packageId ?? ''} className={inputCls}>
            <option value="">— Tidak ada —</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.isActive ? '' : ' (nonaktif)'}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Nama lengkap" name="fullName">
          <input id="fullName" name="fullName" defaultValue={reg?.fullName} className={inputCls} />
        </FormField>
        <FormField label="No. WhatsApp" name="phone">
          <input id="phone" name="phone" defaultValue={reg ? displayPhone(reg.phone) : ''} inputMode="tel" className={inputCls} />
        </FormField>
        <FormField label="Email" name="email">
          <input id="email" name="email" type="email" defaultValue={reg?.email} className={inputCls} />
        </FormField>
        <FormField label="Kota" name="city">
          <input id="city" name="city" defaultValue={reg?.city} className={inputCls} />
        </FormField>
        <FormField label="Jumlah jamaah" name="pax">
          <input id="pax" name="pax" type="number" min={1} max={50} defaultValue={reg?.pax ?? 1} className={inputCls} />
        </FormField>
        <FormField label="Total tagihan (Rp)" name="totalPriceIdr" hint={reg ? undefined : 'Kosongkan untuk hitung otomatis: harga paket × jumlah jamaah'}>
          <input
            id="totalPriceIdr"
            name="totalPriceIdr"
            inputMode="numeric"
            defaultValue={reg?.totalPriceIdr ? reg.totalPriceIdr.toLocaleString('id-ID') : ''}
            className={inputCls}
          />
        </FormField>
        <FormField label="Status" name="status">
          <select id="status" name="status" defaultValue={reg?.status ?? 'baru'} className={inputCls}>
            {REGISTRATION_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </FormField>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="hasPassport" defaultChecked={reg?.hasPassport} className="size-4 accent-[#007a82]" />
            Sudah memiliki paspor
          </label>
        </div>
      </div>
      <FormField label="Pesan dari jamaah" name="message">
        <textarea id="message" name="message" rows={2} defaultValue={reg?.message} className={inputCls} />
      </FormField>
      <FormField label="Catatan internal admin" name="adminNotes" hint="Tidak terlihat oleh jamaah">
        <textarea id="adminNotes" name="adminNotes" rows={3} defaultValue={reg?.adminNotes} className={inputCls} />
      </FormField>
    </>
  )
}
