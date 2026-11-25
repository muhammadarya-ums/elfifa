import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10', className)}>{children}</div>
}

/** Label kecil di atas judul section. */
export function Eyebrow({ children, className, tone = 'gold' }: { children: React.ReactNode; className?: string; tone?: 'gold' | 'light' }) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em]',
        tone === 'gold' ? 'text-gold-700' : 'text-gold-300',
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center [&>p:first-child]:justify-center', 'max-w-2xl', className)}>
      {eyebrow && <Eyebrow tone={tone === 'dark' ? 'gold' : 'light'}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          'font-display mt-4 text-[2.15rem] leading-[1.1] sm:text-5xl',
          tone === 'dark' ? 'text-ink' : 'text-white',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-5 text-[15.5px] leading-7 sm:text-base', tone === 'dark' ? 'text-ink-soft' : 'text-brand-100/80')}>
          {description}
        </p>
      )}
    </div>
  )
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] focus-visible:outline-offset-4'

export const buttonVariants = {
  primary: `${buttonBase} bg-brand-700 px-6 py-3.5 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_10px_24px_-12px_rgba(0,98,106,0.7)] hover:bg-brand-800`,
  gold: `${buttonBase} bg-gold-500 px-6 py-3.5 text-ink shadow-[0_10px_24px_-12px_rgba(185,117,42,0.8)] hover:bg-gold-400`,
  outline: `${buttonBase} border border-ink/15 bg-white/60 px-6 py-3.5 text-ink backdrop-blur hover:border-ink/30 hover:bg-white`,
  ghostLight: `${buttonBase} border border-white/25 px-6 py-3.5 text-white hover:bg-white/10`,
  link: 'inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-brand-700 underline-offset-4 hover:underline',
}

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
  external,
}: {
  href: string
  variant?: keyof typeof buttonVariants
  className?: string
  children: React.ReactNode
  external?: boolean
}) {
  const cls = cn(buttonVariants[variant], className)
  if (external || href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}

/** Bintang hotel sederhana & dapat diakses. */
export function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5 text-gold-500', className)} role="img" aria-label={`Hotel bintang ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-3.5 fill-current" aria-hidden="true">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  )
}
