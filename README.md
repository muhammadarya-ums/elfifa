# Elfifa — Travel Umroh & KBIHU

Website dan sistem operasional untuk **Elfifa Travel Umroh** dan **KBIHU Elfifa**: katalog paket, pendaftaran online, portal status jamaah, dan panel admin dengan hak akses per peran.

Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Drizzle ORM · libSQL (SQLite lokal / Turso di produksi) · Vitest

---

## Fitur

### Website publik
| Halaman | Isi |
|---|---|
| `/` | Beranda: paket dari database (unggulan + daftar), sisa kursi real-time, layanan, alur perjalanan, profil & video, testimoni, galeri, FAQ, formulir pendaftaran |
| `/paket/[slug]` | Detail paket: hotel, fasilitas, bonus, harga, kuota, formulir — dengan data terstruktur (schema.org) |
| `/kbihu` (atau domain `kbihu-elfifa.*`) | Kurikulum, asatidz, jadwal manasik (otomatis menyembunyikan yang lewat), FAQ, pendaftaran bimbingan |
| `/cek-status` | Jamaah memantau status, progres & riwayat pembayaran dengan kode + nomor WhatsApp |
| `/kebijakan-privasi`, `/syarat-ketentuan` | Halaman legal (mengacu UU No. 27/2022 tentang PDP) |

### Panel admin (`/admin`)
- **Dashboard** — pendaftar baru, dana masuk, piutang, kuota per paket, jadwal terdekat
- **Pendaftaran** — cari & filter, input manual, status, catatan internal, ekspor CSV (aman dari formula injection)
- **Pembayaran** — catat DP/pelunasan; status naik otomatis ke *DP diterima* / *Lunas*
- **Paket, Jadwal, Testimoni & FAQ** — kelola konten tanpa ubah kode
- **Pengaturan** — identitas brand (nama badan usaha, izin PPIU, tagline, statistik), kontak, rekening, media sosial
- **Akses tim** — multi-admin dengan peran, nonaktifkan akun, minimal satu Pemilik selalu tersisa
- **Log audit** — seluruh aktivitas admin tercatat (siapa, apa, kapan, IP)

### Peran & hak akses
| | Pemilik | Admin | Staf |
|---|:-:|:-:|:-:|
| Lihat & tindak lanjuti pendaftaran (status, catatan) | ✓ | ✓ | ✓ |
| Pembayaran, ubah tagihan, ekspor CSV, hapus pendaftaran | ✓ | ✓ | |
| Paket, jadwal, testimoni & FAQ | ✓ | ✓ | |
| Pengaturan, akun admin, log audit | ✓ | | |

Matriks ini didefinisikan di satu tempat (`lib/permissions.ts`) dan ditegakkan di **setiap** server action, halaman, dan API — bukan hanya disembunyikan dari menu.

---

## Keamanan

- **Autentikasi** — password scrypt + salt; sesi cookie `HttpOnly`, `SameSite=Lax`, prefix `__Host-` di produksi, ditandatangani HMAC-SHA256, berlaku 12 jam
- **Pencabutan sesi** — logout, ganti password, atau perubahan peran/status langsung mengeluarkan akun dari semua perangkat
- **Anti brute-force** — akun terkunci 15 menit setelah 5 kali gagal; batas per IP; waktu respons konstan (anti user-enumeration)
- **Rate limit berbasis database** — atomik (satu UPSERT), berlaku lintas instance serverless; dipakai untuk login, pendaftaran, dan cek status
- **Content-Security-Policy dengan nonce per request** (`proxy.ts`) + `strict-dynamic`; HSTS, `X-Frame-Options: DENY`, COOP, Permissions-Policy, `poweredByHeader` dimatikan
- **Validasi** semua input dengan Zod di server; honeypot anti-bot; persetujuan privasi wajib & tercatat (`consent_at`)
- **Panel admin** `no-store` & `noindex`; ekspor CSV dinetralkan dari formula injection

## Menjalankan secara lokal

```bash
pnpm install
pnpm dev
```

Buka http://localhost:3000. Database SQLite dibuat otomatis di `data/elfifa.db` beserta data contoh (2 paket, 3 jadwal, 6 FAQ).

