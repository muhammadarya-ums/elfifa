import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import { MAIN_URL, travel } from '@/lib/site-config'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const serif = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

const title = `Elfifa - ${travel.tagline}`

export const metadata: Metadata = {
  metadataBase: new URL(MAIN_URL),
  title,
  description: travel.description,
  keywords: ['umroh', 'paket umroh', 'umroh 17 hari', 'travel umroh surabaya', 'elfifa'],
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description: travel.description,
    url: MAIN_URL,
    siteName: travel.name,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Logo Elfifa Travel Umroh' }],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: travel.description,
    images: ['/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#007a82',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Membaca header membuat setiap halaman (termasuk 404) dirender per request,
  // sehingga Next.js dapat menyisipkan nonce CSP dari proxy.ts ke semua skrip.
  await headers()
  return (
    <html lang="id" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-sand-50 font-sans text-ink antialiased">
        {children}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
