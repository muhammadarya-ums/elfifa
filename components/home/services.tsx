import { Check } from 'lucide-react'
import { Container, SectionHeading } from '@/components/site/primitives'
import { splitLines } from '@/lib/format'

const PILLARS = [
  {
    title: 'Ibadah sesuai tuntunan',
    body: 'Mutawwif yang berilmu mendampingi setiap rukun dan wajib umroh, dibekali manasik sebelum berangkat agar ibadah Anda sah dan tenang.',
  },
  {
    title: 'Dekat dengan masjid',
    body: 'Hotel dipilih berdasarkan jarak berjalan kaki ke Masjidil Haram dan Masjid Nabawi — supaya jamaah lansia pun tetap bisa salat berjamaah.',
  },
  {
    title: 'Transparan & tercatat',
    body: 'Setiap pendaftar mendapat kode unik. Status dokumen dan riwayat pembayaran bisa dicek kapan saja, dan transfer hanya ke rekening resmi perusahaan.',
  },
]

const DEFAULT_INCLUDES = [
  'Tiket pesawat pulang-pergi',
  'Visa umroh',
  'Hotel Makkah & Madinah',
  'Makan 3x sehari',
  'Bus AC selama di Saudi',
  'Mutawwif & tour leader',
  'Perlengkapan umroh',
  'Manasik sebelum berangkat',
]

export default function Services({ includes }: { includes?: string }) {
  const items = includes ? splitLines(includes) : DEFAULT_INCLUDES
  return (
    <section id="layanan" className="scroll-mt-20 bg-sand-50 py-20 sm:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Mengapa Elfifa"
              title={
                <>
                  Diurus dengan amanah, <em className="text-brand-700">dari awal hingga pulang.</em>
                </>
              }
              description="Kami percaya perjalanan ibadah tidak boleh dibebani urusan teknis. Tugas kami memastikan setiap detail beres, supaya Anda cukup fokus beribadah."
            />
            <figure className="mt-10 hidden lg:block">
              <div className="arch-sm aspect-[4/3] overflow-hidden">
                <img src="/galeri/jamaah2.webp" alt="Rombongan jamaah Elfifa berpakaian ihram di Pusat Layanan Haji dan Umrah Terpadu" loading="lazy" className="size-full object-cover" />
              </div>
              <figcaption className="mt-3 text-[12.5px] text-ink-muted">Rombongan jamaah Elfifa di Pusat Layanan Haji dan Umrah Terpadu.</figcaption>
            </figure>
          </div>

          <div>
            <ol className="divide-y divide-sand-200 border-y border-sand-200">
              {PILLARS.map((p, i) => (
                <li key={p.title} className="grid gap-4 py-9 sm:grid-cols-[72px_1fr]">
                  <span className="font-display text-4xl leading-none text-gold-500">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-[1.65rem] leading-snug text-ink">{p.title}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-ink-soft">{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-[1.75rem] bg-white p-7 ring-1 ring-sand-200 sm:p-9">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold-700">Sudah termasuk dalam paket</h3>
              <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px] text-ink">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
