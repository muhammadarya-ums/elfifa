import { FormField } from '@/components/admin/forms'
import { inputCls } from '@/components/admin/ui'
import { FAQ_CATEGORIES, type Faq, type Testimonial } from '@/lib/db/schema'

export const FAQ_CATEGORY_LABELS: Record<(typeof FAQ_CATEGORIES)[number], string> = {
  umroh: 'Umroh (beranda)',
  pembayaran: 'Pembayaran (beranda)',
  umum: 'Umum (beranda & KBIHU)',
  kbihu: 'KBIHU',
}

export function TestimonialFields({ t }: { t?: Testimonial }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Nama jamaah" name="name">
          <input id="name" name="name" defaultValue={t?.name} className={inputCls} />
        </FormField>
        <FormField label="Kota" name="city">
          <input id="city" name="city" defaultValue={t?.city} className={inputCls} />
        </FormField>
        <FormField label="Keterangan perjalanan" name="tripLabel" hint="cth. Umroh Januari 2026">
          <input id="tripLabel" name="tripLabel" defaultValue={t?.tripLabel} className={inputCls} />
        </FormField>
        <FormField label="Urutan" name="sortOrder">
          <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={t?.sortOrder ?? 0} className={inputCls} />
        </FormField>
      </div>
      <FormField label="Kutipan testimoni" name="quote" hint="Gunakan kata-kata jamaah apa adanya, dengan izin mereka.">
        <textarea id="quote" name="quote" rows={4} defaultValue={t?.quote} className={inputCls} />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" defaultChecked={t?.isPublished ?? true} className="size-4 accent-[#007a82]" />
        Tampilkan di website
      </label>
    </>
  )
}

export function FaqFields({ f }: { f?: Faq }) {
  return (
    <>
      <FormField label="Pertanyaan" name="question">
        <input id="question" name="question" defaultValue={f?.question} className={inputCls} />
      </FormField>
      <FormField label="Jawaban" name="answer">
        <textarea id="answer" name="answer" rows={4} defaultValue={f?.answer} className={inputCls} />
      </FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Kategori" name="category">
          <select id="category" name="category" defaultValue={f?.category ?? 'umum'} className={inputCls}>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>{FAQ_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Urutan" name="sortOrder">
          <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={f?.sortOrder ?? 0} className={inputCls} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" defaultChecked={f?.isPublished ?? true} className="size-4 accent-[#007a82]" />
        Tampilkan di website
      </label>
    </>
  )
}
