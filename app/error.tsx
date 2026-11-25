'use client'

import { useEffect } from 'react'
import { buttonVariants } from '@/components/site/primitives'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-6 text-center">
      <h1 className="font-display text-4xl text-ink">Maaf, terjadi gangguan.</h1>
      <p className="mt-4 max-w-md text-[15.5px] leading-7 text-ink-soft">
        Sistem kami sedang mengalami kendala sementara. Silakan coba lagi, atau hubungi kami melalui WhatsApp bila berlanjut.
      </p>
      {error.digest && <p className="mt-3 font-mono text-[12px] text-ink-muted">Kode referensi: {error.digest}</p>}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonVariants.primary}>Coba lagi</button>
        <a href="/" className={buttonVariants.outline}>Ke beranda</a>
      </div>
    </main>
  )
}
