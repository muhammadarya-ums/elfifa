import 'server-only'

import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import * as schema from './schema'
import { seedDefaults } from './seed-data'

/**
 * Koneksi database.
 * - Lokal  : otomatis memakai file SQLite `data/elfifa.db` (tanpa setup).
 * - Vercel : wajib set DATABASE_URL (+ DATABASE_AUTH_TOKEN) ke Turso/libSQL.
 *            Integrasi Turso di Vercel Marketplace (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN) juga dikenali.
 */
function resolveConfig() {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN

  if (url) return { url, authToken }

  if (process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL belum di-set. Hubungkan database Turso/libSQL di Vercel (lihat README bagian Deploy).',
    )
  }

  const dir = path.join(process.cwd(), 'data')
  mkdirSync(dir, { recursive: true })
  return { url: `file:${path.join(dir, 'elfifa.db').replaceAll('\\', '/')}`, authToken: undefined }
}

function createDb() {
  const client = createClient(resolveConfig())
  return drizzle(client, { schema })
}

export type Db = ReturnType<typeof createDb>

const globalForDb = globalThis as unknown as {
  __elfifaDb?: Db
  __elfifaDbReady?: Promise<Db>
}

/**
 * Mengembalikan instance database yang sudah termigrasi.
 * Migrasi & data awal dijalankan sekali per proses (aman dipanggil berulang).
 */
export function getDb(): Promise<Db> {
  if (!globalForDb.__elfifaDbReady) {
    globalForDb.__elfifaDbReady = (async () => {
      const db = (globalForDb.__elfifaDb ??= createDb())
      await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
      await seedDefaults(db)
      return db
    })().catch((err) => {
      // Izinkan percobaan ulang pada request berikutnya
      globalForDb.__elfifaDbReady = undefined
      throw err
    })
  }
  return globalForDb.__elfifaDbReady
}

export { schema }
