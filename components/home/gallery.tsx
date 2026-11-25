import { ArrowUpRight } from 'lucide-react'
import { Container, SectionHeading } from '@/components/site/primitives'

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=70`

const PHOTOS = [
  { src: '/galeri/jamaah1.webp', alt: 'Rombongan jamaah Elfifa di depan Holy Quran Services Center', cls: 'col-span-2 row-span-2' },
  { src: U('1564769625905-50e93615e769'), alt: 'Kiswah Ka’bah dan jamaah yang sedang tawaf', cls: '' },
  { src: U('1565552645632-d725f8bfc19a'), alt: 'Menara jam Makkah dan menara Masjidil Haram', cls: '' },
  { src: '/galeri/jamaah2.webp', alt: 'Jamaah Elfifa berpakaian ihram berfoto bersama', cls: 'col-span-2' },
  { src: U('1580418827493-f2b22c0a76cb'), alt: 'Ka’bah di tengah jamaah dengan latar menara Abraj Al-Bait', cls: 'col-span-2' },
  { src: U('1542816417-0983c9c9ad53'), alt: 'Mushaf Al-Qur’an bersampul biru', cls: 'col-span-2' },
]

export default function Gallery({ instagram }: { instagram: string }) {
  return (
    <section id="galeri" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Dokumentasi" title="Momen bersama jamaah." />
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-brand-700 hover:underline">
              Lebih banyak di Instagram <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
        <div className="mt-12 grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[210px] md:grid-cols-4 md:gap-4">
          {PHOTOS.map((p) => (
            <figure key={p.src} className={`group relative overflow-hidden rounded-2xl bg-sand-100 ${p.cls}`}>
              <img src={p.src} alt={p.alt} loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}
