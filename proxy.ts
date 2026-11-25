import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy (Next 16):
 * 1. Content-Security-Policy dengan nonce acak per request — skrip inline
 *    hanya berjalan bila membawa nonce ini (Next.js menyisipkannya otomatis).
 * 2. Multi-domain: domain berawalan `kbihu-elfifa.` / `kbihu.` diarahkan ke /kbihu.
 */

/** Rute bersama yang tetap dapat diakses apa adanya dari domain KBIHU */
const SHARED_PREFIXES = ['/kbihu', '/admin', '/cek-status', '/paket', '/kebijakan-privasi', '/syarat-ketentuan', '/media']

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production'
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? ` 'unsafe-eval'` : ''}`,
    // 'unsafe-inline' untuk atribut style (progress bar) — risiko rendah dibanding script
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://images.unsplash.com`,
    `font-src 'self'`,
    `media-src 'self'`,
    `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ]
  return directives.join('; ')
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const hostname = request.headers.get('host') ?? ''
  const isKbihuDomain = hostname.startsWith('kbihu-elfifa.') || hostname.startsWith('kbihu.')
  const { pathname } = request.nextUrl
  const isSharedRoute = SHARED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  let response: NextResponse
  if (isKbihuDomain && !isSharedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/kbihu${pathname === '/' ? '' : pathname}`
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      // Lewati API, aset Next.js, dan file statis (apa pun yang memiliki ekstensi)
      source: '/((?!api|media/|_next/static|_next/image|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
