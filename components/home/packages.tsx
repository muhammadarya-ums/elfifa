import { ArrowRight, CalendarDays, Check, Plane } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants, Container, SectionHeading, Stars } from '@/components/site/primitives'
import type { PackageWithSeats } from '@/lib/data'
import { formatDate, formatJuta, splitLines } from '@/lib/format'
import { cn } from '@/lib/utils'

function SeatMeter({ pkg, tone = 'light' }: { pkg: PackageWithSeats; tone?: 'light' | 'dark' }) {
  const pct = Math.min(100, Math.round((pkg.seatsTaken / pkg.quota) * 100))
  const low = pkg.seatsLeft > 0 && pkg.seatsLeft <= Math.max(5, Math.round(pkg.quota * 0.2))
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12.5px]">
        <span className={cn(tone === 'dark' ? 'text-brand-100/70' : 'text-ink-muted')}>Kursi terisi</span>
        <span className={cn('font-semibold', pkg.seatsLeft === 0 ? 'text-rose-500' : low ? (tone === 'dark' ? 'text-gold-300' : 'text-gold-700') : tone === 'dark' ? 'text-white' : 'text-ink')}>
          {pkg.seatsLeft === 0 ? 'Penuh' : `Sisa ${pkg.seatsLeft} dari ${pkg.quota}`}
        </span>
      </div>
      <div className={cn('mt-2 h-1 overflow-hidden rounded-full', tone === 'dark' ? 'bg-white/10' : 'bg-sand-200')}>
        <div className={cn('h-full rounded-full', tone === 'dark' ? 'bg-gold-400' : 'bg-brand-600')} style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
    </div>
  )
}

function Featured({ pkg }: { pkg: PackageWithSeats }) {
  const includes = splitLines(pkg.includes).slice(0, 6)
  const discount = pkg.originalPriceIdr && pkg.originalPriceIdr > pkg.priceIdr ? pkg.originalPriceIdr : null

  return (
    <article className="relative grid overflow-hidden rounded-[2rem] bg-brand-900 text-white lg:grid-cols-[1.5fr_1fr]">
      <svg aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-[420px] text-white/[0.04]" viewBox="0 0 200 200">
        <g fill="none" stroke="currentColor" strokeWidth="0.6">
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x="50" y="50" width="100" height="100" transform={`rotate(${i * 15} 100 100)`} />
          ))}
        </g>
      </svg>
      <div className="relative p-7 sm:p-10 lg:p-12">
        <span className="inline-flex items-center rounded-full border border-gold-300/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">
          Paket unggulan
        </span>
        <h3 className="font-display mt-5 text-3xl leading-tight sm:text-[2.6rem]">{pkg.name}</h3>
        {pkg.description && <p className="mt-4 max-w-xl text-[15px] leading-7 text-brand-100/75">{pkg.description}</p>}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {pkg.hotelMakkah && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-100/60">Makkah · {pkg.hotelMakkahNights} hari</dt>
              <dd className="mt-2 font-semibold">{pkg.hotelMakkah}</dd>
              <dd className="mt-1 flex items-center gap-2 text-[13px] text-brand-100/70">
                <Stars count={pkg.hotelMakkahStars} /> {pkg.hotelMakkahNote}
              </dd>
            </div>
          )}
          {pkg.hotelMadinah && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-100/60">Madinah · {pkg.hotelMadinahNights} hari</dt>
              <dd className="mt-2 font-semibold">{pkg.hotelMadinah}</dd>
              <dd className="mt-1 flex items-center gap-2 text-[13px] text-brand-100/70">
                <Stars count={pkg.hotelMadinahStars} /> {pkg.hotelMadinahNote}
              </dd>
            </div>
          )}
        </dl>

        {includes.length > 0 && (
          <ul className="mt-8 grid gap-x-6 gap-y-2.5 text-[14px] text-brand-100/85 sm:grid-cols-2">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-gold-300" /> {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative flex flex-col justify-between gap-8 border-t border-white/10 bg-brand-950/40 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
        <div className="grid gap-3 text-[14px] text-brand-100/80">
          {pkg.departureDate && (
            <p className="flex items-center gap-2.5"><CalendarDays className="size-4 text-gold-300" /> Berangkat {formatDate(pkg.departureDate)}</p>
          )}
          {pkg.airline && <p className="flex items-center gap-2.5"><Plane className="size-4 text-gold-300" /> {pkg.airline}</p>}
          <p className="flex items-center gap-2.5"><span className="font-display text-gold-300">{pkg.durationDays}</span> hari perjalanan</p>
        </div>
        <div>
          <p className="text-[13px] text-brand-100/60">Harga per jamaah</p>
          {discount && <p className="mt-1 text-[15px] text-brand-100/50 line-through">Rp {formatJuta(discount)} jt</p>}
          <p className="font-display mt-1 text-5xl text-white">
            <span className="mr-1 align-top text-xl text-gold-300">Rp</span>
            {formatJuta(pkg.priceIdr)}
            <span className="ml-1 text-2xl text-brand-100/70">jt</span>
          </p>
          <div className="mt-6">
            <SeatMeter pkg={pkg} tone="dark" />
          </div>
        </div>
        <div className="grid gap-3">
          <a href={`/#daftar`} className={buttonVariants.gold}>Daftar paket ini</a>
          <Link href={`/paket/${pkg.slug}`} className={buttonVariants.ghostLight}>Lihat rincian lengkap</Link>
        </div>
      </div>
    </article>
  )
}

