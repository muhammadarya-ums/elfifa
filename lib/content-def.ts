/**
 * Definisi konten halaman yang dapat diedit dari panel admin (CMS).
 * Satu definisi per blok → dipakai untuk form editor, validasi server, dan nilai default.
 * File ini aman dipakai di client (tanpa akses database).
 */

export type ScalarField =
  | { type: 'text'; key: string; label: string; max: number; hint?: string; optional?: boolean }
  | { type: 'textarea'; key: string; label: string; max: number; rows?: number; hint?: string; optional?: boolean }
  | { type: 'markdown'; key: string; label: string; max: number; hint?: string }
  | { type: 'image'; key: string; label: string; hint?: string; optional?: boolean }
  | { type: 'select'; key: string; label: string; options: { value: string; label: string }[] }

export type ListField = {
  type: 'list'
  key: string
  label: string
  itemLabel: string
  min: number
  max: number
  fields: ScalarField[]
}

export type Field = ScalarField | ListField

export type BlockDef = {
  key: string
  page: 'Beranda' | 'KBIHU' | 'Legal'
  title: string
  description: string
  /** Tempat blok ini tampil, untuk tombol "Lihat di website" */
  preview: string
  fields: Field[]
  defaults: Record<string, unknown>
}

/** Sumber gambar yang diizinkan (selaras dengan Content-Security-Policy). */
export function isAllowedImageUrl(url: string) {
  return (
    /^\/media\/[\w-]{8,40}$/.test(url) ||
    /^\/(images|galeri)\/[\w\-/]+\.(webp|jpg|jpeg|png)$/.test(url) ||
    /^https:\/\/images\.unsplash\.com\/[\w\-/.?=&%]+$/.test(url)
  )
}

const U = (id: string, w = 1100) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

const t = (key: string, label: string, max: number, hint?: string): ScalarField => ({ type: 'text', key, label, max, hint })
const ta = (key: string, label: string, max: number, rows = 3, hint?: string): ScalarField => ({ type: 'textarea', key, label, max, rows, hint })
const img = (key: string, label: string, hint?: string): ScalarField => ({ type: 'image', key, label, hint })

export const PRIVACY_TOKENS_HINT =
  'Token otomatis: {{nama_badan_usaha}}, {{email}}, {{telepon}}, {{alamat}}, {{rekening}}. Format: ## Judul, - poin, **tebal**, [teks](https://tautan).'

