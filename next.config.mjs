/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Driver libSQL memakai binary native — jangan di-bundle
  serverExternalPackages: ['@libsql/client', 'libsql'],
  // File migrasi SQL dibaca saat runtime (auto-migrate), sertakan dalam bundle serverless
  outputFileTracingIncludes: {
    '/**': ['./drizzle/**/*'],
  },
  poweredByHeader: false,
  async headers() {
    // CSP (dengan nonce per request) dipasang di proxy.ts
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
      ...(process.env.NODE_ENV === 'production'
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
        : []),
    ]
    return [
      { source: '/:path*', headers: security },
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      {
        source: '/:all*(png|jpg|jpeg|webp|svg|mp4)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
