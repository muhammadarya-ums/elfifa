import { ArrowLeft, CalendarDays, Check, Clock, Gift, Plane, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RegistrationForm from '@/components/registration-form'
import { Container, Eyebrow, Stars } from '@/components/site/primitives'
import SiteShell from '@/components/site-shell'
import { getActivePackages, getPackageBySlug, getSettings } from '@/lib/data'
import { formatDate, formatJuta, formatRupiah, splitLines } from '@/lib/format'
import { MAIN_URL } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Paket tidak ditemukan | Elfifa' }
  const description = `${pkg.durationDays} hari${pkg.departureDate ? `, berangkat ${formatDate(pkg.departureDate)}` : ''} — ${formatRupiah(pkg.priceIdr)} per jamaah. ${pkg.description}`.slice(0, 200)
  return {
    title: `${pkg.name} | Elfifa Travel Umroh`,
    description,
    alternates: { canonical: `/paket/${pkg.slug}` },
    openGraph: { title: pkg.name, description, images: ['/og-image.jpg'] },
  }
}

export default async function PackagePage({ params }: Params) {
  const { slug } = await params
  const [pkg, settings, all] = await Promise.all([getPackageBySlug(slug), getSettings(), getActivePackages()])
  if (!pkg) notFound()

  const includes = splitLines(pkg.includes)
  const bonuses = splitLines(pkg.bonuses)
  const discount = pkg.originalPriceIdr && pkg.originalPriceIdr > pkg.priceIdr ? pkg.originalPriceIdr : null
  const pct = Math.min(100, Math.round((pkg.seatsTaken / pkg.quota) * 100))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.description,
    url: `${MAIN_URL}/paket/${pkg.slug}`,
    brand: { '@type': 'Brand', name: 'Elfifa Travel Umroh' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: pkg.priceIdr,
      availability: pkg.seatsLeft > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
  }

  return (
    <SiteShell settings={settings}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <section className="border-b border-sand-200 bg-sand-50">
        <Container className="pb-14 pt-8 sm:pb-20">
          <Link href="/#paket" className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Semua paket
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <Eyebrow>{pkg.tagline || 'Paket umroh'}</Eyebrow>
              <h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] text-ink sm:text-6xl">{pkg.name}</h1>
              {pkg.description && <p className="mt-6 max-w-2xl text-[16px] leading-8 text-ink-soft">{pkg.description}</p>}
              <ul className="mt-8 flex flex-wrap gap-2.5 text-[13.5px] text-ink">
                <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-sand-200"><Clock className="size-4 text-brand-700" /> {pkg.durationDays} hari</li>
                {pkg.departureDate && (
                  <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-sand-200"><CalendarDays className="size-4 text-brand-700" /> {formatDate(pkg.departureDate)}</li>
                )}
                {pkg.airline && (
                  <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-sand-200"><Plane className="size-4 text-brand-700" /> {pkg.airline}</li>
                )}
              </ul>
            </div>

            <aside className="rounded-[1.75rem] bg-white p-7 shadow-[0_32px_64px_-40px_rgba(16,40,43,0.45)] ring-1 ring-sand-200">
              <p className="text-[13px] text-ink-muted">Harga per jamaah</p>
              {discount && <p className="mt-1 text-ink-muted line-through">Rp {formatJuta(discount)} jt</p>}
              <p className="font-display text-5xl text-ink">
                <span className="mr-1 align-top text-xl text-gold-600">Rp</span>
                {formatJuta(pkg.priceIdr)}
                <span className="ml-1 text-2xl text-ink-muted">jt</span>
              </p>
              <div className="mt-6">
                <div className="flex justify-between text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-ink-muted"><Users className="size-3.5" /> Kursi terisi</span>
                  <span className="font-semibold text-ink">{pkg.seatsLeft > 0 ? `Sisa ${pkg.seatsLeft} dari ${pkg.quota}` : 'Penuh'}</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.max(pct, 3)}%` }} />
                </div>
              </div>
              <a href="#daftar" className="mt-7 flex items-center justify-center rounded-full bg-brand-700 px-6 py-3.5 text-[14.5px] font-semibold text-white hover:bg-brand-800">
                {pkg.seatsLeft > 0 ? 'Daftar paket ini' : 'Masuk daftar tunggu'}
              </a>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="grid gap-6 lg:grid-cols-2">
          {[
            { city: 'Makkah', name: pkg.hotelMakkah, nights: pkg.hotelMakkahNights, stars: pkg.hotelMakkahStars, note: pkg.hotelMakkahNote },
            { city: 'Madinah', name: pkg.hotelMadinah, nights: pkg.hotelMadinahNights, stars: pkg.hotelMadinahStars, note: pkg.hotelMadinahNote },
          ]
            .filter((h) => h.name)
            .map((h) => (
              <div key={h.city} className="rounded-[1.75rem] bg-sand-50 p-7 ring-1 ring-sand-200 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700">Hotel {h.city} · {h.nights} hari</p>
                <h2 className="font-display mt-3 text-3xl text-ink">{h.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-ink-soft">
                  <Stars count={h.stars} /> {h.note}
                </div>
              </div>
            ))}

          {includes.length > 0 && (
            <div className="rounded-[1.75rem] p-7 ring-1 ring-sand-200 sm:p-8">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold-700">Sudah termasuk</h2>
              <ul className="mt-6 grid gap-3.5">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-600" strokeWidth={2.5} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bonuses.length > 0 && (
            <div className="rounded-[1.75rem] bg-brand-900 p-7 text-white sm:p-8">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-gold-300">
                <Gift className="size-4" /> Bonus program
              </h2>
              <ul className="mt-6 grid gap-3.5">
                {bonuses.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-50">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-300" strokeWidth={2.5} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      <section id="daftar" className="scroll-mt-24 bg-sand-100 py-16 sm:py-24">
        <Container className="max-w-3xl">
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_32px_64px_-40px_rgba(16,40,43,0.4)] ring-1 ring-sand-200 sm:p-10">
            <h2 className="font-display text-3xl text-ink">Formulir pendaftaran</h2>
            <p className="mb-8 mt-2 text-[14.5px] text-ink-soft">Kode pendaftaran langsung terbit. Tim kami menghubungi Anda via WhatsApp untuk konfirmasi.</p>
            <RegistrationForm
              variant="umroh"
              defaultPackageSlug={pkg.slug}
              packages={all.map((p) => ({ slug: p.slug, label: `${p.name} · Rp ${formatJuta(p.priceIdr)} jt`, seatsLeft: p.seatsLeft }))}
            />
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
