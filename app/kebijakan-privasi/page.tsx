import type { Metadata } from 'next'
import Markdown from '@/components/markdown'
import LegalPage from '@/components/site/legal-page'
import SiteShell from '@/components/site-shell'
import { fillTokens, getBlocks } from '@/lib/content'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Elfifa',
  description: 'Bagaimana Elfifa Travel Umroh dan KBIHU Elfifa mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
  alternates: { canonical: '/kebijakan-privasi' },
}

export default async function PrivacyPage() {
  const [s, blocks] = await Promise.all([getSettings(), getBlocks('legal.privacy')])
  const c = blocks['legal.privacy']
  const body = fillTokens(c.s('body'), {
    nama_badan_usaha: s.brand_legal_name || 'Elfifa Travel Umroh dan KBIHU Elfifa',
    email: s.travel_email,
    telepon: s.travel_phone,
    alamat: s.travel_address,
    rekening: s.travel_bank,
  })

  return (
    <SiteShell settings={s}>
      <LegalPage title="Kebijakan Privasi" updated={c.s('updated')}>
        <Markdown source={body} />
      </LegalPage>
    </SiteShell>
  )
}
