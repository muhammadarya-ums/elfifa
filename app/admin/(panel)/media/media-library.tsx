'use client'

import { Check, Copy, Loader2, Trash2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useRef, useState } from 'react'
import { deleteMedia } from '@/app/actions/admin'
import { uploadImage } from '@/components/admin/media-upload'
import { btnPrimary } from '@/components/admin/ui'

type Item = { id: string; url: string; fileName: string; width: number; height: number; bytes: number; uploadedBy: string; createdAt: string }

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(deleteMedia.bind(null, id), null)
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(`Hapus "${name}"?`)) startTransition(() => action(new FormData()))
        }}
        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        aria-label={`Hapus ${name}`}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      </button>
      {state && !state.ok && <p className="mt-1 text-[11px] leading-4 text-rose-600">{state.message}</p>}
    </div>
  )
}

export default function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])
  const [copied, setCopied] = useState('')

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setErrors([])
    const errs: string[] = []
    const list = Array.from(files).slice(0, 20)
    for (const [i, f] of list.entries()) {
      setProgress(`Mengunggah ${i + 1} dari ${list.length}…`)
      try {
        await uploadImage(f)
      } catch (e) {
        errs.push(`${f.name}: ${e instanceof Error ? e.message : 'gagal'}`)
      }
    }
    setProgress('')
    setErrors(errs)
    if (fileRef.current) fileRef.current.value = ''
    router.refresh()
  }

  return (
    <>
      <div className="mb-6 rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center">
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" className="hidden" onChange={(e) => upload(e.target.files)} />
        <button type="button" disabled={!!progress} onClick={() => fileRef.current?.click()} className={btnPrimary}>
          {progress ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {progress || 'Upload gambar'}
        </button>
        <p className="mt-2 text-xs text-slate-500">Bisa pilih beberapa sekaligus (maks. 20). JPG, PNG, WebP, AVIF, HEIC. SVG tidak diizinkan demi keamanan.</p>
        {errors.length > 0 && (
          <ul className="mx-auto mt-3 max-w-lg text-left text-xs text-rose-600">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">Belum ada gambar.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <a href={m.url} target="_blank" rel="noopener">
                <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
              </a>
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800" title={m.fileName}>{m.fileName}</p>
                  <p className="text-[11px] text-slate-500">
                    {m.width}×{m.height} · {Math.round(m.bytes / 1024)} KB
                  </p>
                </div>
                <div className="flex shrink-0 items-start">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(location.origin + m.url).then(() => setCopied(m.id), () => {})}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Salin tautan"
                  >
                    {copied === m.id ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                  <DeleteButton id={m.id} name={m.fileName} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