Login admin di http://localhost:3000/admin dengan **`admin@elfifa.id` / `admin12345`** (hanya mode development, saat belum ada admin). Segera ganti password di **Akun Saya**.

## Pengujian

```bash
pnpm typecheck   # TypeScript strict
pnpm test        # Vitest: format, izin, password, rate limit (termasuk konkurensi), migrasi & seed
pnpm build
```

CI GitHub Actions (`.github/workflows/ci.yml`) menjalankan ketiganya pada setiap push & pull request.

## Deploy ke Vercel

1. **Database Turso** (gratis): Vercel → *Storage* → *Marketplace* → **Turso** → hubungkan ke project (mengisi `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN` otomatis), atau buat manual di https://turso.tech dan isi `DATABASE_URL` + `DATABASE_AUTH_TOKEN`.
2. **Environment Variables** (lihat `.env.example`):
   | Variabel | Wajib | Keterangan |
   |---|---|---|
   | `DATABASE_URL` + `DATABASE_AUTH_TOKEN` | ✅ (atau `TURSO_*`) | Koneksi Turso/libSQL |
   | `AUTH_SECRET` | ✅ | ≥ 32 karakter acak: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | ✅ untuk login pertama | Akun Pemilik pertama dibuat otomatis saat login pertama |
3. **Deploy.** Migrasi & data awal berjalan otomatis pada request pertama.
4. Pantau kesehatan aplikasi di `/api/health` (cocok untuk uptime monitor).

### Checklist sebelum go-live
- [ ] Login, ganti password Pemilik, buat akun untuk tim dengan peran yang sesuai
- [ ] **Pengaturan**: isi nama badan usaha, **nomor izin PPIU**, tahun pengalaman, nomor WhatsApp, alamat, rekening resmi, tautan media sosial
- [ ] Ganti/hapus paket & jadwal contoh dengan data asli; periksa FAQ
- [ ] Tambahkan testimoni asli (dengan izin jamaah) — bagian testimoni tersembunyi sampai ada yang terbit
- [ ] Tinjau **Kebijakan Privasi** dan **Syarat & Ketentuan** bersama penasihat hukum
- [ ] Hubungkan domain beserta domain KBIHU (`kbihu-elfifa.*` / `kbihu.*`)

### Dua domain
`proxy.ts` mengarahkan host berawalan `kbihu-elfifa.` atau `kbihu.` ke halaman KBIHU. Rute `/admin`, `/cek-status`, `/paket`, dan halaman legal dapat diakses dari kedua domain.

## Struktur

```
app/
  page.tsx                 Beranda (menyusun components/home/*)
  paket/[slug]/            Detail paket
  kbihu/                   Halaman KBIHU
  cek-status/              Portal status jamaah
  kebijakan-privasi/, syarat-ketentuan/
  admin/                   Login + (panel)/* — setiap halaman memeriksa izinnya sendiri
  api/admin/export/        Ekspor CSV
  api/health/              Health check
  actions/public.ts        Pendaftaran & cek status
  actions/admin.ts         Aksi admin (izin + audit di setiap aksi)
components/
  site/                    Header, footer, primitives desain (brand tokens)
  home/                    Section beranda
  admin/                   Komponen panel admin
lib/
  db/                      Skema, koneksi (auto-migrate), seed bertahap
  auth.ts                  Password, sesi, rate limit
  permissions.ts           Matriks hak akses
  audit.ts                 Log audit
  settings-def.ts          Daftar pengaturan & default
drizzle/                   File migrasi SQL
proxy.ts                   CSP nonce + routing multi-domain
tests/                     Vitest
```

### Sistem desain
Token warna di `app/globals.css` diturunkan dari logo: **brand** (teal), **gold** (emas), **sand** (netral hangat), **ink** (teks). Tipografi: Fraunces (display, optical size) + Plus Jakarta Sans (teks). Motif khas: bingkai lengkung `arch` (mihrab).

### Mengubah skema database
1. Ubah `lib/db/schema.ts`
2. `pnpm db:generate` → file migrasi baru di `drizzle/`
3. Commit. Migrasi berjalan otomatis saat aplikasi start.

`pnpm db:studio` membuka Drizzle Studio untuk melihat data.
