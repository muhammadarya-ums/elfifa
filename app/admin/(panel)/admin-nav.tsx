'use client'

import { CalendarDays, ExternalLink, FileText, History, Images, LayoutDashboard, LogOut, Menu, MessageSquareQuote, Package, Settings, UserCog, Users, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logout } from '@/app/actions/admin'
import type { AdminRole } from '@/lib/db/schema'
import { can, ROLE_LABELS, type Permission } from '@/lib/permissions'
import { cn } from '@/lib/utils'

const items: { href: string; label: string; icon: typeof Users; exact?: boolean; perm?: Permission }[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pendaftaran', label: 'Pendaftaran', icon: Users, perm: 'registration.view' },
  { href: '/admin/paket', label: 'Paket Umroh', icon: Package, perm: 'catalog.manage' },
  { href: '/admin/jadwal', label: 'Jadwal Manasik', icon: CalendarDays, perm: 'catalog.manage' },
  { href: '/admin/halaman', label: 'Konten Halaman', icon: FileText, perm: 'content.manage' },
  { href: '/admin/media', label: 'Pustaka Media', icon: Images, perm: 'content.manage' },
  { href: '/admin/konten', label: 'Testimoni & FAQ', icon: MessageSquareQuote, perm: 'content.manage' },
  { href: '/admin/pengaturan', label: 'Pengaturan', icon: Settings, perm: 'settings.manage' },
  { href: '/admin/log', label: 'Log Audit', icon: History, perm: 'audit.view' },
  { href: '/admin/akun', label: 'Akun Saya', icon: UserCog },
]

export default function AdminNav({ adminName, adminEmail, role }: { adminName: string; adminEmail: string; role: AdminRole }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Menu admin">
      {items.filter((i) => !i.perm || can(role, i.perm)).map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              active ? 'bg-[#007a82] text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="size-4.5" />
            {label}
          </Link>
        )
      })}
      <div className="my-3 border-t border-white/10" />
      <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">
        <ExternalLink className="size-4.5" /> Lihat website
      </a>
      <a href="/kbihu" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">
        <ExternalLink className="size-4.5" /> Lihat halaman KBIHU
      </a>
    </nav>
  )

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-semibold text-white">{adminName}</p>
      <p className="truncate text-xs text-slate-400">{adminEmail}</p>
      <span className="mt-2 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">{ROLE_LABELS[role]}</span>
      <form action={logout} className="mt-3">
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
          <LogOut className="size-3.5" /> Keluar
        </button>
      </form>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-slate-900 px-4 lg:hidden">
        <span className="text-sm font-bold text-white">Admin Elfifa</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-lg p-1.5 text-white" aria-label="Menu" aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col bg-slate-900 pt-3 lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-slate-900 lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white p-1">
            <img src="/icon.png" alt="" className="size-full object-contain" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Elfifa</p>
            <p className="text-[11px] text-slate-400">Panel Admin</p>
          </div>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  )
}
