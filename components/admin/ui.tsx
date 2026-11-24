import Link from 'next/link'
import type { RegistrationStatus } from '@/lib/db/schema'
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#007a82] focus:ring-3 focus:ring-[#007a82]/15 disabled:bg-slate-50'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#007a82] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00656c] disabled:opacity-60'
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60'
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50'

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  back?: { href: string; label: string }
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm font-medium text-slate-500 hover:text-[#007a82]">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={cn('inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function Notice({ tone = 'success', children }: { tone?: 'success' | 'info' | 'warning'; children: React.ReactNode }) {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  }[tone]
  return <div className={cn('mb-5 rounded-lg border px-4 py-3 text-sm', styles)}>{children}</div>
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-12 text-center text-sm text-slate-500">{children}</div>
}
