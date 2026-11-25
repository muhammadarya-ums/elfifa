import { Container, Eyebrow } from './primitives'

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <Eyebrow>Informasi legal</Eyebrow>
        <h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 text-[13.5px] text-ink-muted">Terakhir diperbarui {updated}</p>
        <div className="mt-12 space-y-10 text-[15.5px] leading-8 text-ink-soft [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_li]:pl-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p+p]:mt-4 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-gold-500">
          {children}
        </div>
      </Container>
    </section>
  )
}