function PackageCard({ pkg }: { pkg: PackageWithSeats }) {
  return (
    <Link
      href={`/paket/${pkg.slug}`}
      className="group flex flex-col rounded-[1.75rem] border border-sand-200 bg-white p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-sand-300 hover:shadow-[0_24px_48px_-32px_rgba(16,40,43,0.45)]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-display text-5xl leading-none text-brand-700">
          {pkg.durationDays}
          <span className="ml-1.5 font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-ink-muted">hari</span>
        </p>
        {pkg.departureDate && (
          <span className="rounded-full bg-sand-100 px-3 py-1 text-[12px] font-semibold text-ink-soft">
            {formatDate(pkg.departureDate, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
      <h3 className="font-display mt-6 text-2xl leading-snug text-ink">{pkg.name}</h3>
      <ul className="mt-4 grid gap-1.5 text-[13.5px] text-ink-soft">
        {pkg.hotelMakkah && (
          <li className="flex items-center gap-2"><span className="w-16 text-ink-muted">Makkah</span> {pkg.hotelMakkah} <Stars count={pkg.hotelMakkahStars} /></li>
        )}
        {pkg.hotelMadinah && (
          <li className="flex items-center gap-2"><span className="w-16 text-ink-muted">Madinah</span> {pkg.hotelMadinah} <Stars count={pkg.hotelMadinahStars} /></li>
        )}
      </ul>
      <div className="mt-auto pt-8">
        <SeatMeter pkg={pkg} />
        <div className="mt-6 flex items-end justify-between border-t border-sand-200 pt-5">
          <p className="text-ink">
            <span className="block text-[12px] text-ink-muted">Per jamaah</span>
            <span className="font-display text-3xl">Rp {formatJuta(pkg.priceIdr)} jt</span>
          </p>
          <span className="flex size-11 items-center justify-center rounded-full border border-sand-300 text-ink transition-colors group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white">
            <ArrowRight className="size-4.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function CustomCard({ waUrl, span, mdFull }: { waUrl: string; span: 1 | 2 | 3; mdFull: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-8 rounded-[1.75rem] bg-sand-100 p-7 ring-1 ring-sand-200 sm:p-9',
        // Selalu menutup baris: lebar = sisa kolom pada baris terakhir
        mdFull ? 'md:col-span-2' : 'md:col-span-1',
        { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3 lg:flex-row lg:items-center' }[span],
      )}
    >
      <div className="max-w-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700">Rombongan & keluarga</p>
        <h3 className="font-display mt-4 text-3xl leading-snug text-ink">Butuh jadwal atau susunan kamar khusus?</h3>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">
          Untuk rombongan majelis taklim, perusahaan, atau keluarga besar, kami bantu susun program yang menyesuaikan waktu dan kebutuhan
          Anda.
        </p>
      </div>
      <a href={waUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants.outline, 'shrink-0 self-start', span === 3 && 'lg:self-center')}>
        Diskusikan via WhatsApp <ArrowRight className="size-4" />
      </a>
    </div>
  )
}

export default function Packages({ packages, waUrl }: { packages: PackageWithSeats[]; waUrl: string }) {
  const [featured, ...others] = packages
  return (
    <section id="paket" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Program umroh"
            title="Pilih waktu terbaik untuk beribadah."
            description="Harga sudah termasuk tiket pesawat pulang-pergi, visa, hotel, makan, transportasi, dan mutawwif. Rincian lengkap tercantum di setiap paket."
          />
          <p className="max-w-xs text-[13px] leading-6 text-ink-muted">
            Harga dan jadwal dapat menyesuaikan regulasi penerbangan serta kurs. Rincian final dikonfirmasi saat pendaftaran.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="mt-14 rounded-[2rem] border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink">Jadwal keberangkatan berikutnya segera dibuka.</p>
            <p className="mt-3 text-ink-soft">Tinggalkan pesan dan kami kabari lebih dulu.</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants.primary, 'mt-8')}>
              Masuk daftar tunggu via WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-14 grid gap-6">
            <Featured pkg={featured} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
              {/* Kartu pelengkap agar grid selalu utuh */}
              <CustomCard waUrl={waUrl} span={(3 - (others.length % 3)) as 1 | 2 | 3} mdFull={others.length % 2 === 0} />
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
