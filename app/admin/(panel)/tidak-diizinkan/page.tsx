import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { btnPrimary } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { ROLE_LABELS } from '@/lib/permissions'

export const metadata = { title: 'Akses dibatasi' }

export default async function ForbiddenPage() {
  const me = await requireAdmin()
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <ShieldAlert className="size-7" />
      </span>
      <h1 className="mt-5 text-xl font-bold text-slate-900">Akses dibatasi</h1>
      <p className="mt-2 text-sm text-slate-500">
        Peran Anda (<strong>{ROLE_LABELS[me.role]}</strong>) tidak memiliki izin untuk halaman atau aksi ini. Hubungi Pemilik bila Anda
        membutuhkan akses.
      </p>
      <Link href="/admin" className={`${btnPrimary} mt-6`}>Kembali ke dashboard</Link>
    </div>
  )
}
