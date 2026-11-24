'use client'

import { Loader2, LogIn } from 'lucide-react'
import { startTransition, useActionState } from 'react'
import { login } from '@/app/actions/admin'
import { btnPrimary, inputCls } from '@/components/admin/ui'

export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null)
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
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className={inputCls} autoFocus />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      {state && !state.ok && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full py-2.5`}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Masuk
      </button>
    </form>
  )
}
