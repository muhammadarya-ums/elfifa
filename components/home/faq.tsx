import { Plus } from 'lucide-react'
import { ButtonLink, Container, SectionHeading } from '@/components/site/primitives'
import { WhatsAppIcon } from '@/components/social-icons'
import type { Faq as FaqItem } from '@/lib/db/schema'

/** Akordion tanpa JavaScript (details/summary) — aksesibel & ringan. */
export default function Faq({ items, waUrl }: { items: FaqItem[]; waUrl: string }) {
  if (items.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }

  return (
    <section id="faq" className="scroll-mt-20 bg-sand-50 py-20 sm:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="Tanya jawab" title="Yang sering ditanyakan." description="Belum menemukan jawabannya? Tim kami siap membantu pada jam kerja." />
          <ButtonLink href={waUrl} variant="outline" external className="mt-8">
            <WhatsAppIcon className="size-4 text-[#1fa855]" /> Tanya lewat WhatsApp
          </ButtonLink>
        </div>
        <div className="divide-y divide-sand-200 border-y border-sand-200">
          {items.map((f) => (
            <details key={f.id} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left">
                <span className="font-display text-[1.25rem] leading-snug text-ink">{f.question}</span>
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-sand-300 text-ink-soft transition-transform duration-300 group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-12 text-[15px] leading-7 text-ink-soft">{f.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
