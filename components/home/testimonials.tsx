import { Container, SectionHeading } from '@/components/site/primitives'
import type { Testimonial } from '@/lib/db/schema'

/** Hanya tampil bila admin sudah menerbitkan testimoni asli dari jamaah. */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null
  return (
    <section className="bg-sand-50 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Kata jamaah" title="Cerita dari mereka yang telah berangkat." align="center" />
        <div className="mt-14 columns-1 gap-6 md:columns-2 lg:columns-3">
          {items.map((t) => (
            <figure key={t.id} className="mb-6 break-inside-avoid rounded-[1.75rem] bg-white p-8 ring-1 ring-sand-200">
              <svg aria-hidden="true" viewBox="0 0 32 24" className="h-6 w-8 text-gold-400">
                <path fill="currentColor" d="M0 24V14C0 6.3 4.3 1.6 12 0l1.5 3.2C9.2 4.6 7 7.3 6.8 11H12v13H0zm19 0V14c0-7.7 4.3-12.4 12-14l1 3.2c-4.3 1.4-6.5 4.1-6.7 7.8H31v13H19z" />
              </svg>
              <blockquote className="font-display mt-5 text-[1.2rem] leading-8 text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-6 border-t border-sand-200 pt-4 text-[13.5px]">
                <span className="font-semibold text-ink">{t.name}</span>
                {t.city && <span className="text-ink-muted"> · {t.city}</span>}
                {t.tripLabel && <span className="mt-0.5 block text-ink-muted">{t.tripLabel}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}
