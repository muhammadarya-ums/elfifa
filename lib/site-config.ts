/**
 * Konfigurasi statis (domain & deskripsi SEO).
 * Data kontak, WhatsApp, rekening, dan media sosial dikelola dari
 * panel admin: /admin/pengaturan.
 */

export const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL || 'https://elfifa.vercel.app'
export const KBIHU_URL = process.env.NEXT_PUBLIC_KBIHU_URL || 'https://kbihu-elfifa.vercel.app'

/** Domain custom (jika nanti dipakai). */
export const CUSTOM_MAIN_HOST = 'elfifa.com'
export const CUSTOM_KBIHU_URL = 'https://kbihu.elfifa.com'

export const travel = {
  name: 'Elfifa Travel Umroh',
  tagline: 'Umroh Praktis Full Service',
  description:
    'Penyedia layanan perjalanan Umroh praktis full service yang terpercaya, memastikan kenyamanan dan kekhusyukan ibadah Anda di Tanah Suci.',
} as const

export const kbihu = {
  name: 'KBIHU Elfifa',
  description:
    'Bimbingan ibadah Haji dan Umrah sesuai sunnah dengan pendampingan intensif dari tanah air hingga Tanah Suci.',
} as const
