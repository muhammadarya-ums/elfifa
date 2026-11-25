import type { Metadata } from 'next'
import LegalPage from '@/components/site/legal-page'
import SiteShell from '@/components/site-shell'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Elfifa',
  description: 'Ketentuan pendaftaran, pembayaran, dan pembatalan program Elfifa Travel Umroh dan KBIHU Elfifa.',
  alternates: { canonical: '/syarat-ketentuan' },
}

export default async function TermsPage() {
  const s = await getSettings()
  const entity = s.brand_legal_name || 'Elfifa Travel Umroh dan KBIHU Elfifa'

  return (
    <SiteShell settings={s}>
      <LegalPage title="Syarat & Ketentuan" updated="25 November 2026">
        <section>
          <p>
            Dengan mendaftar melalui website ini, Anda menyetujui ketentuan berikut. Ketentuan rinci untuk setiap program dituangkan dalam
            perjanjian tertulis yang Anda terima dari <strong>{entity}</strong> saat konfirmasi pendaftaran; bila terdapat perbedaan,
            perjanjian tertulis tersebut yang berlaku.
          </p>
        </section>

        <section>
          <h2>Pendaftaran</h2>
          <ul>
            <li>Pendaftaran online bersifat pemesanan awal. Kursi dinyatakan terkunci setelah uang muka diterima dan dicatat oleh tim kami.</li>
            <li>Data yang diisi harus benar dan sesuai dokumen resmi (KTP/paspor). Kesalahan data dapat menghambat pengurusan visa dan tiket.</li>
            <li>Kode pendaftaran bersifat pribadi. Jangan membagikannya bersama nomor WhatsApp Anda kepada pihak lain.</li>
          </ul>
        </section>

        <section>
          <h2>Harga & pembayaran</h2>
          <ul>
            <li>Harga yang tercantum adalah per jamaah dan dapat berubah mengikuti regulasi penerbangan, kebijakan pemerintah, dan kurs mata uang sebelum pelunasan.</li>
            <li>Pembayaran hanya sah bila ditransfer ke rekening resmi atas nama perusahaan: <strong>{s.travel_bank}</strong>.</li>
            <li>Kami tidak pernah meminta transfer ke rekening pribadi. Laporkan kepada kami bila menerima permintaan semacam itu.</li>
            <li>Status pembayaran dapat dipantau pada halaman Cek Status setelah dicatat oleh tim kami.</li>
          </ul>
        </section>

        <section>
          <h2>Pembatalan & pengembalian dana</h2>
          <p>
            Pembatalan diajukan secara tertulis. Besaran pengembalian dana mengikuti perjanjian program dan memperhitungkan biaya yang telah
            dibayarkan kepada pihak ketiga (misalnya tiket pesawat, visa, dan hotel) yang tidak dapat dikembalikan.
          </p>
        </section>

        <section>
          <h2>Perubahan jadwal</h2>
          <p>
            Jadwal keberangkatan, maskapai, atau hotel dapat berubah karena keadaan di luar kendali kami, seperti kebijakan otoritas Arab
            Saudi, maskapai, atau kondisi kahar. Setiap perubahan akan kami informasikan sesegera mungkin beserta alternatif yang setara.
          </p>
        </section>

        <section>
          <h2>Kontak</h2>
          <p>
            Pertanyaan mengenai ketentuan ini dapat disampaikan melalui <strong>{s.travel_email}</strong> atau WhatsApp{' '}
            <strong>{s.travel_phone}</strong>.
          </p>
        </section>
      </LegalPage>
    </SiteShell>
  )
}
