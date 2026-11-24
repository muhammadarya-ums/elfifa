/**
 * Definisi pengaturan situs yang bisa diubah dari panel admin.
 * Nilai default di sini dipakai saat database pertama kali dibuat.
 */
export const SETTING_GROUPS = [
  {
    id: 'travel',
    title: 'Elfifa Travel Umroh',
    fields: [
      { key: 'travel_whatsapp', label: 'Nomor WhatsApp', hint: 'Format 62xxxxxxxxxx (tanpa +, spasi, atau tanda hubung)', default: '628123456789' },
      { key: 'travel_phone', label: 'Telepon (tampilan)', default: '+62 812-3456-789' },
      { key: 'travel_email', label: 'Email', default: 'halo@elfifa.id' },
      { key: 'travel_address', label: 'Alamat kantor', default: 'Jl. Raya Jemursari No. 42, Surabaya, Jawa Timur' },
      { key: 'travel_bank', label: 'Rekening pembayaran', hint: 'Ditampilkan ke jamaah di halaman Cek Status', default: 'Bank Syariah Indonesia (BSI) 1234567890 a.n. PT Elfifa Travel' },
      { key: 'travel_instagram', label: 'URL Instagram', default: 'https://www.instagram.com/' },
      { key: 'travel_facebook', label: 'URL Facebook', default: 'https://www.facebook.com/' },
      { key: 'travel_youtube', label: 'URL YouTube', default: 'https://www.youtube.com/' },
    ],
  },
  {
    id: 'kbihu',
    title: 'KBIHU Elfifa',
    fields: [
      { key: 'kbihu_whatsapp', label: 'Nomor WhatsApp', hint: 'Format 62xxxxxxxxxx', default: '628123456789' },
      { key: 'kbihu_phone', label: 'Telepon (tampilan)', default: '+62 812-3456-789' },
      { key: 'kbihu_email', label: 'Email', default: 'sekretariat@kbihuelfifa.id' },
      { key: 'kbihu_address', label: 'Alamat sekretariat', default: 'Jl. Kemakmuran No. 18, Bekasi Selatan' },
      { key: 'kbihu_office_hours', label: 'Jam layanan', default: 'Senin – Jumat, 08.00 – 16.00 WIB' },
      { key: 'kbihu_season', label: 'Label gelombang', hint: 'Tampil di atas tabel jadwal manasik', default: 'Gelombang Haji 1448 H' },
      { key: 'kbihu_instagram', label: 'URL Instagram', default: 'https://www.instagram.com/' },
      { key: 'kbihu_facebook', label: 'URL Facebook', default: 'https://www.facebook.com/' },
    ],
  },
] as const

type Field = (typeof SETTING_GROUPS)[number]['fields'][number]
export type SettingKey = Field['key']
export type SiteSettings = Record<SettingKey, string>

export const SETTING_KEYS = SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key)) as SettingKey[]

export const DEFAULT_SETTINGS = Object.fromEntries(
  SETTING_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.default])),
) as SiteSettings
