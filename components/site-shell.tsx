import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/social-icons'
import { waLink } from '@/lib/format'
import type { SiteSettings } from '@/lib/settings-def'

/** Kerangka sederhana untuk halaman publik sekunder (detail paket, cek status). */
export default function SiteShell({
  settings,
  children,
  backHref = '/',
  backLabel = 'Beranda',
}: {
  settings: SiteSettings
  children: React.ReactNode
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Elfifa, beranda">
            <img src="/logo-sm.png" alt="Elfifa Travel Umroh" width={333} height={160} className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={backHref}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:inline-flex"
            >
              <ArrowLeft className="size-4" /> {backLabel}
            </Link>
            <a
              href={waLink(settings.travel_whatsapp, "Assalamu'alaikum Elfifa, saya ingin bertanya.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white"
            >
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs text-slate-500">
        <p>
          {settings.travel_address} · {settings.travel_phone} · {settings.travel_email}
        </p>
        <p className="mt-2">© {new Date().getFullYear()} Elfifa Travel Umroh &amp; KBIHU</p>
      </footer>
    </div>
  )
}
