import { FormField } from '@/components/admin/forms'
import { inputCls } from '@/components/admin/ui'
import type { Schedule } from '@/lib/db/schema'

export default function ScheduleFields({ schedule }: { schedule?: Schedule }) {
  return (
    <>
      <FormField label="Tanggal" name="date">
        <input id="date" name="date" type="date" defaultValue={schedule?.date} className={inputCls} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Mulai" name="startTime">
          <input id="startTime" name="startTime" type="time" defaultValue={schedule?.startTime ?? '08:00'} className={inputCls} />
        </FormField>
        <FormField label="Selesai" name="endTime">
          <input id="endTime" name="endTime" type="time" defaultValue={schedule?.endTime ?? '11:30'} className={inputCls} />
        </FormField>
      </div>
      <FormField label="Materi" name="topic">
        <input id="topic" name="topic" defaultValue={schedule?.topic} placeholder="Praktik Penggunaan Kain Ihram" className={inputCls} />
      </FormField>
      <FormField label="Lokasi" name="location">
        <input id="location" name="location" defaultValue={schedule?.location} placeholder="Asrama Haji Bekasi" className={inputCls} />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" defaultChecked={schedule?.isPublished ?? true} className="size-4 accent-[#007a82]" />
        Tampilkan di website
      </label>
    </>
  )
}
