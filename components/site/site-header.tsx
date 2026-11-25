'use client'

import { ArrowUpRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from './primitives'
import { useKbihuUrl } from './use-kbihu-url'

const NAV = [
  { label: 'Paket', href: '/#paket' },
  { label: 'Layanan', href: '/#layanan' },
  { label: 'Alur Perjalanan', href: '/#alur' },
  { label: 'Galeri', href: '/#galeri' },
  { label: 'Tanya Jawab', href: '/#faq' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const kbihuUrl = useKbihuUrl()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled || open ? 'border-b border-sand-200 bg-sand-50/90 backdrop-blur-xl' : 'border-b border-transparent bg-sand-50',
      )}
    >
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white">
        Langsung ke konten
      </a>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="Elfifa Travel Umroh — beranda">
          <img src="/logo-sm.png" alt="Elfifa" width={333} height={160} className="h-10 w-auto sm:h-11" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-3.5 py-2 text-[14px] font-medium text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink">
              {item.label}
            </a>
          ))}
          <a href={kbihuUrl} className="ml-1 inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink">
            KBIHU <ArrowUpRight className="size-3.5 opacity-60" />
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/cek-status" className="rounded-full px-4 py-2 text-[14px] font-semibold text-brand-700 hover:bg-brand-50">
            Cek Status
          </Link>
          <a href="/#daftar" className={cn(buttonVariants.primary, 'px-5 py-2.5')}>
            Daftar Umroh
          </a>
        </div>

        <button
          type="button"
          className="-mr-2 rounded-full p-2.5 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          aria-controls="menu-mobile"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-sand-50 px-5 pb-10 pt-4 lg:hidden">
          <nav aria-label="Navigasi mobile" className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display border-b border-sand-200 py-4 text-2xl text-ink"
              >
                {item.label}
              </a>
            ))}
            <a href={kbihuUrl} className="font-display flex items-center justify-between border-b border-sand-200 py-4 text-2xl text-ink">
              Bimbingan KBIHU <ArrowUpRight className="size-5 text-ink-muted" />
            </a>
          </nav>
          <div className="mt-8 grid gap-3">
            <a href="/#daftar" onClick={() => setOpen(false)} className={buttonVariants.primary}>
              Daftar Umroh
            </a>
            <Link href="/cek-status" onClick={() => setOpen(false)} className={buttonVariants.outline}>
              Cek Status Pendaftaran
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
