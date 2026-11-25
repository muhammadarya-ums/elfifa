import type { Metadata } from 'next'
import { Container, Eyebrow } from '@/components/site/primitives'
import SiteShell from '@/components/site-shell'
import StatusChecker from '@/components/status-checker'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cek Status Pendaftaran | Elfifa',
  description: 'Cek status pendaftaran dan pembayaran umroh atau bimbingan manasik Anda di Elfifa.',
  robots: { index: false },
}

export default async function CekStatusPage({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const [{ kode }, settings] = await Promise.all([searchParams, getSettings()])

  return (
    <SiteShell settings={settings}>
      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <Eyebrow>Portal jamaah</Eyebrow>
          <h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] text-ink sm:text-5xl">Cek status pendaftaran</h1>
          <p className="mb-10 mt-5 text-[15.5px] leading-7 text-ink-soft">
            Masukkan kode pendaftaran (berawalan <strong className="font-semibold text-ink">ELF-</strong> untuk umroh atau{' '}
            <strong className="font-semibold text-ink">KBH-</strong> untuk bimbingan KBIHU) beserta nomor WhatsApp yang Anda daftarkan.
          </p>
          <StatusChecker defaultCode={kode?.slice(0, 12)} bankInfo={settings.travel_bank} />
        </Container>
      </section>
    </SiteShell>
  )
}
