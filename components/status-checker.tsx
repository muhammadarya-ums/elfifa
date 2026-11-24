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
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-[#007a82] focus:ring-4 focus:ring-[#007a82]/15'

  return (
    <div className="grid gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          startTransition(() => action(fd))
        }}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-semibold text-slate-700">
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
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Nomor WhatsApp terdaftar
          </label>
          <input id="phone" name="phone" required inputMode="tel" placeholder="0812xxxxxxxx" className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#007a82] px-6 py-3 font-bold text-white transition hover:bg-[#00656c] disabled:opacity-70"
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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-live="polite">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-bold tracking-wider text-slate-500">{result.code}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{result.fullName}</h2>
          <p className="text-sm text-slate-600">{result.packageName ?? result.programLabel}</p>
        </div>
        <span className={cn('w-fit rounded-full px-3 py-1 text-sm font-bold ring-1', STATUS_STYLES[result.status])}>
          {STATUS_LABELS[result.status]}
        </span>
      </div>

      <div className="grid gap-6 p-6">
        <p className="text-sm leading-6 text-slate-600">{STATUS_DESCRIPTIONS[result.status]}</p>

        {!cancelled && (
          <ol className="grid grid-cols-5 gap-2">
            {FLOW.map((step, i) => {
              const done = currentIndex >= i || result.status === 'selesai'
              return (
                <li key={step} className="flex flex-col items-center gap-1.5 text-center">
                  {done ? <CheckCircle2 className="size-6 text-emerald-500" /> : <Circle className="size-6 text-slate-300" />}
                  <span className={cn('text-[11px] font-semibold leading-tight', done ? 'text-slate-800' : 'text-slate-400')}>
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
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-slate-500"><Users className="size-4" /> Jamaah</dt>
            <dd className="mt-1 font-bold text-slate-900">{result.pax} orang</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-slate-500"><CalendarDays className="size-4" /> Keberangkatan</dt>
            <dd className="mt-1 font-bold text-slate-900">{formatDate(result.departureDate)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-slate-500">Terdaftar</dt>
            <dd className="mt-1 font-bold text-slate-900">{new Date(result.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
          </div>
        </dl>

        {result.totalPriceIdr > 0 && (
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm text-slate-500">Pembayaran</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatRupiah(result.paidIdr)} <span className="text-sm font-medium text-slate-500">dari {formatRupiah(result.totalPriceIdr)}</span>
                </p>
              </div>
              <p className={cn('text-sm font-bold', remaining === 0 ? 'text-emerald-600' : 'text-amber-700')}>
                {remaining === 0 ? 'Lunas' : `Sisa ${formatRupiah(remaining)}`}
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            {result.payments.length > 0 && (
              <ul className="mt-4 divide-y divide-slate-100 text-sm">
                {result.payments.map((p, i) => (
                  <li key={i} className="flex justify-between py-2">
                    <span className="text-slate-600">{formatDate(p.paidOn)}</span>
                    <span className="font-semibold text-slate-900">{p.amount}</span>
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
