# Elfifa — Travel Umroh & KBIHU

Website + sistem pendaftaran untuk **Elfifa Travel Umroh** dan **KBIHU Elfifa**, dibangun dengan Next.js 16, Tailwind CSS 4, Drizzle ORM, dan libSQL (SQLite / Turso).

## Fitur

**Website publik**
- Beranda travel (`/`) — paket umroh dari database, paket unggulan, sisa kursi real-time, galeri, video profil.
- Detail paket (`/paket/[slug]`) — hotel, fasilitas, bonus, harga, form pendaftaran, data terstruktur SEO.
- Halaman KBIHU (`/kbihu`, atau domain `kbihu-elfifa.*`) — kurikulum, asatidz, jadwal manasik (otomatis menyembunyikan yang sudah lewat), form pendaftaran bimbingan.
- **Pendaftaran online** dengan kode unik (`ELF-XXXXXX` / `KBH-XXXXXX`), validasi, anti-spam (honeypot + rate limit), cek kuota, dan tombol konfirmasi WhatsApp.
- **Cek status** (`/cek-status`) — jamaah melihat status, progres pembayaran, dan info rekening dengan kode + nomor WhatsApp.

**Panel admin (`/admin`)**
- Dashboard: pendaftar baru, dana masuk, piutang, kuota per paket, jadwal terdekat.
- Pendaftaran: cari & filter, ubah status, catatan internal, input manual, hapus, **ekspor CSV** (siap dibuka di Excel).
- Pembayaran: catat DP/pelunasan, sisa tagihan otomatis, status naik otomatis ke *DP diterima* / *Lunas*.
- Paket umroh: tambah/edit/nonaktifkan, paket unggulan, kuota, hotel, fasilitas, bonus.
- Jadwal manasik: tambah/edit/hapus, draft.
- Pengaturan: nomor WhatsApp, telepon, email, alamat, rekening, media sosial — **tanpa ubah kode**.
- Akun admin: multi-admin, ganti password, logout mencabut semua sesi.

## Menjalankan secara lokal

```bash
pnpm install
pnpm dev
```

Buka http://localhost:3000. Database SQLite dibuat otomatis di `data/elfifa.db` beserta data contoh (2 paket, 3 jadwal).

Login admin di http://localhost:3000/admin dengan **`admin@elfifa.id` / `admin12345`** (hanya di mode development, saat belum ada admin). Segera ganti password di menu Pengaturan.

Halaman KBIHU lokal: http://localhost:3000/kbihu

## Deploy ke Vercel

1. **Buat database Turso** (gratis):
   - Paling mudah: Vercel → Project → *Storage* → *Marketplace* → **Turso** → hubungkan ke project. Variabel `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` otomatis terisi.
   - Atau manual di https://turso.tech, lalu isi `DATABASE_URL` dan `DATABASE_AUTH_TOKEN`.
2. **Isi Environment Variables** (lihat `.env.example`):
   | Variabel | Wajib | Keterangan |
   |---|---|---|
   | `DATABASE_URL` + `DATABASE_AUTH_TOKEN` | ✅ (atau versi `TURSO_*`) | Koneksi Turso/libSQL |
   | `AUTH_SECRET` | ✅ | String acak ≥ 32 karakter: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | ✅ untuk login pertama | Akun admin pertama dibuat otomatis saat login pertama |
3. **Deploy.** Tabel database dibuat otomatis (auto-migrate) pada request pertama, beserta data contoh.
4. Login ke `/admin`, ganti password, lalu sesuaikan **Pengaturan**, **Paket**, dan **Jadwal**.

### Dua domain
`proxy.ts` mengarahkan domain yang berawalan `kbihu-elfifa.` atau `kbihu.` ke halaman KBIHU. Tambahkan kedua domain (mis. `elfifa.vercel.app` dan `kbihu-elfifa.vercel.app`) ke project Vercel yang sama. Rute `/admin`, `/cek-status`, dan `/paket` dapat diakses dari kedua domain.

## Struktur

```
app/
  page.tsx                 Beranda travel
  paket/[slug]/            Detail paket
  kbihu/                   Halaman KBIHU
  cek-status/              Portal cek status jamaah
  admin/                   Panel admin (login + (panel)/*)
  api/admin/export/        Ekspor CSV
  actions/public.ts        Server action pendaftaran & cek status
  actions/admin.ts         Server action admin (semua memeriksa sesi)
lib/
  db/schema.ts             Skema database
  db/index.ts              Koneksi + auto-migrate + seed
  db/seed-data.ts          Data awal
  auth.ts                  Password (scrypt), sesi (cookie HMAC), rate limit
  data.ts                  Query publik
  admin-queries.ts         Query admin
  settings-def.ts          Daftar pengaturan & nilai default
drizzle/                   File migrasi SQL
```

## Mengubah skema database

1. Ubah `lib/db/schema.ts`
2. `pnpm db:generate` → membuat file migrasi baru di `drizzle/`
3. Commit file migrasi. Migrasi dijalankan otomatis saat aplikasi start.

`pnpm db:studio` membuka Drizzle Studio untuk melihat/mengedit data secara langsung.

## Catatan

- Rate limit form disimpan di memori per instance server — cukup untuk menahan spam ringan, bukan pengganti WAF.
- Foto galeri dan video masih statis di `public/`. Ganti file tersebut untuk memperbarui.
- Nama asatidz di halaman KBIHU masih statis di `app/kbihu/page.tsx`.
