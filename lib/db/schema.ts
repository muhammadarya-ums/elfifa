import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}

/* ============================ ADMIN ============================ */

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  /** Naik setiap logout → semua sesi lama otomatis tidak berlaku */
  sessionVersion: integer('session_version').notNull().default(0),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp_ms' }),
  ...timestamps,
})

/* ============================ PAKET UMROH ============================ */

export const packages = sqliteTable(
  'packages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    tagline: text('tagline').notNull().default(''),
    description: text('description').notNull().default(''),
    durationDays: integer('duration_days').notNull(),
    /** Format YYYY-MM-DD, boleh kosong bila jadwal belum pasti */
    departureDate: text('departure_date'),
    airline: text('airline').notNull().default(''),
    priceIdr: integer('price_idr').notNull(),
    originalPriceIdr: integer('original_price_idr'),
    quota: integer('quota').notNull().default(45),
    hotelMakkah: text('hotel_makkah').notNull().default(''),
    hotelMakkahStars: integer('hotel_makkah_stars').notNull().default(3),
    hotelMakkahNights: integer('hotel_makkah_nights').notNull().default(0),
    hotelMakkahNote: text('hotel_makkah_note').notNull().default(''),
    hotelMadinah: text('hotel_madinah').notNull().default(''),
    hotelMadinahStars: integer('hotel_madinah_stars').notNull().default(3),
    hotelMadinahNights: integer('hotel_madinah_nights').notNull().default(0),
    hotelMadinahNote: text('hotel_madinah_note').notNull().default(''),
    /** Daftar item dipisah baris baru */
    includes: text('includes').notNull().default(''),
    bonuses: text('bonuses').notNull().default(''),
    isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex('packages_slug_idx').on(t.slug)],
)

/* ============================ PENDAFTARAN ============================ */

export const PROGRAMS = ['umroh', 'kbihu_haji', 'kbihu_umrah'] as const
export type Program = (typeof PROGRAMS)[number]

export const REGISTRATION_STATUSES = ['baru', 'dihubungi', 'dp', 'lunas', 'berangkat', 'selesai', 'batal'] as const
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

export const registrations = sqliteTable(
  'registrations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull(),
    program: text('program', { enum: PROGRAMS }).notNull(),
    packageId: integer('package_id').references(() => packages.id, { onDelete: 'set null' }),
    fullName: text('full_name').notNull(),
    /** Nomor dinormalisasi: 62xxxxxxxxxx */
    phone: text('phone').notNull(),
    email: text('email').notNull().default(''),
    city: text('city').notNull().default(''),
    pax: integer('pax').notNull().default(1),
    hasPassport: integer('has_passport', { mode: 'boolean' }).notNull().default(false),
    message: text('message').notNull().default(''),
    status: text('status', { enum: REGISTRATION_STATUSES }).notNull().default('baru'),
    /** Total tagihan (Rp). Diisi otomatis dari harga paket × pax, bisa diubah admin. */
    totalPriceIdr: integer('total_price_idr').notNull().default(0),
    adminNotes: text('admin_notes').notNull().default(''),
    source: text('source').notNull().default('website'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('registrations_code_idx').on(t.code),
    index('registrations_status_idx').on(t.status),
    index('registrations_created_idx').on(t.createdAt),
  ],
)

export const PAYMENT_METHODS = ['transfer', 'tunai', 'lainnya'] as const

export const payments = sqliteTable(
  'payments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    registrationId: integer('registration_id')
      .notNull()
      .references(() => registrations.id, { onDelete: 'cascade' }),
    amountIdr: integer('amount_idr').notNull(),
    /** YYYY-MM-DD */
    paidOn: text('paid_on').notNull(),
    method: text('method', { enum: PAYMENT_METHODS }).notNull().default('transfer'),
    note: text('note').notNull().default(''),
    createdAt: timestamps.createdAt,
  },
  (t) => [index('payments_registration_idx').on(t.registrationId)],
)

/* ============================ JADWAL MANASIK ============================ */

export const schedules = sqliteTable(
  'schedules',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** YYYY-MM-DD */
    date: text('date').notNull(),
    startTime: text('start_time').notNull().default('08:00'),
    endTime: text('end_time').notNull().default('11:30'),
    topic: text('topic').notNull(),
    location: text('location').notNull(),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (t) => [index('schedules_date_idx').on(t.date)],
)

/* ============================ PENGATURAN ============================ */

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export type Package = typeof packages.$inferSelect
export type NewPackage = typeof packages.$inferInsert
export type Registration = typeof registrations.$inferSelect
export type Payment = typeof payments.$inferSelect
export type Schedule = typeof schedules.$inferSelect
export type Admin = typeof admins.$inferSelect
