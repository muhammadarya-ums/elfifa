'use client'

import { Loader2, ShieldCheck } from 'lucide-react'
import { startTransition, useActionState, useState } from 'react'
import { verifyTwoFactor } from '@/app/actions/two-factor'
import { btnPrimary, inputCls } from '@/components/admin/ui'

export default function VerifyForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(verifyTwoFactor, null)
  const [recovery, setRecovery] = useState(false)
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input type="hidden" name="next" value={next ?? ''} />
      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-semibold text-slate-700">
          {recovery ? 'Kode cadangan' : 'Kode 6 digit'}
        </label>
        <input
          key={String(recovery)}
          id="code"
          name="code"
          required
          autoFocus
          autoComplete="one-time-code"
          inputMode={recovery ? 'text' : 'numeric'}
          placeholder={recovery ? 'XXXX-XXXX' : '123456'}
          maxLength={recovery ? 9 : 7}
          className={`${inputCls} text-center font-mono text-lg tracking-[0.3em]`}
        />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full py-2.5`}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Verifikasi
      </button>
      <button type="button" onClick={() => setRecovery((v) => !v)} className="text-xs font-semibold text-[#007a82] hover:underline">
        {recovery ? 'Pakai kode dari aplikasi' : 'Pakai kode cadangan'}
      </button>
    </form>
  )
}
