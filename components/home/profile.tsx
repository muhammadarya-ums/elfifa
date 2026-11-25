import { Container, SectionHeading } from '@/components/site/primitives'
import type { SiteSettings } from '@/lib/settings-def'
import VideoPlayer from './video-player'

export default function Profile({ settings }: { settings: SiteSettings }) {
  const stats = [
    settings.brand_years && { value: `${settings.brand_years}+`, label: 'tahun melayani' },
    settings.brand_pilgrims && { value: Number(settings.brand_pilgrims).toLocaleString('id-ID') + '+', label: 'jamaah diberangkatkan' },
    settings.brand_ppiu_license && { value: 'PPIU', label: `izin Kemenag No. ${settings.brand_ppiu_license}` },
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <section id="profil" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="mx-auto w-full max-w-[440px] lg:order-last lg:mx-0 lg:ml-auto">
          <VideoPlayer src="/pemberangkatan-umrah.mp4" poster="/images/video-poster.webp" label="Video dokumentasi pemberangkatan jamaah Elfifa" />
        </div>
        <div>
          <SectionHeading
            eyebrow="Tentang kami"
            title={
              <>
                Lebih dari perjalanan — <em className="text-brand-700">ini tentang kekhusyukan.</em>
              </>
            }
          />
          <div className="mt-6 grid gap-5 text-[15.5px] leading-8 text-ink-soft">
            <p>
              Bagi kami, umroh adalah panggilan ibadah, bukan sekadar perjalanan wisata. Karena itu kami membekali jamaah dengan manasik
              sebelum berangkat, memilih hotel yang dekat dengan masjid, dan mendampingi rombongan bersama mutawwif dari awal hingga
              pulang.
            </p>
            <p>
              Prinsip kami sederhana, dan selalu kami bawa di spanduk rombongan:{' '}
              <span className="font-display italic text-ink">{settings.brand_tagline || 'aman, amanah, alhamdulillah.'}</span>
            </p>
          </div>
          {stats.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-sand-200 pt-8 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-4xl text-brand-700">{s.value}</dd>
                  <dd className="mt-1 text-[13px] leading-5 text-ink-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </section>
  )
}
