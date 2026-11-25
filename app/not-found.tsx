import Link from 'next/link'
import { buttonVariants } from '@/components/site/primitives'

export const metadata = { title: 'Halaman tidak ditemukan | Elfifa' }

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-6 text-center">
      <Link href="/" aria-label="Elfifa, beranda">
        <img src="/logo-sm.png" alt="Elfifa" width={333} height={160} className="h-12 w-auto" />
      </Link>
      <p className="font-display mt-14 text-8xl text-sand-300">404</p>
      <h1 className="font-display mt-2 text-4xl text-ink">Halaman ini tidak ditemukan.</h1>
      <p className="mt-4 max-w-md text-[15.5px] leading-7 text-ink-soft">
        Tautan mungkin sudah tidak berlaku atau paket telah ditutup. Silakan kembali ke beranda untuk melihat program yang tersedia.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants.primary}>Kembali ke beranda</Link>
        <Link href="/cek-status" className={buttonVariants.outline}>Cek status pendaftaran</Link>
      </div>
    </main>
  )
}
