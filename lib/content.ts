import 'server-only'

import { and, desc, eq, inArray, lt } from 'drizzle-orm'
import { cache } from 'react'
import { z } from 'zod'
import { BLOCKS, getBlockDef, isAllowedImageUrl, type BlockDef, type Field, type ScalarField } from './content-def'
import { getDb, schema } from './db'

const KEEP_REVISIONS = 30

/* ============================ VALIDASI (dari definisi) ============================ */

function scalarSchema(f: ScalarField) {
  switch (f.type) {
    case 'text':
    case 'textarea':
    case 'markdown': {
      const base = z.string().trim().max(f.max, `Maksimal ${f.max} karakter`)
      return 'optional' in f && f.optional ? base : base.min(1, 'Wajib diisi')
    }
    case 'image': {
      const base = z.string().trim().refine((v) => v === '' || isAllowedImageUrl(v), 'Gambar harus dari pustaka media')
      return f.optional ? base : base.refine((v) => v !== '', 'Pilih gambar')
    }
    case 'select':
      return z.enum(f.options.map((o) => o.value) as [string, ...string[]])
  }
}

function fieldSchema(f: Field) {
  if (f.type !== 'list') return scalarSchema(f)
  const item = z.object(Object.fromEntries(f.fields.map((sf) => [sf.key, scalarSchema(sf)])))
  return z.array(item).min(f.min, `Minimal ${f.min} ${f.itemLabel.toLowerCase()}`).max(f.max, `Maksimal ${f.max} ${f.itemLabel.toLowerCase()}`)
}

export function blockSchema(def: BlockDef) {
  return z.object(Object.fromEntries(def.fields.map((f) => [f.key, fieldSchema(f)]))).strict()
}

/** Ubah path error Zod menjadi label yang dimengerti admin, cth. "Pilar #2 › Judul". */
export function describeIssuePath(def: BlockDef, path: PropertyKey[]) {
  const [k, idx, sub] = path
  const f = def.fields.find((x) => x.key === k)
  if (!f) return String(k ?? '')
  if (f.type !== 'list' || idx === undefined) return f.label
  const sf = f.fields.find((x) => x.key === sub)
  return `${f.itemLabel} #${Number(idx) + 1}${sf ? ` › ${sf.label}` : ''}`
}

/* ============================ AKSES NILAI ============================ */

type Item = Record<string, string>

export class Content {
  constructor(private data: Record<string, unknown>) {}
  /** Teks (selalu string, aman untuk dirender — React meng-escape otomatis) */
  s(key: string): string {
    const v = this.data[key]
    return typeof v === 'string' ? v : ''
  }
  list(key: string): Item[] {
    const v = this.data[key]
    return Array.isArray(v) ? (v as Item[]) : []
  }
  raw() {
    return this.data
  }
}

function parseStored(def: BlockDef, json: string | undefined) {
  if (!json) return def.defaults
  try {
    const parsed = blockSchema(def).safeParse(JSON.parse(json))
    // Data rusak/tidak valid → pakai default, situs tidak pernah error karena konten
    return parsed.success ? parsed.data : def.defaults
  } catch {
    return def.defaults
  }
}

/** Ambil beberapa blok sekaligus (satu query). */
export const getBlocks = cache(async (...keys: string[]) => {
  const db = await getDb()
  const rows = await db.select().from(schema.contentBlocks).where(inArray(schema.contentBlocks.key, keys))
  const map = new Map(rows.map((r) => [r.key, r.value]))
  return Object.fromEntries(
    keys.map((k) => {
      const def = getBlockDef(k)
      if (!def) throw new Error(`Blok konten tidak dikenal: ${k}`)
      return [k, new Content(parseStored(def, map.get(k)))]
    }),
  ) as Record<string, Content>
})

export async function getBlockForEdit(key: string) {
  const def = getBlockDef(key)
  if (!def) return null
  const db = await getDb()
  const row = await db.select().from(schema.contentBlocks).where(eq(schema.contentBlocks.key, key)).get()
  return { def, value: parseStored(def, row?.value), updatedAt: row?.updatedAt ?? null, updatedBy: row?.updatedBy ?? '', customized: !!row }
}

export async function listBlockStatus() {
  const db = await getDb()
  const rows = await db
    .select({ key: schema.contentBlocks.key, updatedAt: schema.contentBlocks.updatedAt, updatedBy: schema.contentBlocks.updatedBy })
    .from(schema.contentBlocks)
  const map = new Map(rows.map((r) => [r.key, r]))
  return BLOCKS.map((b) => ({ def: b, row: map.get(b.key) ?? null }))
}

/* ============================ SIMPAN & VERSI ============================ */

/** Simpan blok; versi sebelumnya otomatis masuk riwayat. */
export async function writeBlock(key: string, value: unknown, actor: string) {
  const db = await getDb()
  await db.transaction(async (tx) => {
    const current = await tx.select().from(schema.contentBlocks).where(eq(schema.contentBlocks.key, key)).get()
    const def = getBlockDef(key)!
    await tx.insert(schema.contentRevisions).values({
      key,
      value: current?.value ?? JSON.stringify(def.defaults),
      actor: current?.updatedBy || 'default',
    })
    const json = JSON.stringify(value)
    await tx
      .insert(schema.contentBlocks)
      .values({ key, value: json, updatedBy: actor, updatedAt: new Date() })
      .onConflictDoUpdate({ target: schema.contentBlocks.key, set: { value: json, updatedBy: actor, updatedAt: new Date() } })

    // Simpan hanya N versi terakhir per blok
    const old = await tx
      .select({ id: schema.contentRevisions.id })
      .from(schema.contentRevisions)
      .where(eq(schema.contentRevisions.key, key))
      .orderBy(desc(schema.contentRevisions.id))
      .limit(1)
      .offset(KEEP_REVISIONS)
      .get()
    if (old) await tx.delete(schema.contentRevisions).where(and(eq(schema.contentRevisions.key, key), lt(schema.contentRevisions.id, old.id + 1)))
  })
}

export async function listRevisions(key: string) {
  const db = await getDb()
  return db
    .select({ id: schema.contentRevisions.id, actor: schema.contentRevisions.actor, createdAt: schema.contentRevisions.createdAt })
    .from(schema.contentRevisions)
    .where(eq(schema.contentRevisions.key, key))
    .orderBy(desc(schema.contentRevisions.id))
    .limit(KEEP_REVISIONS)
}

export async function getRevision(id: number) {
  const db = await getDb()
  return db.select().from(schema.contentRevisions).where(eq(schema.contentRevisions.id, id)).get()
}

/** Ganti token {{...}} di teks legal dengan data dari Pengaturan. */
export function fillTokens(text: string, tokens: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (m, k: string) => tokens[k] ?? m)
}
