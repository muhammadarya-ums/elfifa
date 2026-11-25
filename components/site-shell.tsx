import SiteFooter from '@/components/site/site-footer'
import SiteHeader from '@/components/site/site-header'
import type { SiteSettings } from '@/lib/settings-def'

/** Kerangka halaman publik sekunder (detail paket, cek status, halaman legal). */
export default function SiteShell({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-sand-50 text-ink">
      <SiteHeader />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  )
}
