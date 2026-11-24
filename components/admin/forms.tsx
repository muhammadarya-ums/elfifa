'use client'

import { Loader2 } from 'lucide-react'
import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import type { ActionResult } from '@/app/actions/admin'
import { cn } from '@/lib/utils'
import { btnPrimary } from './ui'

type FieldErrors = Record<string, string[] | undefined>
const FormContext = createContext<{ errors: FieldErrors; pending: boolean }>({ errors: {}, pending: false })

/** Label + input + pesan error (diambil dari ActionForm terdekat). */
export function FormField({
  label,
  name,
  hint,
  children,
  className,
}: {
  label: string
  name: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  const err = useContext(FormContext).errors[name]
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </label>
      {children}
      {err?.[0] ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{err[0]}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

/**
 * Form dengan server action + pesan sukses/gagal otomatis.
 * Disubmit lewat transition supaya isian TIDAK ter-reset saat validasi gagal.
 */
export function ActionForm({
  action,
  children,
  submitLabel = 'Simpan',
  className,
  resetOnSuccess = false,
  footer,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>
  children: React.ReactNode
  submitLabel?: string
  className?: string
  resetOnSuccess?: boolean
  footer?: React.ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (resetOnSuccess && state?.ok) formRef.current?.reset()
  }, [state, resetOnSuccess])

  return (
    <FormContext.Provider value={{ errors: state?.ok === false ? (state.fieldErrors ?? {}) : {}, pending }}>
      <form
        ref={formRef}
        noValidate
        className={cn('grid gap-4', className)}
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          startTransition(() => formAction(fd))
        }}
      >
        {children}
        {state && (
          <p
            role={state.ok ? 'status' : 'alert'}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              state.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700',
            )}
          >
            {state.message}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </button>
          {footer}
        </div>
      </form>
    </FormContext.Provider>
  )
}

/** Tombol submit untuk <form action={...}> biasa. */
export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={cn(btnPrimary, className)}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

/** Tombol submit yang meminta konfirmasi terlebih dahulu (untuk hapus, dll). */
export function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

/** Select yang langsung submit form saat nilainya berubah. */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />
}
