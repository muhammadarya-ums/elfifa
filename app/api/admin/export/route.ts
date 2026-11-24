import { getCurrentAdmin } from '@/lib/auth'
import { exportRegistrations, parseFilters } from '@/lib/admin-queries'
import { displayPhone, formatDateTimeIso, todayIso } from '@/lib/format'
import { PROGRAM_LABELS, STATUS_LABELS } from '@/lib/labels'

export const dynamic = 'force-dynamic'

function csvCell(value: unknown) {
  let s = value === null || value === undefined ? '' : String(value)
  // Cegah CSV/formula injection saat dibuka di Excel / Google Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  if (!(await getCurrentAdmin())) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const filters = parseFilters(Object.fromEntries(url.searchParams))
  const rows = await exportRegistrations(filters)

  const header = [
    'Kode', 'Tanggal Daftar', 'Nama', 'WhatsApp', 'Email', 'Kota', 'Program', 'Paket', 'Jumlah Jamaah',
    'Paspor', 'Status', 'Total Tagihan', 'Sudah Dibayar', 'Sisa', 'Pesan', 'Catatan Admin', 'Sumber',
  ]
  const lines = rows.map(({ reg, packageName, paid }) => {
    const paidNum = Number(paid)
    return [
      reg.code,
      formatDateTimeIso(reg.createdAt),
      reg.fullName,
      displayPhone(reg.phone),
      reg.email,
      reg.city,
      PROGRAM_LABELS[reg.program],
      packageName ?? '',
      reg.pax,
      reg.hasPassport ? 'Ya' : 'Belum',
      STATUS_LABELS[reg.status],
      reg.totalPriceIdr,
      paidNum,
      Math.max(0, reg.totalPriceIdr - paidNum),
      reg.message,
      reg.adminNotes,
      reg.source,
    ]
      .map(csvCell)
      .join(',')
  })

  // BOM agar Excel membaca UTF-8 dengan benar
  const body = '﻿' + [header.map(csvCell).join(','), ...lines].join('\r\n')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pendaftaran-elfifa-${todayIso()}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
