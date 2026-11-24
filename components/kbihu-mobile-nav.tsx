'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type NavItem = { label: string; href: string }

export default function KbihuMobileNav({ items, ctaHref }: { items: NavItem[]; ctaHref: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-[#007a82] transition-colors hover:bg-[#eff7f5] lg:hidden"
        aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
        aria-expanded={open}
        aria-controls="kbihu-mobile-menu"
      >
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>

      {open && (
        <div
          id="kbihu-mobile-menu"
          className="absolute inset-x-0 top-full border-b border-[#dfeae7] bg-white px-5 pb-5 pt-2 shadow-[0_18px_40px_rgba(23,59,61,0.08)] lg:hidden"
        >
          <nav aria-label="Navigasi mobile">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-[#eef4f2] py-3.5 text-[15px] font-medium text-[#315c5d] last:border-0"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-center rounded-full bg-[#007a82] py-3 text-[14px] font-bold text-white"
          >
            Konsultasi via WhatsApp
          </a>
        </div>
      )}
    </>
  )
}
