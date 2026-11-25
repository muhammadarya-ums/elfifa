import { Check } from 'lucide-react'
import { Container, SectionHeading } from '@/components/site/primitives'
import type { Content } from '@/lib/content'
import { splitLines } from '@/lib/format'

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

export default function Services({ c, includes }: { c: Content; includes?: string }) {
  const items = includes ? splitLines(includes) : DEFAULT_INCLUDES
  return (
    <section id="layanan" className="scroll-mt-20 bg-sand-50 py-20 sm:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow={c.s('eyebrow')}
              title={
                <>
                  {c.s('titleLead')} <em className="text-brand-700">{c.s('titleAccent')}</em>
                </>
              }
              description={c.s('description')}
            />
            <figure className="mt-10 hidden lg:block">
              <div className="arch-sm aspect-[4/3] overflow-hidden">
                <img src={c.s('image')} alt={c.s('imageAlt')} loading="lazy" className="size-full object-cover" />
              </div>
              {c.s('caption') && <figcaption className="mt-3 text-[12.5px] text-ink-muted">{c.s('caption')}</figcaption>}
            </figure>
          </div>

          <div>
            <ol className="divide-y divide-sand-200 border-y border-sand-200">
              {c.list('pillars').map((p, i) => (
                <li key={i} className="grid gap-4 py-9 sm:grid-cols-[72px_1fr]">
                  <span className="font-display text-4xl leading-none text-gold-500">{String(i + 1).padStart(2, '0')}</span>
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
