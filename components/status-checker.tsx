'use client'

import { CalendarDays, CheckCircle2, Circle, Loader2, Search, Users, XCircle } from 'lucide-react'
import { startTransition, useActionState } from 'react'
import { checkStatus, type StatusState } from '@/app/actions/public'
import { formatDate, formatRupiah } from '@/lib/format'
import { STATUS_DESCRIPTIONS, STATUS_LABELS, STATUS_STYLES } from '@/lib/labels'
import { cn } from '@/lib/utils'

const FLOW = ['baru', 'dihubungi', 'dp', 'lunas', 'berangkat'] as const

export default function StatusChecker({ defaultCode, bankInfo }: { defaultCode?: string; bankInfo: string }) {
  const [state, action, pending] = useActionState<StatusState, FormData>(checkStatus, { status: 'idle' })

  const inputCls =
    'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/12'

  return (
    <div className="grid gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          startTransition(() => action(fd))
        }}
        className="grid gap-4 rounded-[1.75rem] bg-white p-6 ring-1 ring-sand-200 sm:p-7 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-semibold text-ink">
            Kode pendaftaran
          </label>
          <input
            id="code"
            name="code"
            required
            defaultValue={defaultCode}
            placeholder="ELF-AB12CD"
            autoCapitalize="characters"
            className={cn(inputCls, 'font-mono uppercase tracking-wider')}
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink">
            Nomor WhatsApp terdaftar
          </label>
          <input id="phone" name="phone" required inputMode="tel" placeholder="0812xxxxxxxx" className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-7 py-3 font-bold text-white transition hover:bg-brand-800 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Cek
        </button>
      </form>

      {state.status === 'error' && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      {state.status === 'found' && <Result result={state.result} bankInfo={bankInfo} />}
    </div>
  )
}

function Result({ result, bankInfo }: { result: Extract<StatusState, { status: 'found' }>['result']; bankInfo: string }) {
  const remaining = Math.max(0, result.totalPriceIdr - result.paidIdr)
  const progress = result.totalPriceIdr > 0 ? Math.min(100, Math.round((result.paidIdr / result.totalPriceIdr) * 100)) : 0
  const currentIndex = FLOW.indexOf(result.status as (typeof FLOW)[number])
  const cancelled = result.status === 'batal'

  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-sand-200" aria-live="polite">
      <div className="flex flex-col gap-3 border-b border-sand-200 bg-sand-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-bold tracking-wider text-ink-muted">{result.code}</p>
          <h2 className="font-display mt-1 text-2xl text-ink">{result.fullName}</h2>
          <p className="text-sm text-ink-soft">{result.packageName ?? result.programLabel}</p>
        </div>
        <span className={cn('w-fit rounded-full px-3 py-1 text-sm font-bold ring-1', STATUS_STYLES[result.status])}>
          {STATUS_LABELS[result.status]}
        </span>
      </div>

      <div className="grid gap-6 p-6">
        <p className="text-sm leading-6 text-ink-soft">{STATUS_DESCRIPTIONS[result.status]}</p>

        {!cancelled && (
          <ol className="grid grid-cols-5 gap-2">
            {FLOW.map((step, i) => {
              const done = currentIndex >= i || result.status === 'selesai'
              return (
                <li key={step} className="flex flex-col items-center gap-1.5 text-center">
                  {done ? <CheckCircle2 className="size-6 text-emerald-500" /> : <Circle className="size-6 text-sand-300" />}
                  <span className={cn('text-[11px] font-semibold leading-tight', done ? 'text-ink' : 'text-ink-muted')}>
                    {STATUS_LABELS[step]}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
        {cancelled && (
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-600">
            <XCircle className="size-5" /> Pendaftaran dibatalkan
          </p>
        )}

        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-sand-50 p-4">
            <dt className="flex items-center gap-1.5 text-ink-muted"><Users className="size-4" /> Jamaah</dt>
            <dd className="mt-1 font-bold text-ink">{result.pax} orang</dd>
          </div>
          <div className="rounded-xl bg-sand-50 p-4">
            <dt className="flex items-center gap-1.5 text-ink-muted"><CalendarDays className="size-4" /> Keberangkatan</dt>
            <dd className="mt-1 font-bold text-ink">{formatDate(result.departureDate)}</dd>
          </div>
          <div className="rounded-xl bg-sand-50 p-4">
            <dt className="text-ink-muted">Terdaftar</dt>
            <dd className="mt-1 font-bold text-ink">{new Date(result.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
          </div>
        </dl>

        {result.totalPriceIdr > 0 && (
          <div className="rounded-xl border border-sand-200 p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm text-ink-muted">Pembayaran</p>
                <p className="text-lg font-bold text-ink">
                  {formatRupiah(result.paidIdr)} <span className="text-sm font-medium text-ink-muted">dari {formatRupiah(result.totalPriceIdr)}</span>
                </p>
              </div>
              <p className={cn('text-sm font-bold', remaining === 0 ? 'text-emerald-600' : 'text-amber-700')}>
                {remaining === 0 ? 'Lunas' : `Sisa ${formatRupiah(remaining)}`}
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand-200">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            {result.payments.length > 0 && (
              <ul className="mt-4 divide-y divide-sand-200 text-sm">
                {result.payments.map((p, i) => (
                  <li key={i} className="flex justify-between py-2">
                    <span className="text-ink-soft">{formatDate(p.paidOn)}</span>
                    <span className="font-semibold text-ink">{p.amount}</span>
                  </li>
                ))}
              </ul>
            )}
            {remaining > 0 && result.status !== 'batal' && (
              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                Pembayaran dapat ditransfer ke: <strong>{bankInfo}</strong>. Sertakan kode <strong>{result.code}</strong> pada
                berita transfer dan kirim bukti transfer via WhatsApp.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
