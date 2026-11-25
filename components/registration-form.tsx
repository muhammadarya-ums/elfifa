'use client'

import { Check, Copy, Loader2, Search } from 'lucide-react'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { submitRegistration, type RegistrationState } from '@/app/actions/public'
import { WhatsAppIcon } from '@/components/social-icons'
import { cn } from '@/lib/utils'

type PackageOption = { slug: string; label: string; seatsLeft: number }

type Props =
  | { variant: 'umroh'; packages: PackageOption[]; defaultPackageSlug?: string; className?: string }
  | { variant: 'kbihu'; className?: string }

const initialState: RegistrationState = { status: 'idle' }

const inputCls =
  'w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-muted/60 hover:border-sand-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/12 aria-[invalid=true]:border-rose-400'
const labelCls = 'mb-1.5 block text-[13px] font-semibold text-ink'

export default function RegistrationForm(props: Props) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState)
  const isUmroh = props.variant === 'umroh'
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<HTMLParagraphElement>(null)

  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}

  // Pindahkan fokus ke field pertama yang salah (aksesibilitas)
  useEffect(() => {
    if (state.status !== 'error') return
    const first = Object.keys(errors)[0]
    const el = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null
    ;(el ?? alertRef.current)?.focus()
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  if (state.status === 'success') {
    return <SuccessCard state={state} className={props.className} />
  }

  const invalid = (name: string) => (errors[name]?.length ? true : undefined)

  return (
    <form
      ref={formRef}
      className={cn('grid gap-5', props.className)}
      noValidate
      onSubmit={(e) => {
        // Submit via transition: isian tidak ter-reset bila validasi gagal
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => formAction(fd))
      }}
    >
      {/* Honeypot anti-bot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {isUmroh ? (
        <>
          <input type="hidden" name="program" value="umroh" />
          <Field label="Paket umroh" error={errors.packageSlug} htmlFor="packageSlug">
            <select
              id="packageSlug"
              name="packageSlug"
              required
              aria-invalid={invalid('packageSlug')}
              defaultValue={props.defaultPackageSlug ?? props.packages.find((p) => p.seatsLeft > 0)?.slug ?? ''}
              className={inputCls}
            >
              {props.packages.map((p) => (
                <option key={p.slug} value={p.slug} disabled={p.seatsLeft === 0}>
                  {p.label}
                  {p.seatsLeft === 0 ? ' — penuh' : p.seatsLeft <= 10 ? ` — sisa ${p.seatsLeft} kursi` : ''}
                </option>
              ))}
            </select>
          </Field>
        </>
      ) : (
        <Field label="Program bimbingan" error={errors.program} htmlFor="program">
          <select id="program" name="program" defaultValue="kbihu_haji" className={inputCls}>
            <option value="kbihu_haji">Bimbingan manasik haji</option>
            <option value="kbihu_umrah">Bimbingan manasik umrah</option>
          </select>
        </Field>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama lengkap" hint="Sesuai KTP / paspor" error={errors.fullName} htmlFor="fullName">
          <input id="fullName" name="fullName" required autoComplete="name" aria-invalid={invalid('fullName')} className={inputCls} />
        </Field>
        <Field label="Nomor WhatsApp" error={errors.phone} htmlFor="phone">
          <input
            id="phone"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            aria-invalid={invalid('phone')}
            className={inputCls}
          />
        </Field>
        <Field label="Email" optional error={errors.email} htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" aria-invalid={invalid('email')} className={inputCls} />
        </Field>
        <Field label="Kota domisili" optional error={errors.city} htmlFor="city">
          <input id="city" name="city" autoComplete="address-level2" className={inputCls} />
        </Field>
        <Field label="Jumlah jamaah" error={errors.pax} htmlFor="pax">
          <input id="pax" name="pax" type="number" inputMode="numeric" min={1} max={20} defaultValue={1} required aria-invalid={invalid('pax')} className={inputCls} />
        </Field>
        {isUmroh && (
          <Field label="Paspor" error={errors.hasPassport} htmlFor="hasPassport">
            <select id="hasPassport" name="hasPassport" defaultValue="tidak" className={inputCls}>
              <option value="ya">Sudah punya</option>
              <option value="tidak">Belum / sedang diurus</option>
            </select>
          </Field>
        )}
      </div>

      <Field label="Catatan untuk tim kami" optional error={errors.message} htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Misalnya: ingin sekamar dengan keluarga, membutuhkan kursi roda, dll."
          className={cn(inputCls, 'resize-y')}
        />
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-6 text-ink-soft">
          <input
            type="checkbox"
            name="consent"
            aria-invalid={invalid('consent')}
            className="mt-1 size-4 shrink-0 cursor-pointer rounded border-sand-400 accent-brand-700"
          />
          <span>
            Saya menyetujui data ini digunakan untuk keperluan pendaftaran sesuai{' '}
            <a href="/kebijakan-privasi" target="_blank" className="font-semibold text-brand-700 underline underline-offset-2">
              Kebijakan Privasi
            </a>
            .
          </span>
        </label>
        {errors.consent?.[0] && <p className="mt-1.5 pl-7 text-[12.5px] font-medium text-rose-600">{errors.consent[0]}</p>}
      </div>

      {state.status === 'error' && (
        <p ref={alertRef} tabIndex={-1} role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] text-rose-700 outline-none">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold text-white transition-[background-color,transform] active:scale-[0.99] disabled:opacity-70',
          'bg-brand-700 hover:bg-brand-800',
        )}
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? 'Mengirim pendaftaran…' : 'Kirim pendaftaran'}
      </button>
    </form>
  )
}

function Field({
  label,
  hint,
  optional,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  optional?: boolean
  error?: string[]
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-muted">(opsional)</span>}
        {hint && <span className="ml-1.5 font-normal text-ink-muted">· {hint}</span>}
      </label>
      {children}
      {error?.[0] && <p className="mt-1.5 text-[12.5px] font-medium text-rose-600">{error[0]}</p>}
    </div>
  )
}

function SuccessCard({ state, className }: { state: Extract<RegistrationState, { status: 'success' }>; className?: string }) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])

  return (
    <div ref={ref} tabIndex={-1} className={cn('py-4 text-center outline-none', className)} role="status">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-8 ring-brand-50/50">
        <Check className="size-7" strokeWidth={2.5} />
      </span>
      <h3 className="font-display mt-6 text-3xl text-ink">Pendaftaran diterima.</h3>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-ink-soft">
        Terima kasih, {state.name}. Pendaftaran <strong className="font-semibold text-ink">{state.programLabel}</strong> sudah tercatat.
        Simpan kode berikut untuk memantau status Anda.
      </p>
      <div className="mx-auto mt-7 flex max-w-xs items-center justify-between gap-3 rounded-2xl border border-dashed border-sand-400 bg-sand-50 px-5 py-4">
        <span className="font-mono text-2xl font-semibold tracking-[0.12em] text-ink">{state.code}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(state.code).then(() => setCopied(true), () => {})
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-brand-700 hover:bg-brand-50"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={state.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1fa855] px-6 py-3.5 text-[14.5px] font-semibold text-white hover:bg-[#1a9049]"
        >
          <WhatsAppIcon className="size-4" /> Konfirmasi via WhatsApp
        </a>
        <a
          href={`/cek-status?kode=${encodeURIComponent(state.code)}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-sand-300 px-6 py-3.5 text-[14.5px] font-semibold text-ink hover:border-sand-400 hover:bg-sand-50"
        >
          <Search className="size-4" /> Cek status
        </a>
      </div>
    </div>
  )
}
