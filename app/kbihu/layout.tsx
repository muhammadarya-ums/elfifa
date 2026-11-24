import type { Metadata } from 'next'
import { KBIHU_URL, kbihu } from '@/lib/site-config'

// Layout bersarang: <html>/<body> sudah dirender oleh app/layout.tsx,
// di sini cukup override metadata khusus KBIHU.
const title = `${kbihu.name} | Bimbingan Haji dan Umrah`

export const metadata: Metadata = {
  title,
  description: kbihu.description,
  alternates: { canonical: KBIHU_URL },
  openGraph: {
    title,
    description: kbihu.description,
    url: KBIHU_URL,
    siteName: kbihu.name,
    images: [{ url: '/images/kbihu-og.jpg', width: 1200, height: 630, alt: 'Jamaah mengikuti manasik' }],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: kbihu.description,
    images: ['/images/kbihu-og.jpg'],
  },
}

export default function KbihuLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
