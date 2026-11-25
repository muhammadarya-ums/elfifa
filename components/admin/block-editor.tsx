'use client'

import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { startTransition, useActionState, useEffect, useState } from 'react'
import type { ActionResult } from '@/app/actions/admin'
import type { BlockDef, ListField, ScalarField } from '@/lib/content-def'
import { cn } from '@/lib/utils'
import { ImagePicker } from './image-picker'
import type { MediaItem } from './media-upload'
import { btnPrimary, btnSecondary, inputCls } from './ui'

type Item = Record<string, string>
type Value = Record<string, string | Item[]>

function emptyItem(f: ListField): Item {
  return Object.fromEntries(f.fields.map((sf) => [sf.key, sf.type === 'select' ? sf.options[0].value : '']))
}

export default function BlockEditor({
  def,
  initial,
  library: initialLibrary,
  action,
}: {
  def: BlockDef
  initial: Value
  library: MediaItem[]
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>
}) {
  const [value, setValue] = useState<Value>(initial)
  const [library, setLibrary] = useState(initialLibrary)
  const [dirty, setDirty] = useState(false)
  const [state, formAction, pending] = useActionState(action, null)

  useEffect(() => {
    if (state?.ok) setDirty(false)
  }, [state])

  const set = (key: string, v: string | Item[]) => {
    setValue((prev) => ({ ...prev, [key]: v }))
    setDirty(true)
  }
  const onUploaded = (m: MediaItem) => setLibrary((l) => [m, ...l])

  const scalar = (f: ScalarField, v: string, onChange: (v: string) => void, id: string) => {
    const counter = 'max' in f && (
      <span className={cn('ml-2 font-normal normal-case', v.length > f.max ? 'text-rose-600' : 'text-slate-400')}>
        {v.length}/{f.max}
      </span>
    )
    return (
      <div key={id}>
        <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          {f.label}
          {counter}
        </label>
        {f.type === 'text' && <input id={id} value={v} onChange={(e) => onChange(e.target.value)} className={inputCls} />}
        {f.type === 'textarea' && (
          <textarea id={id} value={v} rows={f.rows ?? 3} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        )}
        {f.type === 'markdown' && (
          <textarea id={id} value={v} rows={22} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, 'font-mono text-[13px] leading-6')} />
        )}
        {f.type === 'select' && (
          <select id={id} value={v} onChange={(e) => onChange(e.target.value)} className={inputCls}>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        {f.type === 'image' && <ImagePicker value={v} onChange={onChange} library={library} onUploaded={onUploaded} optional={f.optional} />}
        {'hint' in f && f.hint && <p className="mt-1 text-xs text-slate-400">{f.hint}</p>}
      </div>
    )
  }

  const issues = state?.ok === false ? (state.fieldErrors?._ ?? []) : []

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData()
        fd.set('value', JSON.stringify(value))
        startTransition(() => formAction(fd))
      }}
    >
      {def.fields.map((f) => {
        if (f.type !== 'list') return scalar(f, String(value[f.key] ?? ''), (v) => set(f.key, v), f.key)
        const items = (value[f.key] as Item[]) ?? []
        const update = (next: Item[]) => set(f.key, next)
        return (
          <fieldset key={f.key} className="rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-bold text-slate-800">
              {f.label} <span className="font-normal text-slate-400">({items.length}/{f.max})</span>
            </legend>
            <ol className="grid gap-4">
              {items.map((item, i) => (
                <li key={i} className="rounded-lg bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {f.itemLabel} #{i + 1}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" disabled={i === 0} onClick={() => update(items.map((x, j) => (j === i - 1 ? items[i] : j === i ? items[i - 1] : x)))} className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30" aria-label="Naikkan">
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" disabled={i === items.length - 1} onClick={() => update(items.map((x, j) => (j === i + 1 ? items[i] : j === i ? items[i + 1] : x)))} className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30" aria-label="Turunkan">
                        <ArrowDown className="size-4" />
                      </button>
                      <button type="button" disabled={items.length <= f.min} onClick={() => update(items.filter((_, j) => j !== i))} className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-30" aria-label="Hapus">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {f.fields.map((sf) => (
                      <div key={sf.key} className={sf.type === 'textarea' || sf.type === 'image' ? 'sm:col-span-2' : ''}>
                        {scalar(sf, item[sf.key] ?? '', (v) => update(items.map((x, j) => (j === i ? { ...x, [sf.key]: v } : x))), `${f.key}-${i}-${sf.key}`)}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" disabled={items.length >= f.max} onClick={() => update([...items, emptyItem(f)])} className={cn(btnSecondary, 'mt-4 px-3 py-1.5 text-xs')}>
              <Plus className="size-4" /> Tambah {f.itemLabel.toLowerCase()}
            </button>
          </fieldset>
        )
      })}

      {state && (
        <div role={state.ok ? 'status' : 'alert'} className={cn('rounded-lg border px-3 py-2 text-sm', state.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700')}>
          {state.message}
          {issues.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {issues.slice(0, 8).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
        <span className="text-xs text-slate-500">{dirty ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan tersimpan'}</span>
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Simpan & terbitkan
        </button>
      </div>
    </form>
  )
}
