import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Deteksi domain yang masuk
  const isKbihuDomain = 
    hostname.startsWith('kbihu-elfifa.') || 
    hostname.startsWith('kbihu.');

  // 2. Jika diakses dari domain KBIHU
  if (isKbihuDomain) {
    // Jika user buka "kbihu-elfifa.vercel.app/" 
    // Internally kita belokkan (rewrite) ke folder "/kbihu"
    if (!url.pathname.startsWith('/kbihu')) {
      url.pathname = `/kbihu${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Biarkan file statis (gambar, favicon, _next) lewat tanpa di-rewrite
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};