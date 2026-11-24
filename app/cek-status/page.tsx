import type { Metadata } from 'next'
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
      <section className="px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">Portal Jamaah</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Cek Status Pendaftaran</h1>
          <p className="mb-8 mt-3 text-slate-600">
            Masukkan kode pendaftaran yang Anda terima setelah mendaftar (berawalan <strong>ELF-</strong> untuk Umroh atau{' '}
            <strong>KBH-</strong> untuk bimbingan KBIHU) beserta nomor WhatsApp yang didaftarkan.
          </p>
          <StatusChecker defaultCode={kode?.slice(0, 12)} bankInfo={settings.travel_bank} />
        </div>
      </section>
    </SiteShell>
  )
}
