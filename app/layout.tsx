import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elfifa - Umroh Praktis Full Service',
  description: 'Penyedia layanan perjalanan Umroh praktis full service yang terpercaya, memastikan kenyamanan dan kekhusyukan ibadah Anda di Tanah Suci.',
  generator: 'v0.app',
  icons: {
    icon: '/logo1.png',
    apple: '/logo1.png',
  },
  
  openGraph: {
    title: 'Elfifa - Umroh Praktis Full Service',
    description: 'Penyedia layanan perjalanan Umroh praktis full service yang terpercaya, memastikan kenyamanan dan kekhusyukan ibadah Anda di Tanah Suci.',
    url: 'https://elfifa.vercel.app',
    siteName: 'Elfifa Travel Umroh',
    images: [
      {
        url: 'https://elfifa.vercel.app/logo1.png',
        width: 1200,
        height: 630,
        alt: 'Elfifa App Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elfifa - Umroh Praktis Full Service',
    description: 'Penyedia layanan perjalanan Umroh praktis full service yang terpercaya, memastikan kenyamanan dan kekhusyukan ibadah Anda di Tanah Suci.',
    images: ['https://elfifa.vercel.app/logo1.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}