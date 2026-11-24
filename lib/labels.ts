import type { Program, RegistrationStatus } from './db/schema'

export const PROGRAM_LABELS: Record<Program, string> = {
  umroh: 'Umroh (Elfifa Travel)',
  kbihu_haji: 'Bimbingan Haji (KBIHU)',
  kbihu_umrah: 'Bimbingan Umrah (KBIHU)',
}

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  baru: 'Baru',
  dihubungi: 'Sudah dihubungi',
  dp: 'DP diterima',
  lunas: 'Lunas',
  berangkat: 'Berangkat',
  selesai: 'Selesai',
  batal: 'Batal',
}

/** Penjelasan status untuk jamaah di halaman Cek Status */
export const STATUS_DESCRIPTIONS: Record<RegistrationStatus, string> = {
  baru: 'Pendaftaran Anda sudah kami terima. Tim kami akan segera menghubungi Anda melalui WhatsApp.',
  dihubungi: 'Tim kami sudah menghubungi Anda. Silakan lengkapi dokumen dan lakukan pembayaran uang muka.',
  dp: 'Uang muka sudah kami terima. Silakan lunasi sisa pembayaran sesuai jadwal.',
  lunas: 'Pembayaran sudah lunas. Kami akan mengabarkan jadwal manasik dan keberangkatan.',
  berangkat: 'Semoga perjalanan ibadah Anda lancar dan mabrur.',
  selesai: 'Program telah selesai. Terima kasih telah mempercayakan ibadah Anda kepada kami.',
  batal: 'Pendaftaran ini dibatalkan. Hubungi kami bila ada pertanyaan.',
}

export const STATUS_STYLES: Record<RegistrationStatus, string> = {
  baru: 'bg-sky-50 text-sky-700 ring-sky-200',
  dihubungi: 'bg-violet-50 text-violet-700 ring-violet-200',
  dp: 'bg-amber-50 text-amber-800 ring-amber-200',
  lunas: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  berangkat: 'bg-teal-50 text-teal-700 ring-teal-200',
  selesai: 'bg-slate-100 text-slate-700 ring-slate-200',
  batal: 'bg-rose-50 text-rose-700 ring-rose-200',
}

/** Status yang tidak menghitung kursi terpakai */
export const INACTIVE_STATUSES: RegistrationStatus[] = ['batal']
