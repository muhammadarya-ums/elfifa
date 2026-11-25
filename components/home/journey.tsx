import { Container, SectionHeading } from '@/components/site/primitives'
import type { Content } from '@/lib/content'

export default function Journey({ c }: { c: Content }) {
  return (
    <section id="alur" className="relative scroll-mt-20 overflow-hidden bg-brand-950 py-20 text-white sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <Container className="relative">
        <SectionHeading
          tone="light"
          eyebrow={c.s('eyebrow')}
          title={c.s('title')}
          description={c.s('description')}
        />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {c.list('steps').map((s, i) => (
            <li key={i} className="bg-brand-950 p-8 transition-colors duration-300 hover:bg-brand-900 sm:p-9">
              <span className="font-display text-sm text-gold-300">Langkah {String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display mt-4 text-2xl leading-snug">{s.title}</h3>
              <p className="mt-3 text-[14.5px] leading-7 text-brand-100/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
