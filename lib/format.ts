const TZ = 'Asia/Jakarta'

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

/** 39900000 → "39,9" (dalam juta) */
export function formatJuta(value: number) {
  const juta = value / 1_000_000
  return juta.toLocaleString('id-ID', { maximumFractionDigits: 1 })
}

/** "2026-12-01" → "1 Desember 2026" */
export function formatDate(isoDate: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!isoDate) return '-'
  const d = new Date(`${isoDate}T00:00:00+07:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat('id-ID', { ...opts, timeZone: TZ }).format(d)
}

export function formatDateTime(date: Date | null | undefined) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  }).format(date)
}

/** "2026-11-25 02:07" dalam WIB (untuk ekspor) */
export function formatDateTimeIso(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}`
}

/** Tanggal hari ini di zona WIB, format YYYY-MM-DD */
export function todayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

/**
 * Normalisasi nomor HP Indonesia ke format 62xxxxxxxxxx.
 * "0812-3456 789" → "628123456789", "+62 812..." → "62812..."
 */
export function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  else if (digits.startsWith('8')) digits = `62${digits}`
  return digits
}

/** "628123456789" → "0812-3456-789" */
export function displayPhone(normalized: string) {
  const local = normalized.startsWith('62') ? `0${normalized.slice(2)}` : normalized
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3')
}

export function waLink(number: string, message?: string) {
  const base = `https://wa.me/${number.replace(/\D/g, '')}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function splitLines(text: string) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
