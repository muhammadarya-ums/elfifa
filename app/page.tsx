import Faq from '@/components/home/faq'
import Gallery from '@/components/home/gallery'
import Hero from '@/components/home/hero'
import Journey from '@/components/home/journey'
import Packages from '@/components/home/packages'
import Profile from '@/components/home/profile'
import Register from '@/components/home/register'
import Services from '@/components/home/services'
import Testimonials from '@/components/home/testimonials'
import SiteFooter from '@/components/site/site-footer'
import SiteHeader from '@/components/site/site-header'
import WhatsAppFab from '@/components/site/whatsapp-fab'
import { getActivePackages, getPublishedFaqs, getPublishedTestimonials, getSettings } from '@/lib/data'
import { waLink } from '@/lib/format'
import { MAIN_URL } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [settings, packages, testimonials, faqs] = await Promise.all([
    getSettings(),
    getActivePackages(),
    getPublishedTestimonials(),
    getPublishedFaqs(['umroh', 'pembayaran', 'umum']),
  ])
  const featured = packages[0]
  const waUrl = waLink(
    settings.travel_whatsapp,
    featured
      ? `Assalamu'alaikum Elfifa, saya ingin konsultasi mengenai ${featured.name}.`
      : "Assalamu'alaikum Elfifa, saya ingin konsultasi mengenai paket umroh.",
  )

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: settings.brand_legal_name || 'Elfifa Travel Umroh',
    url: MAIN_URL,
    logo: `${MAIN_URL}/og-image.jpg`,
    telephone: settings.travel_phone,
    email: settings.travel_email,
    address: { '@type': 'PostalAddress', streetAddress: settings.travel_address, addressCountry: 'ID' },
    sameAs: [settings.travel_instagram, settings.travel_facebook, settings.travel_youtube].filter(
      (u) => u && !/^https:\/\/www\.(instagram|facebook|youtube)\.com\/?$/.test(u),
    ),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, '\u003c') }} />
      <SiteHeader />
      <main id="konten">
        <Hero settings={settings} featured={featured} waUrl={waUrl} />
        <Packages packages={packages} waUrl={waUrl} />
        <Services includes={featured?.includes} />
        <Journey />
        <Profile settings={settings} />
        <Testimonials items={testimonials} />
        <Gallery instagram={settings.travel_instagram} />
        <Faq items={faqs} waUrl={waUrl} />
        <Register packages={packages} settings={settings} />
      </main>
      <SiteFooter settings={settings} packages={packages} />
      <WhatsAppFab href={waUrl} />
    </>
  )
}
