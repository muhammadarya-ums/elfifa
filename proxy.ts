import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Multi-domain routing:
 * - elfifa.*            → landing travel umroh (app/page.tsx)
 * - kbihu-elfifa.* / kbihu.* → halaman KBIHU (app/kbihu/page.tsx) via rewrite
 */
const SHARED_PREFIXES = ['/kbihu', '/admin', '/cek-status', '/paket']

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const isKbihuDomain =
    hostname.startsWith('kbihu-elfifa.') || hostname.startsWith('kbihu.')

  const { pathname } = request.nextUrl
  // Rute bersama yang tetap dapat diakses apa adanya dari domain KBIHU
  const isSharedRoute = SHARED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (isKbihuDomain && !isSharedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/kbihu${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // Lewati API, aset Next.js, dan semua file statis (apa pun yang memiliki ekstensi:
  // gambar, video, favicon, robots.txt, sitemap.xml, dll).
  matcher: ['/((?!api|_next/static|_next/image|.*\..*).*)'],
}
