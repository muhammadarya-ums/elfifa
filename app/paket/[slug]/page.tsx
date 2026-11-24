import { CalendarDays, Check, Clock, Gift, Hotel, Plane, Star, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RegistrationForm from '@/components/registration-form'
import SiteShell from '@/components/site-shell'
import { getActivePackages, getPackageBySlug, getSettings } from '@/lib/data'
import { formatDate, formatJuta, formatRupiah, splitLines } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Paket tidak ditemukan | Elfifa' }
  const description = `${pkg.durationDays} hari${pkg.departureDate ? `, berangkat ${formatDate(pkg.departureDate)}` : ''} — mulai ${formatRupiah(pkg.priceIdr)}. ${pkg.description}`.slice(0, 200)
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.description,
    brand: { '@type': 'Brand', name: 'Elfifa Travel Umroh' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: pkg.priceIdr,
      availability: pkg.seatsLeft > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
  }

  return (
    <SiteShell settings={settings} backHref="/#paket" backLabel="Semua paket">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <section className="bg-gradient-to-br from-[#007a82] to-slate-900 px-5 py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f3b35f]">{pkg.tagline || 'Paket Umroh'}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{pkg.name}</h1>
            {pkg.description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200">{pkg.description}</p>}
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Chip icon={<Clock className="size-4" />}>{pkg.durationDays} hari</Chip>
              {pkg.departureDate && <Chip icon={<CalendarDays className="size-4" />}>{formatDate(pkg.departureDate)}</Chip>}
              {pkg.airline && <Chip icon={<Plane className="size-4" />}>{pkg.airline}</Chip>}
              <Chip icon={<Users className="size-4" />}>
                {pkg.seatsLeft > 0 ? `Sisa ${pkg.seatsLeft} dari ${pkg.quota} kursi` : 'Kuota penuh'}
              </Chip>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-300">Harga per orang</p>
            {discount && <p className="mt-1 text-lg text-slate-400 line-through">Rp {formatJuta(discount)} Jt</p>}
            <p className="text-5xl font-extrabold text-[#f3b35f]">
              <span className="align-top text-2xl">Rp</span>
              {formatJuta(pkg.priceIdr)}
              <span className="align-top text-xl"> Jt</span>
            </p>
            <a
              href="#daftar"
              className="mt-6 flex items-center justify-center rounded-xl bg-[#d9923b] py-3.5 font-bold text-white transition hover:bg-[#b57930]"
            >
              Daftar Paket Ini
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {pkg.hotelMakkah && (
            <HotelCard city="Makkah" name={pkg.hotelMakkah} nights={pkg.hotelMakkahNights} stars={pkg.hotelMakkahStars} note={pkg.hotelMakkahNote} />
          )}
          {pkg.hotelMadinah && (
            <HotelCard city="Madinah" name={pkg.hotelMadinah} nights={pkg.hotelMadinahNights} stars={pkg.hotelMadinahStars} note={pkg.hotelMadinahNote} />
          )}
        </div>

        <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2">
          {includes.length > 0 && (
            <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Harga sudah termasuk</h2>
              <ul className="mt-5 grid gap-3">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bonuses.length > 0 && (
            <div className="rounded-3xl bg-[#007a82] p-7 text-white shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#f3b35f]">
                <Gift className="size-5" /> Bonus spesial
              </h2>
              <ul className="mt-5 grid gap-3">
                {bonuses.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#f3b35f]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section id="daftar" className="scroll-mt-20 px-5 pb-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-10">
          <h2 className="text-2xl font-black text-slate-900">Formulir Pendaftaran</h2>
          <p className="mb-8 mt-2 text-sm text-slate-500">Tim kami akan menghubungi Anda via WhatsApp setelah formulir dikirim.</p>
          <RegistrationForm
            variant="umroh"
            defaultPackageSlug={pkg.slug}
            packages={all.map((p) => ({ slug: p.slug, label: `${p.name} — Rp ${formatJuta(p.priceIdr)} Jt`, seatsLeft: p.seatsLeft }))}
          />
        </div>
      </section>
    </SiteShell>
  )
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold backdrop-blur">
      {icon}
      {children}
    </span>
  )
}

function HotelCard({ city, name, nights, stars, note }: { city: string; name: string; nights: number; stars: number; note: string }) {
  return (
    <div className="flex gap-5 rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#007a82]/10 text-[#007a82]">
        <Hotel className="size-6" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#d9923b]">
          {city} · {nights} hari
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{name}</h3>
        {note && <p className="mt-1 text-sm text-slate-500">{note}</p>}
        <div className="mt-2 flex text-[#d9923b]">
          {Array.from({ length: stars }, (_, i) => (
            <Star key={i} className="size-4 fill-current" />
          ))}
        </div>
      </div>
    </div>
  )
}
