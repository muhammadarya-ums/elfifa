import { count } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getDb, schema } from '@/lib/db'
import { seedDefaults } from '@/lib/db/seed-data'

describe('migrasi & seed', () => {
  it('membuat skema dan data awal', async () => {
    const db = await getDb()
    const [{ n: pkgs }] = await db.select({ n: count() }).from(schema.packages)
    const [{ n: faqs }] = await db.select({ n: count() }).from(schema.faqs)
    expect(pkgs).toBe(2)
    expect(faqs).toBe(6)
  })

  it('seed bersifat idempoten (aman dijalankan berulang)', async () => {
    const db = await getDb()
    await seedDefaults(db)
    await seedDefaults(db)
    const [{ n: pkgs }] = await db.select({ n: count() }).from(schema.packages)
    const [{ n: sched }] = await db.select({ n: count() }).from(schema.schedules)
    expect(pkgs).toBe(2)
    expect(sched).toBe(3)
  })

  it('data yang dihapus admin tidak muncul kembali', async () => {
    const db = await getDb()
    await db.delete(schema.faqs)
    await seedDefaults(db)
    const [{ n }] = await db.select({ n: count() }).from(schema.faqs)
    expect(n).toBe(0)
  })
})
