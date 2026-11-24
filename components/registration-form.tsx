'use client'

import { Check, Copy, Loader2, Search } from 'lucide-react'
import { startTransition, useActionState, useState } from 'react'
import { submitRegistration, type RegistrationState } from '@/app/actions/public'
import { WhatsAppIcon } from '@/components/social-icons'
import { cn } from '@/lib/utils'

type PackageOption = { slug: string; label: string; seatsLeft: number }

type Props =
  | { variant: 'umroh'; packages: PackageOption[]; defaultPackageSlug?: string; className?: string }
  | { variant: 'kbihu'; className?: string }

const initialState: RegistrationState = { status: 'idle' }

export default function RegistrationForm(props: Props) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState)
  const isUmroh = props.variant === 'umroh'
  const accent = isUmroh ? 'focus:border-[#007a82] focus:ring-[#007a82]/15' : 'focus:border-[#007a82] focus:ring-[#007a82]/15'

  if (state.status === 'success') {
    return <SuccessCard state={state} className={props.className} />
  }

  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}
  const inputCls = cn(
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4',
    accent,
  )
  const labelCls = 'mb-1.5 block text-sm font-semibold text-slate-700'

  return (
    <form
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
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {isUmroh ? (
        <>
          <input type="hidden" name="program" value="umroh" />
          <Field label="Paket umroh" error={errors.packageSlug} labelCls={labelCls} htmlFor="packageSlug">
            <select
              id="packageSlug"
              name="packageSlug"
              required
              defaultValue={props.defaultPackageSlug ?? props.packages[0]?.slug ?? ''}
              className={inputCls}
            >
              {props.packages.map((p) => (
                <option key={p.slug} value={p.slug} disabled={p.seatsLeft === 0}>
                  {p.label}
                  {p.seatsLeft === 0 ? ' — PENUH' : p.seatsLeft <= 10 ? ` — sisa ${p.seatsLeft} kursi` : ''}
                </option>
              ))}
            </select>
          </Field>
        </>
      ) : (
        <Field label="Program bimbingan" error={errors.program} labelCls={labelCls} htmlFor="program">
          <select id="program" name="program" defaultValue="kbihu_haji" className={inputCls}>
            <option value="kbihu_haji">Bimbingan Manasik Haji</option>
            <option value="kbihu_umrah">Bimbingan Manasik Umrah</option>
          </select>
        </Field>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama lengkap (sesuai KTP)" error={errors.fullName} labelCls={labelCls} htmlFor="fullName">
          <input id="fullName" name="fullName" required autoComplete="name" placeholder="cth. Ahmad Fauzi" className={inputCls} />
        </Field>
        <Field label="Nomor WhatsApp" error={errors.phone} labelCls={labelCls} htmlFor="phone">
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812xxxxxxxx"
            className={inputCls}
          />
        </Field>
        <Field label="Email (opsional)" error={errors.email} labelCls={labelCls} htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" className={inputCls} />
        </Field>
        <Field label="Kota domisili" error={errors.city} labelCls={labelCls} htmlFor="city">
          <input id="city" name="city" autoComplete="address-level2" placeholder="cth. Surabaya" className={inputCls} />
        </Field>
        <Field label="Jumlah jamaah" error={errors.pax} labelCls={labelCls} htmlFor="pax">
          <input id="pax" name="pax" type="number" min={1} max={20} defaultValue={1} required className={inputCls} />
        </Field>
        {isUmroh && (
          <Field label="Sudah punya paspor?" error={errors.hasPassport} labelCls={labelCls} htmlFor="hasPassport">
            <select id="hasPassport" name="hasPassport" defaultValue="tidak" className={inputCls}>
              <option value="ya">Sudah punya</option>
              <option value="tidak">Belum / sedang diurus</option>
            </select>
          </Field>
        )}
      </div>

      <Field label="Pesan / pertanyaan (opsional)" error={errors.message} labelCls={labelCls} htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="cth. Ingin sekamar dengan keluarga, butuh kursi roda, dll."
          className={cn(inputCls, 'resize-y')}
        />
      </Field>

      {state.status === 'error' && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Data Anda hanya digunakan untuk keperluan pendaftaran dan tidak dibagikan ke pihak lain.
        </p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70',
            isUmroh ? 'bg-[#d9923b] shadow-[#d9923b]/25 hover:bg-[#b57930]' : 'bg-[#007a82] shadow-[#007a82]/20 hover:bg-[#00656c]',
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? 'Mengirim…' : 'Kirim Pendaftaran'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  labelCls,
  htmlFor,
  children,
}: {
  label: string
  error?: string[]
  labelCls: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {error?.[0] && <p className="mt-1.5 text-xs font-medium text-rose-600">{error[0]}</p>}
    </div>
  )
}

function SuccessCard({
  state,
  className,
}: {
  state: Extract<RegistrationState, { status: 'success' }>
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  return (
    <div className={cn('rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8', className)} role="status">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="size-7" />
      </span>
      <h3 className="mt-4 text-xl font-bold text-slate-900">Alhamdulillah, pendaftaran terkirim!</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Terima kasih, {state.name}. Pendaftaran <strong>{state.programLabel}</strong> sudah kami terima. Simpan kode berikut
        untuk mengecek status pendaftaran Anda.
      </p>
      <div className="mx-auto mt-5 flex max-w-xs items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3">
        <span className="font-mono text-xl font-bold tracking-wider text-slate-900">{state.code}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(state.code).then(() => setCopied(true), () => {})
          }}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={state.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#1fb457]"
        >
          <WhatsAppIcon className="size-4" /> Konfirmasi via WhatsApp
        </a>
        <a
          href={`/cek-status?kode=${encodeURIComponent(state.code)}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Search className="size-4" /> Cek Status
        </a>
      </div>
    </div>
  )
}
