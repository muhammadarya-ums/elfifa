import type { Metadata } from 'next'
import LegalPage from '@/components/site/legal-page'
import SiteShell from '@/components/site-shell'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Elfifa',
  description: 'Bagaimana Elfifa Travel Umroh dan KBIHU Elfifa mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
  alternates: { canonical: '/kebijakan-privasi' },
}

export default async function PrivacyPage() {
  const s = await getSettings()
  const entity = s.brand_legal_name || 'Elfifa Travel Umroh dan KBIHU Elfifa'

  return (
    <SiteShell settings={s}>
      <LegalPage title="Kebijakan Privasi" updated="25 November 2026">
        <section>
          <p>
            Kebijakan ini menjelaskan bagaimana <strong>{entity}</strong> (“kami”) memproses data pribadi Anda saat menggunakan website ini,
            mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
          </p>
        </section>

        <section>
          <h2>Data yang kami kumpulkan</h2>
          <ul>
            <li>Data yang Anda isi pada formulir pendaftaran: nama lengkap, nomor WhatsApp, email, kota domisili, jumlah jamaah, status paspor, dan catatan.</li>
            <li>Riwayat pembayaran yang kami catat setelah Anda melakukan transfer.</li>
            <li>Data teknis terbatas untuk keamanan, seperti alamat IP, yang digunakan untuk mencegah penyalahgunaan formulir.</li>
          </ul>
          <p>Kami tidak meminta salinan dokumen identitas melalui website ini. Dokumen diminta terpisah oleh tim kami melalui kanal resmi.</p>
        </section>

        <section>
          <h2>Tujuan penggunaan</h2>
          <ul>
            <li>Memproses pendaftaran, menghubungi Anda, dan mengurus kelengkapan perjalanan atau bimbingan ibadah.</li>
            <li>Mencatat dan menampilkan status serta riwayat pembayaran kepada Anda.</li>
            <li>Memenuhi kewajiban hukum dan administrasi penyelenggaraan ibadah umrah dan haji.</li>
          </ul>
          <p>Kami tidak menjual data pribadi Anda dan tidak menggunakannya untuk iklan pihak ketiga.</p>
        </section>

        <section>
          <h2>Pembagian data</h2>
          <p>
            Data hanya dibagikan sejauh diperlukan untuk penyelenggaraan perjalanan, misalnya kepada maskapai, penyedia visa, hotel, dan
            instansi pemerintah terkait, atau bila diwajibkan oleh peraturan perundang-undangan.
          </p>
        </section>

        <section>
          <h2>Keamanan & penyimpanan</h2>
          <p>
            Data disimpan pada basis data dengan akses terbatas hanya untuk staf yang berwenang, dan setiap perubahan data oleh staf
            tercatat dalam log audit. Data disimpan selama diperlukan untuk tujuan di atas dan kewajiban administrasi, dan Anda dapat
            meminta penghapusannya kapan saja melalui kontak di bawah.
          </p>
        </section>

        <section>
          <h2>Hak Anda</h2>
          <p>Sesuai UU PDP, Anda berhak untuk:</p>
          <ul>
            <li>mengakses dan memperoleh salinan data pribadi Anda;</li>
            <li>memperbaiki data yang tidak akurat;</li>
            <li>meminta penghapusan data, sepanjang tidak bertentangan dengan kewajiban hukum kami;</li>
            <li>menarik kembali persetujuan pemrosesan data.</li>
          </ul>
        </section>

        <section>
          <h2>Hubungi kami</h2>
          <p>
            Untuk pertanyaan atau permintaan terkait data pribadi, hubungi kami melalui email <strong>{s.travel_email}</strong>, WhatsApp{' '}
            <strong>{s.travel_phone}</strong>, atau datang ke kantor kami di {s.travel_address}.
          </p>
        </section>
      </LegalPage>
    </SiteShell>
  )
}
