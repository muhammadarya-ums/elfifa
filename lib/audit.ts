import 'server-only'

import { clientIp } from './auth'
import { getDb, schema } from './db'
import type { Admin } from './db/schema'

/**
 * Catat aksi admin ke audit log. Tidak pernah melempar error —
 * kegagalan pencatatan tidak boleh menggagalkan aksi utama.
 */
export async function audit(
  admin: Pick<Admin, 'id' | 'email'> | null,
  action: string,
  entity: { type: string; id?: string | number } | null,
  summary = '',
) {
  try {
    const db = await getDb()
    await db.insert(schema.auditLogs).values({
      adminId: admin?.id ?? null,
      actor: admin?.email ?? 'sistem',
      action,
      entityType: entity?.type ?? '',
      entityId: entity?.id !== undefined ? String(entity.id) : '',
      summary: summary.slice(0, 500),
      ip: await clientIp().catch(() => ''),
    })
  } catch (err) {
    console.error('[audit] gagal mencatat', action, err)
  }
}

export const AUDIT_LABELS: Record<string, string> = {
  'auth.login': 'Login',
  'auth.login_failed': 'Login gagal',
  'auth.locked': 'Akun terkunci sementara',
  'auth.logout': 'Logout',
  'auth.password_changed': 'Ganti password',
  'registration.create': 'Tambah pendaftaran',
  'registration.update': 'Ubah pendaftaran',
  'registration.status': 'Ubah status',
  'registration.delete': 'Hapus pendaftaran',
  'payment.create': 'Catat pembayaran',
  'payment.delete': 'Hapus pembayaran',
  'package.create': 'Tambah paket',
  'package.update': 'Ubah paket',
  'package.delete': 'Hapus paket',
  'package.deactivate': 'Nonaktifkan paket',
  'schedule.create': 'Tambah jadwal',
  'schedule.update': 'Ubah jadwal',
  'schedule.delete': 'Hapus jadwal',
  'testimonial.save': 'Simpan testimoni',
  'testimonial.delete': 'Hapus testimoni',
  'faq.save': 'Simpan FAQ',
  'faq.delete': 'Hapus FAQ',
  'settings.update': 'Ubah pengaturan',
  'admin.create': 'Tambah admin',
  'admin.update': 'Ubah admin',
  'admin.delete': 'Hapus admin',
  'export.csv': 'Ekspor CSV',
  'content.save': 'Ubah konten halaman',
  'content.restore': 'Pulihkan versi konten',
  'content.reset': 'Reset konten ke bawaan',
  'media.upload': 'Upload gambar',
  'media.delete': 'Hapus gambar',
  'auth.2fa_enabled': 'Aktifkan 2FA',
  'auth.2fa_disabled': 'Nonaktifkan 2FA',
  'auth.2fa_reset': 'Reset 2FA admin lain',
  'auth.2fa_failed': 'Kode 2FA salah',
  'auth.recovery_used': 'Login dengan kode cadangan',
}
