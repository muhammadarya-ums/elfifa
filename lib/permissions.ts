import type { AdminRole } from './db/schema'

/**
 * Matriks hak akses per peran. Satu-satunya sumber kebenaran untuk otorisasi:
 * dipakai di server action, halaman admin, dan untuk menyembunyikan menu.
 */
const MATRIX = {
  'registration.view': ['owner', 'admin', 'staff'],
  'registration.edit': ['owner', 'admin', 'staff'],
  'registration.delete': ['owner', 'admin'],
  'payment.manage': ['owner', 'admin'],
  'export': ['owner', 'admin'],
  'catalog.manage': ['owner', 'admin'],
  'content.manage': ['owner', 'admin'],
  'settings.manage': ['owner'],
  'admins.manage': ['owner'],
  'audit.view': ['owner'],
} as const satisfies Record<string, readonly AdminRole[]>

export type Permission = keyof typeof MATRIX

export function can(role: AdminRole, permission: Permission) {
  return (MATRIX[permission] as readonly AdminRole[]).includes(role)
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Pemilik',
  admin: 'Admin',
  staff: 'Staf',
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  owner: 'Akses penuh, termasuk akun admin, pengaturan, dan audit log.',
  admin: 'Kelola pendaftaran, pembayaran, paket, jadwal, dan konten.',
  staff: 'Lihat & tindak lanjuti pendaftaran (status, catatan). Tanpa keuangan dan hapus data.',
}
