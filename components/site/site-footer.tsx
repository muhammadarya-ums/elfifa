import Link from 'next/link'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YoutubeIcon } from '@/components/social-icons'
import type { PackageWithSeats } from '@/lib/data'
import { waLink } from '@/lib/format'
import type { SiteSettings } from '@/lib/settings-def'
import KbihuLink from './kbihu-link'

export default function SiteFooter({ settings, packages = [] }: { settings: SiteSettings; packages?: PackageWithSeats[] }) {
  const year = new Date().getFullYear()
  const linkCls = 'text-[14px] text-brand-100/70 transition-colors hover:text-white'

  return (
    <footer className="bg-brand-950 text-brand-100/80">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="inline-flex rounded-2xl bg-sand-50 px-3 py-2">
              <img src="/logo-sm.png" alt="Elfifa Travel Umroh" width={333} height={160} loading="lazy" className="h-10 w-auto" />
            </div>
            {settings.brand_tagline && <p className="font-display mt-6 text-2xl italic text-white">{settings.brand_tagline}</p>}
            <p className="mt-3 max-w-xs text-[14px] leading-6 text-brand-100/60">
              Penyelenggara perjalanan umroh full service dan bimbingan ibadah haji &amp; umrah.
            </p>
            {(settings.brand_legal_name || settings.brand_ppiu_license) && (
              <p className="mt-5 text-[12.5px] leading-5 text-brand-100/50">
                {settings.brand_legal_name}
                {settings.brand_legal_name && settings.brand_ppiu_license && <br />}
                {settings.brand_ppiu_license && <>Izin PPIU Kemenag RI No. {settings.brand_ppiu_license}</>}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold-300">Program</h3>
            <ul className="mt-5 grid gap-3">
              {packages.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link href={`/paket/${p.slug}`} className={linkCls}>{p.name}</Link>
                </li>
              ))}
              <li>
                <KbihuLink className={linkCls}>Bimbingan manasik (KBIHU)</KbihuLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold-300">Layanan jamaah</h3>
            <ul className="mt-5 grid gap-3">
              <li><a href="/#daftar" className={linkCls}>Pendaftaran online</a></li>
              <li><Link href="/cek-status" className={linkCls}>Cek status &amp; pembayaran</Link></li>
              <li><a href="/#faq" className={linkCls}>Tanya jawab</a></li>
              <li><Link href="/kebijakan-privasi" className={linkCls}>Kebijakan privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className={linkCls}>Syarat &amp; ketentuan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold-300">Kantor</h3>
            <address className="mt-5 grid gap-3 text-[14px] not-italic leading-6">
              <span className="text-brand-100/70">{settings.travel_address}</span>
              <a href={waLink(settings.travel_whatsapp)} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-2`}>
                <WhatsAppIcon className="size-4" /> {settings.travel_phone}
              </a>
              <a href={`mailto:${settings.travel_email}`} className={linkCls}>{settings.travel_email}</a>
            </address>
            <div className="mt-6 flex gap-2">
              {[
                { href: settings.travel_instagram, label: 'Instagram', Icon: InstagramIcon },
                { href: settings.travel_facebook, label: 'Facebook', Icon: FacebookIcon },
                { href: settings.travel_youtube, label: 'YouTube', Icon: YoutubeIcon },
              ]
                .filter((s) => s.href)
                .map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} Elfifa`}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 text-brand-100/70 transition-colors hover:border-white/30 hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12.5px] text-brand-100/45 sm:flex-row sm:justify-between">
          <p>© {year} Elfifa Travel Umroh &amp; KBIHU Elfifa. Hak cipta dilindungi.</p>
          <p>Transfer hanya ke rekening resmi atas nama perusahaan.</p>
        </div>
      </div>
    </footer>
  )
}
