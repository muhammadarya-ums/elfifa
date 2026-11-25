import { Search } from 'lucide-react'
import Link from 'next/link'
import RegistrationForm from '@/components/registration-form'
import { Container, SectionHeading } from '@/components/site/primitives'
import type { PackageWithSeats } from '@/lib/data'
import { formatDate, formatJuta } from '@/lib/format'
import type { SiteSettings } from '@/lib/settings-def'

export default function Register({ packages, settings }: { packages: PackageWithSeats[]; settings: SiteSettings }) {
  if (packages.length === 0) return null
  return (
    <section id="daftar" className="scroll-mt-20 bg-sand-100 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Pendaftaran online"
            title="Satu langkah kecil menuju Baitullah."
            description="Isi formulir singkat ini. Kode pendaftaran langsung terbit, dan tim kami menghubungi Anda melalui WhatsApp pada jam kerja untuk konfirmasi."
          />
          <dl className="mt-10 grid gap-5 text-[14.5px]">
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-ink-muted">Respons</dt>
              <dd className="text-ink">Melalui WhatsApp, pada jam kerja</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-ink-muted">Pembayaran</dt>
              <dd className="text-ink">Bertahap, hanya ke rekening resmi perusahaan</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-ink-muted">Kantor</dt>
              <dd className="text-ink">{settings.travel_address}</dd>
            </div>
          </dl>
          <Link href="/cek-status" className="mt-10 inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-5 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-brand-600 hover:text-brand-700">
            <Search className="size-4" /> Sudah mendaftar? Cek status
          </Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_32px_64px_-40px_rgba(16,40,43,0.4)] ring-1 ring-sand-200 sm:p-10">
          <RegistrationForm
            variant="umroh"
            packages={packages.map((p) => ({
              slug: p.slug,
              label: `${p.name}${p.departureDate ? ` · ${formatDate(p.departureDate, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''} · Rp ${formatJuta(p.priceIdr)} jt`,
              seatsLeft: p.seatsLeft,
            }))}
          />
        </div>
      </Container>
    </section>
  )
}
