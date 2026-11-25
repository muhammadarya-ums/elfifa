import { ArrowRight, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { ButtonLink, Container, Eyebrow } from '@/components/site/primitives'
import { WhatsAppIcon } from '@/components/social-icons'
import type { PackageWithSeats } from '@/lib/data'
import { formatDate, formatJuta } from '@/lib/format'
import type { SiteSettings } from '@/lib/settings-def'

export default function Hero({ settings, featured, waUrl }: { settings: SiteSettings; featured?: PackageWithSeats; waUrl: string }) {
  const proofs = [
    settings.brand_years && `${settings.brand_years}+ tahun melayani jamaah`,
    settings.brand_ppiu_license && `Izin PPIU Kemenag No. ${settings.brand_ppiu_license}`,
    'Pendaftaran & pembayaran dapat dipantau online',
  ].filter(Boolean) as string[]

  return (
    <section className="relative overflow-hidden bg-sand-50">
      {/* Ornamen geometri halus */}
      <svg aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] text-sand-200/70" viewBox="0 0 200 200">
        <g fill="none" stroke="currentColor" strokeWidth="0.4">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="50" y="50" width="100" height="100" transform={`rotate(${i * 11.25} 100 100)`} />
          ))}
        </g>
      </svg>

      <Container className="relative grid gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-16">
        <div className="motion-safe:animate-rise">
          <Eyebrow>Elfifa Travel Umroh</Eyebrow>
          <h1 className="font-display mt-6 text-[2.75rem] leading-[1.03] text-ink sm:text-6xl lg:text-[4.6rem] xl:text-[5.1rem]">
            Berangkat dengan tenang, <em className="font-normal text-brand-700">pulang membawa mabrur.</em>
          </h1>
          <p className="mt-7 max-w-xl text-[16.5px] leading-8 text-ink-soft">
            Umroh full service yang diurus dengan amanah — dokumen, manasik, akomodasi dekat masjid, hingga Anda kembali ke tanah air.
            Setiap pendaftaran dan pembayaran tercatat, dan dapat Anda pantau sendiri secara online.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#paket">
              Lihat paket umroh <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href={waUrl} variant="outline" external>
              <WhatsAppIcon className="size-4 text-[#1fa855]" /> Konsultasi gratis
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-2.5 text-[13.5px] text-ink-soft sm:flex sm:flex-wrap sm:gap-x-6">
            {proofs.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
          <div className="arch relative aspect-[4/5] overflow-hidden bg-brand-900 shadow-[0_40px_80px_-40px_rgba(6,42,47,0.6)]">
            <img
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1100&q=75"
              alt="Kubah hijau Masjid Nabawi, Madinah"
              fetchPriority="high"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-transparent" />
          </div>
          <div className="arch-sm absolute -bottom-8 -left-6 hidden aspect-[3/4] w-40 overflow-hidden border-[6px] border-sand-50 shadow-xl sm:block lg:-left-14 lg:w-44">
            <img src="/galeri/jamaah1.webp" alt="Rombongan jamaah Elfifa di Tanah Suci" loading="lazy" className="size-full object-cover" />
          </div>

          {featured && (
            <Link
              href={`/paket/${featured.slug}`}
              className="group absolute -bottom-10 right-3 w-[min(300px,85%)] rounded-2xl border border-sand-200 bg-white/95 p-5 shadow-[0_24px_48px_-24px_rgba(16,40,43,0.45)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 sm:right-0 lg:-right-6"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">Keberangkatan terdekat</p>
              <p className="font-display mt-2 text-xl leading-snug text-ink">{featured.name}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-[13px] text-ink-soft">
                {featured.departureDate && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {formatDate(featured.departureDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                <span className="font-semibold text-ink">Rp {formatJuta(featured.priceIdr)} jt</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3 text-[12.5px]">
                <span className={featured.seatsLeft <= 10 ? 'font-semibold text-gold-700' : 'text-ink-muted'}>
                  {featured.seatsLeft > 0 ? `Sisa ${featured.seatsLeft} kursi` : 'Kuota penuh'}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
                  Detail <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </Container>
    </section>
  )
}
