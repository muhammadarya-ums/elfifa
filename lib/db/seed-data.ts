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
  if (!done) await seedInitial(database)
  await seedFaqs(database)
}

async function seedInitial(database: LibSQLDatabase<typeof schema>) {
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

const FAQ_FLAG = '__seed_faq_v1'

/** FAQ awal (dapat diedit admin). Dijalankan sekali, termasuk pada database lama. */
async function seedFaqs(database: LibSQLDatabase<typeof schema>) {
  const done = await database.select().from(schema.settings).where(eq(schema.settings.key, FAQ_FLAG)).get()
  if (done) return
  await database.transaction(
    async (db) => {
      const again = await db.select().from(schema.settings).where(eq(schema.settings.key, FAQ_FLAG)).get()
      if (again) return
      await db.insert(schema.faqs).values([
        {
          category: 'umroh',
          sortOrder: 1,
          question: 'Bagaimana cara mendaftar umroh di Elfifa?',
          answer:
            'Isi formulir pendaftaran di website ini. Anda akan langsung mendapat kode pendaftaran, lalu tim kami menghubungi Anda melalui WhatsApp untuk konfirmasi paket, kelengkapan dokumen, dan pembayaran uang muka.',
        },
        {
          category: 'umroh',
          sortOrder: 2,
          question: 'Dokumen apa saja yang perlu disiapkan?',
          answer:
            'Umumnya: KTP, Kartu Keluarga, paspor yang masih berlaku minimal 6 bulan dari tanggal keberangkatan, pas foto, dan bukti vaksin meningitis. Daftar final selalu kami konfirmasi ulang mengikuti regulasi terbaru saat Anda mendaftar.',
        },
        {
          category: 'umroh',
          sortOrder: 3,
          question: 'Saya belum punya paspor. Apakah tetap bisa mendaftar?',
          answer:
            'Bisa. Pilih “Belum / sedang diurus” pada formulir. Tim kami akan memandu proses pembuatan paspor agar selesai sebelum batas pengurusan visa.',
        },
        {
          category: 'pembayaran',
          sortOrder: 4,
          question: 'Bagaimana skema pembayarannya?',
          answer:
            'Pembayaran dilakukan bertahap: uang muka untuk mengunci kursi, lalu pelunasan sebelum keberangkatan sesuai jadwal yang kami sampaikan. Transfer hanya ke rekening resmi atas nama perusahaan dan cantumkan kode pendaftaran pada berita transfer.',
        },
        {
          category: 'pembayaran',
          sortOrder: 5,
          question: 'Bagaimana saya memantau status pendaftaran dan pembayaran?',
          answer:
            'Buka halaman Cek Status, masukkan kode pendaftaran dan nomor WhatsApp yang Anda daftarkan. Status, riwayat pembayaran, dan sisa tagihan tampil di sana dan diperbarui setiap kali kami mencatat pembayaran Anda.',
        },
        {
          category: 'umum',
          sortOrder: 6,
          question: 'Apa beda Elfifa Travel dan KBIHU Elfifa?',
          answer:
            'Elfifa Travel menyelenggarakan perjalanan umroh lengkap (tiket, visa, hotel, transportasi, mutawwif). KBIHU Elfifa adalah kelompok bimbingan ibadah haji dan umrah yang fokus pada pembelajaran manasik dan pendampingan ibadah.',
        },
      ])
      await db.insert(schema.settings).values({ key: FAQ_FLAG, value: new Date().toISOString() }).onConflictDoNothing()
    },
    { behavior: 'immediate' },
  )
}
