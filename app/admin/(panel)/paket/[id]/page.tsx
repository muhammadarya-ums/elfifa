import { eq } from 'drizzle-orm'
import { Trash2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { deletePackage, savePackage } from '@/app/actions/admin'
import { ActionForm, ConfirmButton, FormField } from '@/components/admin/forms'
import { btnDanger, Card, inputCls, Notice, PageHeader } from '@/components/admin/ui'
import { getDb, schema } from '@/lib/db'
import type { Package } from '@/lib/db/schema'

export const metadata = { title: 'Paket' }

export default async function PackageFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ disimpan?: string }>
}) {
  const [{ id: idParam }, sp] = await Promise.all([params, searchParams])
  const isNew = idParam === 'baru'
  let pkg: Package | undefined
  if (!isNew) {
    const id = Number(idParam)
    if (!Number.isInteger(id)) notFound()
    const db = await getDb()
    pkg = await db.select().from(schema.packages).where(eq(schema.packages.id, id)).get()
    if (!pkg) notFound()
  }

  const num = (v: number | null | undefined) => (v ? v.toLocaleString('id-ID') : '')

  return (
    <>
      <PageHeader title={pkg ? pkg.name : 'Paket baru'} back={{ href: '/admin/paket', label: 'Paket Umroh' }} />
      {sp.disimpan && <Notice>Paket berhasil dibuat.</Notice>}

      <ActionForm action={savePackage.bind(null, pkg?.id ?? null)} submitLabel={pkg ? 'Simpan perubahan' : 'Buat paket'} className="gap-6">
        <Card title="Informasi utama">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nama paket" name="name" className="sm:col-span-2">
              <input id="name" name="name" defaultValue={pkg?.name} placeholder="Umroh 17 Hari Awal Musim Dingin" className={inputCls} />
            </FormField>
            <FormField label="Tagline" name="tagline" hint="Teks kecil di bawah judul hero, cth. “Awal Musim Dingin”">
              <input id="tagline" name="tagline" defaultValue={pkg?.tagline} className={inputCls} />
            </FormField>
            <FormField label="Slug URL" name="slug" hint="Kosongkan untuk dibuat otomatis dari nama">
              <input id="slug" name="slug" defaultValue={pkg?.slug} placeholder="umroh-17-hari" className={inputCls} />
            </FormField>
            <FormField label="Deskripsi" name="description" className="sm:col-span-2">
              <textarea id="description" name="description" rows={3} defaultValue={pkg?.description} className={inputCls} />
            </FormField>
            <FormField label="Durasi (hari)" name="durationDays">
              <input id="durationDays" name="durationDays" type="number" min={1} defaultValue={pkg?.durationDays ?? 12} className={inputCls} />
            </FormField>
            <FormField label="Tanggal keberangkatan" name="departureDate">
              <input id="departureDate" name="departureDate" type="date" defaultValue={pkg?.departureDate ?? ''} className={inputCls} />
            </FormField>
            <FormField label="Maskapai" name="airline">
              <input id="airline" name="airline" defaultValue={pkg?.airline} placeholder="Saudia Airlines" className={inputCls} />
            </FormField>
            <FormField label="Kuota kursi" name="quota">
              <input id="quota" name="quota" type="number" min={1} defaultValue={pkg?.quota ?? 45} className={inputCls} />
            </FormField>
            <FormField label="Harga per orang (Rp)" name="priceIdr">
              <input id="priceIdr" name="priceIdr" inputMode="numeric" defaultValue={num(pkg?.priceIdr)} placeholder="39.900.000" className={inputCls} />
            </FormField>
            <FormField label="Harga coret (Rp)" name="originalPriceIdr" hint="Opsional, untuk menampilkan diskon">
              <input id="originalPriceIdr" name="originalPriceIdr" inputMode="numeric" defaultValue={num(pkg?.originalPriceIdr)} className={inputCls} />
            </FormField>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {(['Makkah', 'Madinah'] as const).map((city) => {
            const k = `hotel${city}` as const
            return (
              <Card key={city} title={`Hotel ${city}`}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Nama hotel" name={k} className="sm:col-span-2">
                    <input id={k} name={k} defaultValue={pkg?.[k]} className={inputCls} />
                  </FormField>
                  <FormField label="Bintang" name={`${k}Stars`}>
                    <select id={`${k}Stars`} name={`${k}Stars`} defaultValue={pkg?.[`${k}Stars`] ?? 3} className={inputCls}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} bintang</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Jumlah hari" name={`${k}Nights`}>
                    <input id={`${k}Nights`} name={`${k}Nights`} type="number" min={0} defaultValue={pkg?.[`${k}Nights`] ?? 0} className={inputCls} />
                  </FormField>
                  <FormField label="Keterangan jarak" name={`${k}Note`} className="sm:col-span-2">
                    <input id={`${k}Note`} name={`${k}Note`} defaultValue={pkg?.[`${k}Note`]} placeholder="± 250 meter dari masjid" className={inputCls} />
                  </FormField>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Termasuk dalam harga">
            <FormField label="Satu item per baris" name="includes">
              <textarea id="includes" name="includes" rows={7} defaultValue={pkg?.includes} className={inputCls} />
            </FormField>
          </Card>
          <Card title="Bonus">
            <FormField label="Satu item per baris" name="bonuses">
              <textarea id="bonuses" name="bonuses" rows={7} defaultValue={pkg?.bonuses} className={inputCls} />
            </FormField>
          </Card>
        </div>

        <Card title="Tampilan">
          <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="isActive" defaultChecked={pkg?.isActive ?? true} className="size-4 accent-[#007a82]" />
              Aktif (tampil di website)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="isFeatured" defaultChecked={pkg?.isFeatured ?? false} className="size-4 accent-[#007a82]" />
              Jadikan paket unggulan
            </label>
            <FormField label="Urutan" name="sortOrder" hint="Angka kecil tampil lebih dulu">
              <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={pkg?.sortOrder ?? 0} className={inputCls} />
            </FormField>
          </div>
        </Card>
      </ActionForm>

      {pkg && (
        <Card title="Hapus paket" className="mt-6">
          <p className="mb-3 text-sm text-slate-500">
            Paket yang sudah memiliki pendaftar tidak akan dihapus, melainkan dinonaktifkan agar riwayat pendaftaran tetap utuh.
          </p>
          <form action={deletePackage.bind(null, pkg.id)}>
            <ConfirmButton message={`Hapus paket "${pkg.name}"?`} className={btnDanger}>
              <Trash2 className="size-4" /> Hapus paket
            </ConfirmButton>
          </form>
        </Card>
      )}
    </>
  )
}