export const BLOCKS: BlockDef[] = [
  /* ============================ BERANDA ============================ */
  {
    key: 'home.hero',
    page: 'Beranda',
    title: 'Hero (pembuka)',
    description: 'Judul besar, paragraf pembuka, dan foto di bagian paling atas beranda.',
    preview: '/',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('titleLead', 'Judul — bagian biasa', 80),
      t('titleAccent', 'Judul — bagian miring berwarna', 80),
      ta('lead', 'Paragraf pembuka', 400, 4),
      img('image', 'Foto utama (bingkai lengkung)', 'Rasio potret 4:5 paling pas'),
      t('imageAlt', 'Deskripsi foto utama', 140, 'Untuk tunanetra & SEO: jelaskan isi foto'),
      img('imageSmall', 'Foto kecil'),
      t('imageSmallAlt', 'Deskripsi foto kecil', 140),
    ],
    defaults: {
      eyebrow: 'Elfifa Travel Umroh',
      titleLead: 'Berangkat dengan tenang,',
      titleAccent: 'pulang membawa mabrur.',
      lead: 'Umroh full service yang diurus dengan amanah — dokumen, manasik, akomodasi dekat masjid, hingga Anda kembali ke tanah air. Setiap pendaftaran dan pembayaran tercatat, dan dapat Anda pantau sendiri secara online.',
      image: U('1591604129939-f1efa4d9f7fa'),
      imageAlt: 'Kubah hijau Masjid Nabawi, Madinah',
      imageSmall: '/galeri/jamaah1.webp',
      imageSmallAlt: 'Rombongan jamaah Elfifa di Tanah Suci',
    },
  },
  {
    key: 'home.packages',
    page: 'Beranda',
    title: 'Judul bagian paket',
    description: 'Teks di atas daftar paket umroh. Isi paket dikelola di menu Paket Umroh.',
    preview: '/#paket',
    fields: [t('eyebrow', 'Label kecil', 60), t('title', 'Judul', 120), ta('description', 'Deskripsi', 400), ta('note', 'Catatan kecil', 300)],
    defaults: {
      eyebrow: 'Program umroh',
      title: 'Pilih waktu terbaik untuk beribadah.',
      description: 'Harga sudah termasuk tiket pesawat pulang-pergi, visa, hotel, makan, transportasi, dan mutawwif. Rincian lengkap tercantum di setiap paket.',
      note: 'Harga dan jadwal dapat menyesuaikan regulasi penerbangan serta kurs. Rincian final dikonfirmasi saat pendaftaran.',
    },
  },
  {
    key: 'home.services',
    page: 'Beranda',
    title: 'Mengapa Elfifa',
    description: 'Keunggulan layanan (pilar bernomor) dan foto pendukung.',
    preview: '/#layanan',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('titleLead', 'Judul — bagian biasa', 80),
      t('titleAccent', 'Judul — bagian miring', 80),
      ta('description', 'Deskripsi', 400),
      img('image', 'Foto'),
      t('imageAlt', 'Deskripsi foto', 160),
      t('caption', 'Keterangan di bawah foto', 160),
      { type: 'list', key: 'pillars', label: 'Pilar keunggulan', itemLabel: 'Pilar', min: 1, max: 6, fields: [t('title', 'Judul', 60), ta('body', 'Isi', 400)] },
    ],
    defaults: {
      eyebrow: 'Mengapa Elfifa',
      titleLead: 'Diurus dengan amanah,',
      titleAccent: 'dari awal hingga pulang.',
      description: 'Kami percaya perjalanan ibadah tidak boleh dibebani urusan teknis. Tugas kami memastikan setiap detail beres, supaya Anda cukup fokus beribadah.',
      image: '/galeri/jamaah2.webp',
      imageAlt: 'Rombongan jamaah Elfifa berpakaian ihram di Pusat Layanan Haji dan Umrah Terpadu',
      caption: 'Rombongan jamaah Elfifa di Pusat Layanan Haji dan Umrah Terpadu.',
      pillars: [
        { title: 'Ibadah sesuai tuntunan', body: 'Mutawwif yang berilmu mendampingi setiap rukun dan wajib umroh, dibekali manasik sebelum berangkat agar ibadah Anda sah dan tenang.' },
        { title: 'Dekat dengan masjid', body: 'Hotel dipilih berdasarkan jarak berjalan kaki ke Masjidil Haram dan Masjid Nabawi — supaya jamaah lansia pun tetap bisa salat berjamaah.' },
        { title: 'Transparan & tercatat', body: 'Setiap pendaftar mendapat kode unik. Status dokumen dan riwayat pembayaran bisa dicek kapan saja, dan transfer hanya ke rekening resmi perusahaan.' },
      ],
    },
  },
  {
    key: 'home.journey',
    page: 'Beranda',
    title: 'Alur perjalanan',
    description: 'Langkah-langkah dari pendaftaran hingga kepulangan.',
    preview: '/#alur',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('title', 'Judul', 100),
      ta('description', 'Deskripsi', 300),
      { type: 'list', key: 'steps', label: 'Langkah', itemLabel: 'Langkah', min: 2, max: 9, fields: [t('title', 'Judul', 60), ta('body', 'Isi', 300, 2)] },
    ],
    defaults: {
      eyebrow: 'Alur perjalanan',
      title: 'Enam langkah, satu tujuan.',
      description: 'Anda selalu tahu sedang berada di tahap mana. Setiap perubahan status bisa dilihat di halaman Cek Status.',
      steps: [
        { title: 'Konsultasi & pendaftaran', body: 'Pilih paket, isi formulir online, dan terima kode pendaftaran Anda saat itu juga.' },
        { title: 'Dokumen & uang muka', body: 'Tim kami memandu kelengkapan paspor, vaksin, dan berkas. Uang muka mengunci kursi Anda.' },
        { title: 'Manasik', body: 'Belajar tata cara umroh sesuai sunnah bersama pembimbing, termasuk praktik ihram dan tawaf.' },
        { title: 'Pelunasan & perlengkapan', body: 'Pelunasan sesuai jadwal, perlengkapan dibagikan, dan informasi keberangkatan dikirim.' },
        { title: 'Di Tanah Suci', body: 'Didampingi mutawwif dan tour leader dari bandara hingga kembali, termasuk ziarah.' },
        { title: 'Kembali ke tanah air', body: 'Kami pastikan seluruh jamaah tiba dengan selamat. Semoga mabrur.' },
      ],
    },
  },
  {
    key: 'home.profile',
    page: 'Beranda',
    title: 'Tentang kami & video',
    description: 'Cerita singkat perusahaan dan sampul video profil.',
    preview: '/#profil',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('titleLead', 'Judul — bagian biasa', 80),
      t('titleAccent', 'Judul — bagian miring', 80),
      ta('body', 'Paragraf utama', 800, 5),
      t('taglineIntro', 'Kalimat pengantar tagline', 160, 'Tagline sendiri diatur di Pengaturan'),
      img('videoPoster', 'Sampul video', 'Tampil sebelum video diputar'),
    ],
    defaults: {
      eyebrow: 'Tentang kami',
      titleLead: 'Lebih dari perjalanan —',
      titleAccent: 'ini tentang kekhusyukan.',
      body: 'Bagi kami, umroh adalah panggilan ibadah, bukan sekadar perjalanan wisata. Karena itu kami membekali jamaah dengan manasik sebelum berangkat, memilih hotel yang dekat dengan masjid, dan mendampingi rombongan bersama mutawwif dari awal hingga pulang.',
      taglineIntro: 'Prinsip kami sederhana, dan selalu kami bawa di spanduk rombongan:',
      videoPoster: '/images/video-poster.webp',
    },
  },
  {
    key: 'home.gallery',
    page: 'Beranda',
    title: 'Galeri',
    description: 'Foto dokumentasi. Ukuran “Besar” = 2×2 kotak, “Lebar” = 2 kotak mendatar.',
    preview: '/#galeri',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('title', 'Judul', 100),
      {
        type: 'list',
        key: 'photos',
        label: 'Foto',
        itemLabel: 'Foto',
        min: 1,
        max: 16,
        fields: [
          img('src', 'Gambar'),
          t('alt', 'Deskripsi foto', 160),
          {
            type: 'select',
            key: 'size',
            label: 'Ukuran',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'wide', label: 'Lebar' },
              { value: 'large', label: 'Besar' },
            ],
          },
        ],
      },
    ],
    defaults: {
      eyebrow: 'Dokumentasi',
      title: 'Momen bersama jamaah.',
      photos: [
        { src: '/galeri/jamaah1.webp', alt: 'Rombongan jamaah Elfifa di depan Holy Quran Services Center', size: 'large' },
        { src: U('1564769625905-50e93615e769', 700), alt: 'Kiswah Ka’bah dan jamaah yang sedang tawaf', size: 'normal' },
        { src: U('1565552645632-d725f8bfc19a', 700), alt: 'Menara jam Makkah dan menara Masjidil Haram', size: 'normal' },
        { src: '/galeri/jamaah2.webp', alt: 'Jamaah Elfifa berpakaian ihram berfoto bersama', size: 'wide' },
        { src: U('1580418827493-f2b22c0a76cb', 700), alt: 'Ka’bah di tengah jamaah dengan latar menara Abraj Al-Bait', size: 'wide' },
        { src: U('1542816417-0983c9c9ad53', 700), alt: 'Mushaf Al-Qur’an bersampul biru', size: 'wide' },
      ],
    },
  },
  {
    key: 'home.register',
    page: 'Beranda',
    title: 'Bagian pendaftaran',
    description: 'Teks di samping formulir pendaftaran beranda.',
    preview: '/#daftar',
    fields: [t('eyebrow', 'Label kecil', 60), t('title', 'Judul', 100), ta('description', 'Deskripsi', 400)],
    defaults: {
      eyebrow: 'Pendaftaran online',
      title: 'Satu langkah kecil menuju Baitullah.',
      description: 'Isi formulir singkat ini. Kode pendaftaran langsung terbit, dan tim kami menghubungi Anda melalui WhatsApp pada jam kerja untuk konfirmasi.',
    },
  },

  /* ============================ KBIHU ============================ */
  {
    key: 'kbihu.hero',
    page: 'KBIHU',
    title: 'Hero KBIHU',
    description: 'Judul, paragraf pembuka, dan foto di bagian atas halaman KBIHU.',
    preview: '/kbihu',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('titleLead', 'Judul — awal', 80),
      t('titleAccent', 'Judul — kata miring', 40),
      t('titleTail', 'Judul — akhir', 80),
      ta('lead', 'Paragraf pembuka', 400, 4),
      img('image', 'Foto'),
      t('imageAlt', 'Deskripsi foto', 160),
      t('captionEyebrow', 'Label pada foto', 60),
      t('caption', 'Keterangan pada foto', 100),
    ],
    defaults: {
      eyebrow: 'Lembaga Bimbingan Resmi',
      titleLead: 'Membimbing dengan Ilmu,',
      titleAccent: 'Mengantarkan',
      titleTail: 'Menuju Mabrur.',
      lead: 'Lembaga bimbingan ibadah Haji dan Umrah resmi dengan kurikulum sesuai sunnah dan pendampingan intensif dari tanah air hingga ke Tanah Suci.',
      image: '/images/manasik-hero.webp',
      imageAlt: 'Jamaah mengikuti pembelajaran manasik',
      captionEyebrow: 'Belajar sebelum berangkat',
      caption: 'Perjalanan yang dimulai dengan ilmu.',
    },
  },
  {
    key: 'kbihu.curriculum',
    page: 'KBIHU',
    title: 'Kurikulum',
    description: 'Tahapan bimbingan KBIHU.',
    preview: '/kbihu#kurikulum',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('title', 'Judul', 100),
      ta('description', 'Deskripsi', 300),
      { type: 'list', key: 'items', label: 'Tahapan', itemLabel: 'Tahap', min: 1, max: 6, fields: [t('title', 'Judul', 60), ta('description', 'Isi', 300, 2)] },
    ],
    defaults: {
      eyebrow: 'Kurikulum kami',
      title: 'Tahapan Bimbingan KBIHU',
      description: 'Kami menyiapkan jamaah dengan ilmu yang benar, praktik yang terarah, dan pendampingan yang menenangkan.',
      items: [
        { title: 'Pemahaman Fiqih', description: 'Memahami rukun, wajib, sunnah, dan adab ibadah dengan landasan ilmu yang kuat.' },
        { title: 'Praktik Manasik', description: 'Menyempurnakan kesiapan melalui simulasi tawaf, sa’i, wukuf, dan rangkaian ibadah lainnya.' },
        { title: 'Pendampingan Penuh', description: 'Ustaz dan tim mendampingi jamaah dengan sepenuh perhatian selama di Haramain.' },
      ],
    },
  },
  {
    key: 'kbihu.asatidz',
    page: 'KBIHU',
    title: 'Para pembimbing (asatidz)',
    description: 'Daftar pembimbing beserta foto. Tanpa foto, inisial nama yang ditampilkan.',
    preview: '/kbihu#asatidz',
    fields: [
      t('eyebrow', 'Label kecil', 60),
      t('title', 'Judul', 100),
      {
        type: 'list',
        key: 'people',
        label: 'Pembimbing',
        itemLabel: 'Pembimbing',
        min: 1,
        max: 12,
        fields: [
          t('name', 'Nama & gelar', 80),
          t('role', 'Peran', 60),
          { type: 'text', key: 'badge', label: 'Lencana (opsional)', max: 40, optional: true, hint: 'cth. Tersertifikasi Kemenag' },
          { type: 'image', key: 'photo', label: 'Foto (opsional)', optional: true },
        ],
      },
    ],
    defaults: {
      eyebrow: 'Para pembimbing',
      title: 'Dibimbing oleh Asatidz Berpengalaman',
      people: [
        { name: 'Ust. H. Abdullah, Lc., M.A.', role: 'Pembimbing Utama', badge: 'Tersertifikasi Kemenag', photo: '' },
        { name: 'Ustazah Fathimah, Lc.', role: 'Pembimbing Manasik', badge: 'Tersertifikasi Kemenag', photo: '' },
        { name: 'Ust. H. Rasyid, M.A.', role: 'Pembimbing Fiqih', badge: 'Tersertifikasi Kemenag', photo: '' },
      ],
    },
  },
  {
    key: 'kbihu.register',
    page: 'KBIHU',
    title: 'Bagian pendaftaran KBIHU',
    description: 'Teks di samping formulir pendaftaran bimbingan.',
    preview: '/kbihu#daftar',
    fields: [t('eyebrow', 'Label kecil', 60), t('title', 'Judul', 100), ta('description', 'Deskripsi', 400)],
    defaults: {
      eyebrow: 'Langkah pertama perjalanan Anda',
      title: 'Siapkan ibadah terbaik bersama kami.',
      description: 'Pendaftaran bimbingan Haji dan Umrah gelombang berikutnya telah dibuka. Mari belajar dan berangkat dengan tenang.',
    },
  },

  /* ============================ LEGAL ============================ */
  {
    key: 'legal.privacy',
    page: 'Legal',
    title: 'Kebijakan Privasi',
    description: 'Isi halaman Kebijakan Privasi. Sebaiknya ditinjau penasihat hukum sebelum diubah.',
    preview: '/kebijakan-privasi',
    fields: [t('updated', 'Tanggal pembaruan', 40), { type: 'markdown', key: 'body', label: 'Isi', max: 20000, hint: PRIVACY_TOKENS_HINT }],
    defaults: {
      updated: '25 November 2026',
      body: `Kebijakan ini menjelaskan bagaimana **{{nama_badan_usaha}}** (“kami”) memproses data pribadi Anda saat menggunakan website ini, mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.

## Data yang kami kumpulkan

- Data yang Anda isi pada formulir pendaftaran: nama lengkap, nomor WhatsApp, email, kota domisili, jumlah jamaah, status paspor, dan catatan.
- Riwayat pembayaran yang kami catat setelah Anda melakukan transfer.
- Data teknis terbatas untuk keamanan, seperti alamat IP, yang digunakan untuk mencegah penyalahgunaan formulir.

Kami tidak meminta salinan dokumen identitas melalui website ini. Dokumen diminta terpisah oleh tim kami melalui kanal resmi.

## Tujuan penggunaan

- Memproses pendaftaran, menghubungi Anda, dan mengurus kelengkapan perjalanan atau bimbingan ibadah.
- Mencatat dan menampilkan status serta riwayat pembayaran kepada Anda.
- Memenuhi kewajiban hukum dan administrasi penyelenggaraan ibadah umrah dan haji.

Kami tidak menjual data pribadi Anda dan tidak menggunakannya untuk iklan pihak ketiga.

## Pembagian data

Data hanya dibagikan sejauh diperlukan untuk penyelenggaraan perjalanan, misalnya kepada maskapai, penyedia visa, hotel, dan instansi pemerintah terkait, atau bila diwajibkan oleh peraturan perundang-undangan.

## Keamanan & penyimpanan

Data disimpan pada basis data dengan akses terbatas hanya untuk staf yang berwenang, dan setiap perubahan data oleh staf tercatat dalam log audit. Data disimpan selama diperlukan untuk tujuan di atas dan kewajiban administrasi, dan Anda dapat meminta penghapusannya kapan saja melalui kontak di bawah.

## Hak Anda

Sesuai UU PDP, Anda berhak untuk:

- mengakses dan memperoleh salinan data pribadi Anda;
- memperbaiki data yang tidak akurat;
- meminta penghapusan data, sepanjang tidak bertentangan dengan kewajiban hukum kami;
- menarik kembali persetujuan pemrosesan data.

## Hubungi kami

Untuk pertanyaan atau permintaan terkait data pribadi, hubungi kami melalui email **{{email}}**, WhatsApp **{{telepon}}**, atau datang ke kantor kami di {{alamat}}.`,
    },
  },
  {
    key: 'legal.terms',
    page: 'Legal',
    title: 'Syarat & Ketentuan',
    description: 'Isi halaman Syarat & Ketentuan. Sebaiknya ditinjau penasihat hukum sebelum diubah.',
    preview: '/syarat-ketentuan',
    fields: [t('updated', 'Tanggal pembaruan', 40), { type: 'markdown', key: 'body', label: 'Isi', max: 20000, hint: PRIVACY_TOKENS_HINT }],
    defaults: {
      updated: '25 November 2026',
      body: `Dengan mendaftar melalui website ini, Anda menyetujui ketentuan berikut. Ketentuan rinci untuk setiap program dituangkan dalam perjanjian tertulis yang Anda terima dari **{{nama_badan_usaha}}** saat konfirmasi pendaftaran; bila terdapat perbedaan, perjanjian tertulis tersebut yang berlaku.

## Pendaftaran

- Pendaftaran online bersifat pemesanan awal. Kursi dinyatakan terkunci setelah uang muka diterima dan dicatat oleh tim kami.
- Data yang diisi harus benar dan sesuai dokumen resmi (KTP/paspor). Kesalahan data dapat menghambat pengurusan visa dan tiket.
- Kode pendaftaran bersifat pribadi. Jangan membagikannya bersama nomor WhatsApp Anda kepada pihak lain.

## Harga & pembayaran

- Harga yang tercantum adalah per jamaah dan dapat berubah mengikuti regulasi penerbangan, kebijakan pemerintah, dan kurs mata uang sebelum pelunasan.
- Pembayaran hanya sah bila ditransfer ke rekening resmi atas nama perusahaan: **{{rekening}}**.
- Kami tidak pernah meminta transfer ke rekening pribadi. Laporkan kepada kami bila menerima permintaan semacam itu.
- Status pembayaran dapat dipantau pada halaman Cek Status setelah dicatat oleh tim kami.

## Pembatalan & pengembalian dana

Pembatalan diajukan secara tertulis. Besaran pengembalian dana mengikuti perjanjian program dan memperhitungkan biaya yang telah dibayarkan kepada pihak ketiga (misalnya tiket pesawat, visa, dan hotel) yang tidak dapat dikembalikan.

## Perubahan jadwal

Jadwal keberangkatan, maskapai, atau hotel dapat berubah karena keadaan di luar kendali kami, seperti kebijakan otoritas Arab Saudi, maskapai, atau kondisi kahar. Setiap perubahan akan kami informasikan sesegera mungkin beserta alternatif yang setara.

## Kontak

Pertanyaan mengenai ketentuan ini dapat disampaikan melalui **{{email}}** atau WhatsApp **{{telepon}}**.`,
    },
  },
]

export const BLOCK_KEYS = BLOCKS.map((b) => b.key)
export const getBlockDef = (key: string) => BLOCKS.find((b) => b.key === key)

/* ---- Tipe nilai per blok (dipakai halaman publik) ---- */
type Item = Record<string, string>
export type BlockValue = Record<string, string | Item[]>
