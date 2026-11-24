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
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
    return [
      { source: '/:path*', headers: security },
      {
        source: '/:all*(png|jpg|jpeg|webp|svg|mp4)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
