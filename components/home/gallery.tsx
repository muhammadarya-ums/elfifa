import { ArrowUpRight } from 'lucide-react'
import { Container, SectionHeading } from '@/components/site/primitives'
import type { Content } from '@/lib/content'

const SIZE: Record<string, string> = { normal: '', wide: 'col-span-2', large: 'col-span-2 row-span-2' }

export default function Gallery({ c, instagram }: { c: Content; instagram: string }) {
  return (
    <section id="galeri" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={c.s('eyebrow')} title={c.s('title')} />
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-brand-700 hover:underline">
              Lebih banyak di Instagram <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
        <div className="mt-12 grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[210px] md:grid-cols-4 md:gap-4">
          {c.list('photos').map((p, i) => (
            <figure key={i} className={`group relative overflow-hidden rounded-2xl bg-sand-100 ${SIZE[p.size] ?? ''}`}>
              <img src={p.src} alt={p.alt} loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}
