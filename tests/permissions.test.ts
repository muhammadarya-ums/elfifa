import { describe, expect, it } from 'vitest'
import { can } from '@/lib/permissions'

describe('matriks izin', () => {
  it('staf hanya bisa menindaklanjuti pendaftaran', () => {
    expect(can('staff', 'registration.view')).toBe(true)
    expect(can('staff', 'registration.edit')).toBe(true)
    expect(can('staff', 'registration.delete')).toBe(false)
    expect(can('staff', 'payment.manage')).toBe(false)
    expect(can('staff', 'export')).toBe(false)
    expect(can('staff', 'settings.manage')).toBe(false)
  })

  it('admin mengelola operasional, bukan akun & pengaturan', () => {
    expect(can('admin', 'payment.manage')).toBe(true)
    expect(can('admin', 'catalog.manage')).toBe(true)
    expect(can('admin', 'admins.manage')).toBe(false)
    expect(can('admin', 'audit.view')).toBe(false)
  })

  it('pemilik memiliki semua akses', () => {
    for (const p of ['registration.delete', 'payment.manage', 'settings.manage', 'admins.manage', 'audit.view'] as const) {
      expect(can('owner', p)).toBe(true)
    }
  })
})
