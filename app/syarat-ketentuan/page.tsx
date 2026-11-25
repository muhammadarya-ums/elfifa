import type { Metadata } from 'next'
import Markdown from '@/components/markdown'
import LegalPage from '@/components/site/legal-page'
import SiteShell from '@/components/site-shell'
import { fillTokens, getBlocks } from '@/lib/content'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Elfifa',
  description: 'Ketentuan pendaftaran, pembayaran, dan pembatalan program Elfifa Travel Umroh dan KBIHU Elfifa.',
  alternates: { canonical: '/syarat-ketentuan' },
}

export default async function TermsPage() {
  const [s, blocks] = await Promise.all([getSettings(), getBlocks('legal.terms')])
  const c = blocks['legal.terms']
  const body = fillTokens(c.s('body'), {
    nama_badan_usaha: s.brand_legal_name || 'Elfifa Travel Umroh dan KBIHU Elfifa',
    email: s.travel_email,
    telepon: s.travel_phone,
    alamat: s.travel_address,
    rekening: s.travel_bank,
  })

  return (
    <SiteShell settings={s}>
      <LegalPage title="Syarat & Ketentuan" updated={c.s('updated')}>
        <Markdown source={body} />
      </LegalPage>
    </SiteShell>
  )
}
