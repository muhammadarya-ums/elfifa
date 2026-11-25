'use client'

import { Check, Copy, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { startTransition, useActionState, useState } from 'react'
import { disableTotp, totpSetup, type TotpSetupState } from '@/app/actions/two-factor'
import { btnDanger, btnPrimary, inputCls } from '@/components/admin/ui'

function submitWith(action: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => action(fd))
  }
}

export default function TwoFactorCard({ enabled, recoveryLeft }: { enabled: boolean; recoveryLeft: number }) {
  const [setup, setupAction, setupPending] = useActionState<TotpSetupState, FormData>(totpSetup, { step: 'idle' })
  const [dis, disAction, disPending] = useActionState(disableTotp, null)
  const [copied, setCopied] = useState(false)

  if (setup.step === 'done') {
    const text = setup.recoveryCodes.join('\n')
    return (
      <div className="grid gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ShieldCheck className="size-5" /> 2FA aktif. Sesi di perangkat lain sudah dikeluarkan.
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Simpan kode cadangan ini sekarang — tidak akan ditampilkan lagi.</p>
          <p className="mt-1 text-xs text-amber-800">Setiap kode hanya bisa dipakai sekali, untuk login bila HP hilang.</p>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-sm text-slate-900">
            {setup.recoveryCodes.map((c) => (
              <li key={c} className="rounded bg-white px-2 py-1 text-center">{c}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? 'Tersalin' : 'Salin semua'}
          </button>
        </div>
      </div>
    )
  }

  if (enabled && !dis?.ok) {
    return (
      <div className="grid gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ShieldCheck className="size-5" /> Aktif — login memerlukan kode dari aplikasi authenticator.
        </p>
        <p className="text-xs text-slate-500">Sisa kode cadangan: {recoveryLeft} dari 10.</p>
        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">Nonaktifkan 2FA</summary>
          <form onSubmit={submitWith(disAction)} className="mt-4 grid gap-3">
            <input name="password" type="password" required placeholder="Password Anda" autoComplete="current-password" className={inputCls} />
            <input name="code" required inputMode="numeric" placeholder="Kode 6 digit saat ini" autoComplete="one-time-code" className={inputCls} />
            {dis?.error && <p className="text-xs font-medium text-rose-600">{dis.error}</p>}
            <button type="submit" disabled={disPending} className={btnDanger}>
              {disPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldOff className="size-4" />} Nonaktifkan
            </button>
          </form>
        </details>
      </div>
    )
  }

  return (
    <form onSubmit={submitWith(setupAction)} className="grid max-w-2xl gap-4">
      {dis?.ok && <p className="text-sm font-semibold text-slate-600">2FA telah dinonaktifkan.</p>}
      {setup.step === 'idle' ? (
        <p className="text-sm text-slate-600">
          Lindungi akun dengan kode dari aplikasi seperti Google Authenticator, Microsoft Authenticator, atau Authy. Walau password bocor,
          akun tetap aman.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          <img src={setup.qr} alt="QR code aktivasi 2FA" width={180} height={180} className="rounded-lg border border-slate-200" />
          <div className="text-sm text-slate-600">
            <p>1. Pindai QR ini dengan aplikasi authenticator.</p>
            <p className="mt-1">2. Masukkan 6 digit kode yang muncul.</p>
            <p className="mt-3 text-xs text-slate-500">Tidak bisa memindai? Masukkan kunci ini secara manual:</p>
            <code className="mt-1 block break-all rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-800">{setup.secret.match(/.{1,4}/g)?.join(' ')}</code>
            <input type="hidden" name="secret" value={setup.secret} />
          </div>
        </div>
      )}
      <input name="password" type="password" required placeholder="Konfirmasi password Anda" autoComplete="current-password" className={inputCls} />
      {setup.step === 'scan' && (
        <input name="code" required inputMode="numeric" autoComplete="one-time-code" placeholder="Kode 6 digit dari aplikasi" className={`${inputCls} font-mono tracking-widest`} />
      )}
      {setup.error && <p role="alert" className="text-xs font-medium text-rose-600">{setup.error}</p>}
      <button type="submit" disabled={setupPending} className={btnPrimary}>
        {setupPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {setup.step === 'idle' ? 'Mulai aktivasi 2FA' : 'Konfirmasi & aktifkan'}
      </button>
    </form>
  )
}
