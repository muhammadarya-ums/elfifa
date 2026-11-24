import { eq } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { DEFAULT_SETTINGS } from '../settings-def'
import * as schema from './schema'

const SEED_FLAG = '__seeded_at'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Mengisi data awal (pengaturan, paket contoh, jadwal contoh) satu kali saja.
 * Ditandai dengan key `__seeded_at` di tabel settings, sehingga data yang
 * dihapus admin tidak akan muncul kembali.
 */
export async function seedDefaults(database: LibSQLDatabase<typeof schema>) {
  // Cek cepat di luar transaksi (jalur umum: sudah pernah di-seed)
  const done = await database.select().from(schema.settings).where(eq(schema.settings.key, SEED_FLAG)).get()
  if (done) return

  await database.transaction(
    async (db) => {
      const flag = await db.select().from(schema.settings).where(eq(schema.settings.key, SEED_FLAG)).get()
      if (flag) return

      await db
        .insert(schema.settings)
        .values(Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })))
        .onConflictDoNothing()

      await db
        .insert(schema.packages)
        .values([
          {
            slug: 'umroh-17-hari-awal-musim-dingin',
            name: 'Umroh 17 Hari Awal Musim Dingin',
            tagline: 'Awal Musim Dingin',
            description:
              'Perjalanan ibadah lebih khusyuk & lebih nyaman di cuaca sejuk awal musim dingin. Program 17 hari dengan 9 hari di Makkah dan 6 hari di Madinah, lengkap dengan ziarah dan bonus wisata religi.',
            durationDays: 17,
            departureDate: addDays(60),
            airline: 'Saudia Airlines (Direct)',
            priceIdr: 39_900_000,
            originalPriceIdr: 42_900_000,
            quota: 45,
            hotelMakkah: 'Hotel Ghalib',
            hotelMakkahStars: 3,
            hotelMakkahNights: 9,
            hotelMakkahNote: '± 250 meter dari Masjidil Haram',
            hotelMadinah: 'Royal Andalus',
            hotelMadinahStars: 4,
            hotelMadinahNights: 6,
            hotelMadinahNote: 'Pelataran Masjid Nabawi',
            includes: [
              'Perlengkapan umroh',
              'Visa umroh',
              'Tiket pesawat PP confirmed',
              'Mutawwif sesuai sunnah',
              'Konsumsi 3x sehari',
              'Hotel dekat masjid',
              'Bus AC executive',
              "Dokumentasi syar'i",
            ].join('\n'),
            bonuses: ['Percetakan Al-Qur’an', 'Jabal Magnet', 'Kuliner khas Arab', 'Ziarah Thaif', 'Albaik fast food'].join('\n'),
            isFeatured: true,
            isActive: true,
            sortOrder: 0,
          },
          {
            slug: 'umroh-reguler-12-hari',
            name: 'Umroh Reguler 12 Hari',
            tagline: 'Program Reguler',
            description:
              'Program umroh reguler 12 hari untuk jamaah dengan waktu terbatas, tetap dengan pendampingan mutawwif dan hotel nyaman.',
            durationDays: 12,
            departureDate: addDays(95),
            airline: 'Garuda Indonesia',
            priceIdr: 33_500_000,
            originalPriceIdr: null,
            quota: 40,
            hotelMakkah: 'Hotel Elaf Ajyad',
            hotelMakkahStars: 4,
            hotelMakkahNights: 5,
            hotelMakkahNote: '± 400 meter dari Masjidil Haram',
            hotelMadinah: 'Hotel Al Haram',
            hotelMadinahStars: 4,
            hotelMadinahNights: 4,
            hotelMadinahNote: '± 150 meter dari Masjid Nabawi',
            includes: ['Visa umroh', 'Tiket pesawat PP', 'Mutawwif', 'Konsumsi 3x sehari', 'Bus AC', 'Perlengkapan umroh'].join('\n'),
            bonuses: ['City tour Madinah', 'Ziarah Masjid Quba'].join('\n'),
            isFeatured: false,
            isActive: true,
            sortOrder: 1,
          },
        ])
        .onConflictDoNothing()

      await db.insert(schema.schedules).values([
        { date: addDays(10), startTime: '08:00', endTime: '11:30', topic: 'Praktik Penggunaan Kain Ihram', location: 'Asrama Haji Bekasi' },
        { date: addDays(17), startTime: '08:00', endTime: '11:30', topic: 'Tawaf & Sa’i: Teori dan Praktik', location: 'Masjid Al-Barkah' },
        { date: addDays(24), startTime: '08:00', endTime: '11:30', topic: 'Simulasi Wukuf di Arafah', location: 'Lapangan Manasik' },
      ])

      await db
        .insert(schema.settings)
        .values({ key: SEED_FLAG, value: new Date().toISOString() })
        .onConflictDoNothing()
    },
    { behavior: 'immediate' },
  )
}
