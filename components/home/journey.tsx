import { Container, SectionHeading } from '@/components/site/primitives'

const STEPS = [
  { title: 'Konsultasi & pendaftaran', body: 'Pilih paket, isi formulir online, dan terima kode pendaftaran Anda saat itu juga.' },
  { title: 'Dokumen & uang muka', body: 'Tim kami memandu kelengkapan paspor, vaksin, dan berkas. Uang muka mengunci kursi Anda.' },
  { title: 'Manasik', body: 'Belajar tata cara umroh sesuai sunnah bersama pembimbing, termasuk praktik ihram dan tawaf.' },
  { title: 'Pelunasan & perlengkapan', body: 'Pelunasan sesuai jadwal, perlengkapan dibagikan, dan informasi keberangkatan dikirim.' },
  { title: 'Di Tanah Suci', body: 'Didampingi mutawwif dan tour leader dari bandara hingga kembali, termasuk ziarah.' },
  { title: 'Kembali ke tanah air', body: 'Kami pastikan seluruh jamaah tiba dengan selamat. Semoga mabrur.' },
]

export default function Journey() {
  return (
    <section id="alur" className="relative scroll-mt-20 overflow-hidden bg-brand-950 py-20 text-white sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <Container className="relative">
        <SectionHeading
          tone="light"
          eyebrow="Alur perjalanan"
          title="Enam langkah, satu tujuan."
          description="Anda selalu tahu sedang berada di tahap mana. Setiap perubahan status bisa dilihat di halaman Cek Status."
        />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-brand-950 p-8 transition-colors duration-300 hover:bg-brand-900 sm:p-9">
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
