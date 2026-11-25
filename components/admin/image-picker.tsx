'use client'

import { ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { uploadImage, type MediaItem } from './media-upload'
import { btnSecondary } from './ui'

/**
 * Pemilih gambar: pilih dari pustaka media atau upload baru.
 * Nilainya URL (/media/<id>) — dipakai di editor konten & form paket.
 */
export function ImagePicker({
  value,
  onChange,
  library,
  onUploaded,
  optional,
  name,
}: {
  value: string
  onChange: (url: string) => void
  library: MediaItem[]
  onUploaded?: (m: MediaItem) => void
  optional?: boolean
  /** Bila diisi, nilai ikut terkirim sebagai input tersembunyi (untuk form biasa) */
  name?: string
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const m = await uploadImage(file)
      onUploaded?.(m)
      onChange(m.url)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      {name && <input type="hidden" name={name} value={value} />}
      <div className="flex items-center gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6 text-slate-300" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className={cn(btnSecondary, 'px-3 py-1.5 text-xs')}>
            {value ? 'Ganti gambar' : 'Pilih gambar'}
          </button>
          {optional && value && (
            <button type="button" onClick={() => onChange('')} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
              Hapus
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Pustaka media">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h2 className="text-sm font-bold text-slate-800">Pustaka media</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Tutup">
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-slate-100 px-5 py-3">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={cn(btnSecondary, 'text-xs')}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {busy ? 'Mengunggah & mengompres…' : 'Upload gambar baru'}
              </button>
              <span className="ml-3 text-xs text-slate-500">JPG, PNG, WebP, AVIF, HEIC · dikompres otomatis</span>
              {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
            </div>
            <div className="overflow-y-auto p-5">
              {library.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">Belum ada gambar. Upload gambar pertama Anda.</p>
              ) : (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {library.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(m.url)
                          setOpen(false)
                        }}
                        className={cn(
                          'group block w-full overflow-hidden rounded-lg border-2 text-left',
                          value === m.url ? 'border-[#007a82]' : 'border-transparent hover:border-slate-300',
                        )}
                      >
                        <img src={m.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                        <span className="block truncate px-1 py-1 text-[11px] text-slate-500">{m.fileName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Versi untuk form biasa: menyimpan state sendiri & mengirim nilai lewat input tersembunyi. */
export function ImageField({ name, defaultValue = '', library, optional }: { name: string; defaultValue?: string; library: MediaItem[]; optional?: boolean }) {
  const [value, setValue] = useState(defaultValue)
  const [lib, setLib] = useState(library)
  return <ImagePicker name={name} value={value} onChange={setValue} library={lib} onUploaded={(m) => setLib((l) => [m, ...l])} optional={optional} />
}
