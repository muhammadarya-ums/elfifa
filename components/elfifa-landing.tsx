'use client';

import {
  ArrowDown,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ExternalLink,
  Hotel,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Pause,
  Phone,
  Plane,
  Play,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  UserRound,
  Users,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ElementType, type SVGProps } from 'react';
import RegistrationForm from '@/components/registration-form';
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YoutubeIcon } from '@/components/social-icons';
import type { PackageWithSeats } from '@/lib/data';
import { formatDate, formatJuta, formatRupiah, splitLines, waLink } from '@/lib/format';
import type { SiteSettings } from '@/lib/settings-def';
import { CUSTOM_KBIHU_URL, CUSTOM_MAIN_HOST, KBIHU_URL } from '@/lib/site-config';

/* ==================== STATIC CONTENT ==================== */

const facilities: [ElementType, string][] = [
  [PackageCheck, 'Perlengkapan'],
  [QrCode, 'Visa Umroh'],
  [Ticket, 'Tiket PP Confirmed'],
  [UserRound, 'Mutawwif Sesuai Sunnah'],
  [Utensils, 'Konsumsi 3x Sehari'],
  [Hotel, 'Hotel Dekat Masjid'],
  [BusIcon, 'Bus AC Executive'],
  [Video, "Dokumentasi Syar'i"],
];

const galleryData = [
  { id: 'galeri-1', src: '/galeri/jamaah1.webp', alt: 'Jamaah di Masjidil Haram Makkah' },
  { id: 'galeri-2', src: '/galeri/jamaah2.webp', alt: 'Kebersamaan Jamaah Elfifa' },
  { id: 'galeri-3', src: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80', alt: "Arsitektur Pelataran Ka'bah" },
  { id: 'galeri-4', src: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80', alt: 'Suasana Pelaksanaan Umroh' },
  { id: 'galeri-5', src: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80', alt: 'Masjid Nabawi Madinah' },
  { id: 'galeri-6', src: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=800&q=80', alt: 'Pelataran Kota Suci' },
  { id: 'galeri-7', src: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=800&q=80', alt: 'Ziarah & Silaturahmi Jamaah' },
  { id: 'galeri-8', src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80', alt: 'Momen Khusyuk Ibadah' },
];

const navItems = [
  ['Beranda', '#beranda'],
  ['Paket', '#paket'],
  ['Fasilitas', '#fasilitas'],
  ['Profil', '#profil'],
  ['Galeri', '#galeri'],
  ['Pendaftaran', '#daftar'],
] as const;

/* ==================== ICONS ==================== */

function MosqueIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'size-6'} aria-hidden="true" {...props}>
      <path d="M12 2C11.4 2 11 2.4 11 3V5.1C8.2 5.6 6 8 6 11V15H4V17H20V15H18V11C18 8 15.8 5.6 13 5.1V3C13 2.4 12.6 2 12 2ZM12 7C14.2 7 16 8.8 16 11V15H8V11C8 8.8 9.8 7 12 7ZM10 19H14V22H10V19ZM4 7V13H2V7H4ZM22 7V13H20V7H22Z" />
    </svg>
  );
}

function BusIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className || 'size-5'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 17h14" />
      <path d="M6 17V7.5C6 5.6 7.6 4 9.5 4h5C16.4 4 18 5.6 18 7.5V17" />
      <path d="M6 9h12" />
      <path d="M8 20h2" />
      <path d="M14 20h2" />
      <circle cx="8.5" cy="17.5" r="1.2" />
      <circle cx="15.5" cy="17.5" r="1.2" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex text-[#d9923b]" aria-label={`Bintang ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="size-4 fill-current" />
      ))}
    </div>
  );
}

function SeatsBadge({ seatsLeft, quota }: { seatsLeft: number; quota: number }) {
  if (seatsLeft === 0) return <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">Kuota penuh</span>;
  const low = seatsLeft <= Math.max(5, Math.round(quota * 0.2));
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
      Sisa {seatsLeft} kursi
    </span>
  );
}

/* ==================== MAIN COMPONENT ==================== */

type Props = {
  settings: SiteSettings;
  packages: PackageWithSeats[];
};

export default function ElfifaLanding({ settings, packages }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [kbihuTargetUrl, setKbihuTargetUrl] = useState('/kbihu');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const featured = packages[0];
  const others = packages.slice(1);
  const waUrl = waLink(
    settings.travel_whatsapp,
    featured
      ? `Assalamu'alaikum Elfifa, saya ingin konsultasi mengenai ${featured.name}.`
      : "Assalamu'alaikum Elfifa, saya ingin konsultasi mengenai paket umroh.",
  );

  // Tentukan URL portal KBIHU sesuai domain yang sedang dibuka
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.endsWith(CUSTOM_MAIN_HOST)) setKbihuTargetUrl(CUSTOM_KBIHU_URL);
    else if (hostname.endsWith('vercel.app')) setKbihuTargetUrl(KBIHU_URL);
    else setKbihuTargetUrl('/kbihu');
  }, []);

  // Bayangan navbar saat halaman discroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup menu mobile dengan tombol Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Putar video otomatis saat terlihat di layar, jeda saat keluar layar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setAutoplayBlocked(true));
        else video.pause();
      },
      { threshold: 0.5 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
    } else {
      video.pause();
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-800 selection:bg-[#d9923b]/20 selection:text-[#007a82]">
      {/* ==================== KBIHU BAR ==================== */}
      <div className="bg-gradient-to-r from-slate-900 via-[#007a82] to-slate-900 px-4 py-2 text-xs font-medium text-white shadow-inner">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="hidden rounded bg-[#d9923b] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-950 sm:inline-block">
              Portal Terintegrasi
            </span>
            <p className="truncate text-slate-200">Mencari Kelompok Bimbingan Ibadah Haji &amp; Umroh?</p>
          </div>
          <a
            href={kbihuTargetUrl}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#007a82]"
          >
            <Building2 className="size-3.5 text-[#d9923b] transition-colors group-hover:text-[#007a82]" />
            <span>Kunjungi KBIHU Elfifa</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* ==================== NAVBAR ==================== */}
      <nav
        className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'border-b border-slate-100 shadow-md' : ''
        }`}
        aria-label="Navigasi utama"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#beranda" className="flex flex-shrink-0 items-center gap-2" aria-label="Elfifa, beranda">
            <img src="/logo-sm.png" alt="Elfifa Travel Umroh" width={333} height={160} className="h-10 w-auto object-contain sm:h-12" />
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="font-medium text-slate-600 transition-colors hover:text-[#007a82]">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/cek-status"
              className="flex items-center gap-1.5 rounded-full border border-[#007a82]/30 bg-[#007a82]/5 px-4 py-2 text-xs font-bold text-[#007a82] transition-all hover:bg-[#007a82] hover:text-white"
            >
              <Search className="size-4" />
              Cek Status
            </a>
            <a
              href="#daftar"
              className="rounded-full bg-[#d9923b] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#d9923b]/30 transition-all hover:-translate-y-0.5 hover:bg-[#b57930] hover:shadow-lg"
            >
              Daftar Sekarang
            </a>
          </div>

          <button
            type="button"
            className="rounded-lg p-1 text-[#007a82] focus-visible:ring-2 focus-visible:ring-[#007a82]/40 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl lg:hidden">
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-slate-50 py-3 text-sm font-semibold text-slate-600 last:border-0"
              >
                {label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2 pt-2">
              <a
                href="/cek-status"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#007a82] bg-[#007a82]/5 py-2.5 text-center text-sm font-bold text-[#007a82]"
              >
                <Search className="size-4" />
                Cek Status Pendaftaran
              </a>
              <a
                href={kbihuTargetUrl}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-600"
              >
                <Building2 className="size-4" />
                Portal KBIHU Elfifa
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#d9923b] py-3 text-center text-sm font-bold text-white shadow-md"
              >
                <WhatsAppIcon className="size-4" /> Konsultasi via WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ==================== HERO ==================== */}
        <section
          id="beranda"
          className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pb-20 pt-24 lg:min-h-[88vh] lg:pt-28"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#007a82]/95 via-[#007a82]/85 to-slate-900/90 mix-blend-multiply" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-md sm:text-sm">
              <span className="inline-block size-2 animate-ping rounded-full bg-[#d9923b]" />
              {featured?.departureDate ? `Keberangkatan ${formatDate(featured.departureDate)}` : 'Update Keberangkatan Musim Ini'}
            </div>

            {featured ? (
              <>
                <h1 className="text-balance text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-[5.5rem]">
                  Umroh <span className="text-[#d9923b]">{featured.durationDays} Hari</span>
                </h1>
                {featured.tagline && (
                  <p className="mt-3 text-2xl font-light text-slate-200 drop-shadow-md sm:text-3xl md:text-4xl">{featured.tagline}</p>
                )}
              </>
            ) : (
              <h1 className="text-balance text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-6xl">
                Umroh <span className="text-[#d9923b]">Praktis</span> Full Service
              </h1>
            )}

            <p className="mx-auto mt-6 max-w-2xl text-balance text-base font-light leading-relaxed text-slate-100 drop-shadow sm:text-lg">
              Perjalanan Ibadah <strong className="font-semibold text-white">Lebih Khusyuk &amp; Lebih Nyaman</strong> bersama Elfifa Travel.
              Rasakan kemudahan ibadah tanah suci dengan pelayanan full service terpercaya.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#paket"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d9923b] px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,146,59,0.4)] transition-all hover:-translate-y-1 hover:bg-[#b57930] sm:w-auto sm:text-lg"
              >
                Lihat Paket Promo
                <ArrowDown className="size-5" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto sm:text-lg"
              >
                <WhatsAppIcon className="size-5 text-green-400" />
                Konsultasi Gratis
              </a>
            </div>
          </div>

          <div className="absolute bottom-0 z-10 w-full overflow-hidden leading-none">
            <svg className="block h-[40px] w-full md:h-[70px]" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,151.71,130.64,228.9,120,265.8,114.86,299.72,106.18,321.39,56.44Z"
                className="fill-slate-50"
              />
            </svg>
          </div>
        </section>

        {/* ==================== PROFIL & VIDEO ==================== */}
        <section id="profil" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">Profil Elfifa Travel</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Lebih dari Sekadar Perjalanan, Ini Tentang Kekhusyukan Ibadah.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                Kami memahami bahwa ibadah Umroh adalah impian spiritual yang mulia. Elfifa hadir memastikan perjalanan Anda di Tanah Suci
                berlangsung lancar, tenang, dan berkesan tanpa beban teknis.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {[
                  { title: 'Pembimbing (Mutawwif) Berilmu & Ramah', desc: 'Sesuai dengan petunjuk sunnah untuk membimbing keabsahan ibadah.' },
                  { title: 'Akomodasi Hotel Premium & Strategis', desc: 'Jarak dekat ke pelataran Masjidil Haram & Masjid Nabawi.' },
                  { title: 'Izin Resmi Kemenag RI', desc: 'Jaminan keamanan, kenyamanan, dan kepastian jadwal penerbangan.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10 text-[#007a82]">
                      <Check className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800">{item.title}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:ml-auto lg:mr-0">
              <div className="absolute -left-6 -top-6 size-40 rounded-full bg-[#d9923b]/20 blur-3xl" />
              <div className="absolute -bottom-8 -right-8 size-48 rounded-full bg-[#007a82]/20 blur-3xl" />

              <div
                role="button"
                tabIndex={0}
                aria-label={isPlaying ? 'Jeda video pemberangkatan jamaah' : 'Putar video pemberangkatan jamaah'}
                aria-pressed={isPlaying}
                className="group relative z-10 cursor-pointer overflow-hidden rounded-[2.5rem] border-8 border-white bg-slate-900 shadow-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#d9923b]/50"
                onClick={togglePlay}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePlay();
                  }
                }}
              >
                <video
                  ref={videoRef}
                  src="/pemberangkatan-umrah.mp4#t=0.1"
                  preload="metadata"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loop
                  muted
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

                {!isPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-[2px] transition-all duration-300">
                    <span
                      aria-hidden="true"
                      className="flex size-20 items-center justify-center rounded-full bg-[#d9923b] text-white shadow-[0_0_30px_rgba(217,146,59,0.5)] transition-transform group-hover:scale-110"
                    >
                      <Play className="ml-1 size-8 fill-current" />
                    </span>
                    {autoplayBlocked && (
                      <span className="mt-4 rounded-full bg-slate-900/80 px-4 py-1 text-xs font-medium text-white backdrop-blur-md">
                        Klik untuk memutar video
                      </span>
                    )}
                  </div>
                )}

                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex size-16 items-center justify-center rounded-full bg-slate-900/50 text-white backdrop-blur-md">
                      <Pause className="size-6 fill-current" />
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-center rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#007a82]/10 text-[#007a82]">
                      <Video className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Pemberangkatan Jamaah Elfifa</p>
                      <p className="text-xs font-medium text-slate-500">Dokumentasi Perjalanan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-6 top-1/4 z-20 hidden rounded-2xl bg-white p-4 shadow-xl md:block">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-[#d9923b]">10+</span>
                  <p className="text-xs font-bold uppercase leading-tight text-slate-500">
                    Tahun
                    <br />
                    Pengalaman
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PAKET ==================== */}
        <section id="paket" className="bg-[#f8fcfb] px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="text-3xl font-bold text-[#007a82] md:text-4xl">{featured ? 'Detail Paket Spesial' : 'Paket Umroh'}</h2>
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#d9923b]" />
            </div>

            {featured ? <FeaturedPackage pkg={featured} /> : <EmptyPackages waUrl={waUrl} />}

            {others.length > 0 && (
              <div className="mt-16">
                <h3 className="mb-6 text-2xl font-bold text-slate-900">Pilihan Paket Lainnya</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {others.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto mt-8 max-w-4xl rounded-r-xl border-l-4 border-amber-400 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-start">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p className="ml-3 text-xs text-amber-900 sm:text-sm">
                  <strong>Catatan:</strong> Harga &amp; jadwal penerbangan sewaktu-waktu dapat disesuaikan mengikuti regulasi penerbangan dan
                  fluktuasi kurs mata uang.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FASILITAS ==================== */}
        <section id="fasilitas" className="relative overflow-hidden bg-white px-5 py-24 lg:px-8">
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <span className="mb-3 block text-sm font-bold uppercase tracking-widest text-[#d9923b]">Layanan Terpadu</span>
              <h2 className="mb-5 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Fasilitas Selama Perjalanan</h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
                Seluruh kebutuhan perjalanan ibadah Anda telah kami siapkan secara menyeluruh.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {facilities.map(([Icon, label]) => (
                <div
                  key={label}
                  className="group relative flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-7 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#007a82]/20 hover:shadow-xl"
                >
                  <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#007a82]/10 text-[#007a82] transition-all duration-300 group-hover:bg-[#007a82] group-hover:text-white">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="relative z-10 text-sm font-bold text-slate-700 transition-colors duration-300 group-hover:text-[#007a82] sm:text-base">
                    {label}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== GALERI ==================== */}
        <section id="galeri" className="bg-slate-100 px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">Dokumentasi</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Galeri Kebersamaan Jamaah</h2>
              </div>
              <a
                href={settings.travel_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1 text-sm font-bold text-[#007a82] sm:flex"
              >
                Lihat di Instagram <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryData.map((item) => (
                <div key={item.id} className="group aspect-square overflow-hidden rounded-2xl bg-slate-200">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="size-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PENDAFTARAN ==================== */}
        <section id="daftar" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">Pendaftaran Online</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Amankan Kursi Anda Sekarang
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Isi formulir singkat ini, tim kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi dokumen dan pembayaran.
              </p>
              <ol className="mt-8 space-y-5">
                {[
                  ['Isi formulir', 'Data singkat calon jamaah & paket pilihan.'],
                  ['Dapatkan kode pendaftaran', 'Gunakan untuk mengecek status kapan saja.'],
                  ['Konfirmasi & pembayaran DP', 'Tim kami memandu kelengkapan dokumen.'],
                ].map(([title, desc], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#007a82] text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{title}</p>
                      <p className="text-sm text-slate-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a href="/cek-status" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#007a82] hover:underline">
                <Search className="size-4" /> Sudah mendaftar? Cek status pendaftaran
              </a>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 shadow-xl shadow-slate-200/50 sm:p-10">
              {packages.length > 0 ? (
                <RegistrationForm
                  variant="umroh"
                  packages={packages.map((p) => ({
                    slug: p.slug,
                    label: `${p.name}${p.departureDate ? ` (${formatDate(p.departureDate, { day: 'numeric', month: 'short', year: 'numeric' })})` : ''} — Rp ${formatJuta(p.priceIdr)} Jt`,
                    seatsLeft: p.seatsLeft,
                  }))}
                />
              ) : (
                <EmptyPackages waUrl={waUrl} />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 px-5 pb-6 pt-16 text-slate-300 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.3fr_.7fr_1fr]">
            <div>
              <div className="mb-5 inline-flex items-center rounded-xl bg-white p-2">
                <img src="/logo-sm.png" alt="Elfifa Travel Umroh" width={333} height={160} loading="lazy" className="h-8 w-auto object-contain sm:h-10" />
              </div>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-400">
                Penyedia layanan perjalanan Umroh praktis full service terpercaya, memastikan kenyamanan dan kelancaran ibadah Anda di Tanah Suci.
              </p>
              <div className="flex gap-4">
                <a href={settings.travel_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram Elfifa" className="text-slate-400 transition-colors hover:text-white">
                  <InstagramIcon className="size-5" />
                </a>
                <a href={settings.travel_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook Elfifa" className="text-slate-400 transition-colors hover:text-white">
                  <FacebookIcon className="size-5" />
                </a>
                <a href={settings.travel_youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube Elfifa" className="text-slate-400 transition-colors hover:text-white">
                  <YoutubeIcon className="size-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-bold text-white">Navigasi</h3>
              <div className="flex flex-col gap-3 text-sm">
                <a href="#paket" className="hover:text-white">Paket Umroh</a>
                <a href="#daftar" className="hover:text-white">Pendaftaran Online</a>
                <a href="/cek-status" className="hover:text-white">Cek Status Pendaftaran</a>
                <a href={kbihuTargetUrl} className="font-semibold text-[#d9923b] hover:underline">
                  Portal KBIHU Elfifa ➔
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-bold text-white">Hubungi Kami</h3>
              <div className="flex flex-col gap-4 text-sm">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#2bb3ba]" />
                  {settings.travel_address}
                </p>
                <a href={waLink(settings.travel_whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone className="size-4 shrink-0 text-[#2bb3ba]" />
                  {settings.travel_phone}
                </a>
                <a href={`mailto:${settings.travel_email}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="size-4 shrink-0 text-[#2bb3ba]" />
                  {settings.travel_email}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-slate-800 pt-8 text-center text-xs text-slate-500 sm:text-sm">
            © {new Date().getFullYear()} Elfifa Travel Umroh &amp; KBIHU. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ==================== FLOATING WHATSAPP ==================== */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform duration-300 hover:scale-110"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </div>
  );
}

/* ==================== PACKAGE SECTIONS ==================== */

function FeaturedPackage({ pkg }: { pkg: PackageWithSeats }) {
  const bonuses = splitLines(pkg.bonuses);
  return (
    <div className="grid overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl md:grid-cols-[1.2fr_.8fr]">
      <div className="p-8 md:p-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-bold text-slate-800 md:text-3xl">{pkg.name}</h3>
          <SeatsBadge seatsLeft={pkg.seatsLeft} quota={pkg.quota} />
        </div>

        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {pkg.departureDate && (
            <span className="flex items-center gap-2"><CalendarDays className="size-4 text-[#007a82]" /> {formatDate(pkg.departureDate)}</span>
          )}
          {pkg.airline && (
            <span className="flex items-center gap-2"><Plane className="size-4 text-[#007a82]" /> {pkg.airline}</span>
          )}
          <span className="flex items-center gap-2"><Users className="size-4 text-[#007a82]" /> Kuota {pkg.quota} jamaah</span>
        </div>

        <div className="mb-8 space-y-6">
          {pkg.hotelMakkah && (
            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10">
                <Hotel className="size-6 text-[#007a82]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  {pkg.hotelMakkah} <span className="text-sm font-normal text-slate-500">({pkg.hotelMakkahNights} Hari Makkah)</span>
                </h4>
                {pkg.hotelMakkahNote && <p className="mb-2 text-sm text-slate-600">{pkg.hotelMakkahNote}</p>}
                <Stars count={pkg.hotelMakkahStars} />
              </div>
            </div>
          )}
          {pkg.hotelMadinah && (
            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10">
                <MosqueIcon className="size-6 text-[#007a82]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  {pkg.hotelMadinah} <span className="text-sm font-normal text-slate-500">({pkg.hotelMadinahNights} Hari Madinah)</span>
                </h4>
                {pkg.hotelMadinahNote && <p className="mb-2 text-sm text-slate-600">{pkg.hotelMadinahNote}</p>}
                <Stars count={pkg.hotelMadinahStars} />
              </div>
            </div>
          )}
        </div>

        {bonuses.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-[#007a82] p-6 text-white shadow-lg">
            <div className="absolute -bottom-6 -right-6 opacity-10">
              <PackageCheck className="size-40" />
            </div>
            <h4 className="mb-4 text-lg font-bold text-[#f3b35f]">Spesial Bonus Free:</h4>
            <ul className="relative z-10 grid gap-3 sm:grid-cols-2">
              {bonuses.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                  <Check className="size-5 shrink-0 text-[#f3b35f]" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold">
                <Check className="mr-1 inline size-3.5" /> Full Service All In
              </span>
              <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold">
                <Ticket className="mr-1 inline size-3.5" /> Ticket Confirmed
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex flex-col justify-center bg-slate-900 p-8 text-white md:p-12">
        <div className="absolute inset-0 bg-[#007a82]/30 mix-blend-multiply" />
        <div className="relative z-10 text-center lg:text-left">
          <p className="mb-2 text-lg font-medium text-slate-300 md:text-xl">Investasi Akhirat</p>

          {pkg.originalPriceIdr && pkg.originalPriceIdr > pkg.priceIdr && (
            <div className="mb-2 flex items-center justify-center gap-3 lg:justify-start">
              <span className="text-2xl font-semibold text-slate-400 line-through decoration-red-500 decoration-4">
                Rp {formatJuta(pkg.originalPriceIdr)} Jt
              </span>
            </div>
          )}

          <div className="relative mb-6 inline-block">
            {pkg.originalPriceIdr && pkg.originalPriceIdr > pkg.priceIdr && (
              <span className="absolute -left-6 -top-4 rotate-[-12deg] rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                DISKON PROMO
              </span>
            )}
            <p className="text-5xl font-extrabold text-[#d9923b] drop-shadow-md sm:text-6xl md:text-7xl" aria-label={`Harga ${formatRupiah(pkg.priceIdr)}`}>
              <span className="mr-1 align-top text-3xl">Rp</span>
              {formatJuta(pkg.priceIdr)}
              <span className="ml-1 align-top text-2xl">Jt</span>
            </p>
          </div>

          <p className="mx-auto mb-8 max-w-xs text-xs italic text-slate-400 sm:text-sm lg:mx-0">
            *Per orang. Termasuk tiket pesawat PP, visa, hotel, mutawwif &amp; bus AC
          </p>

          <a
            href="#daftar"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9923b] py-4 text-lg font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-white hover:text-[#007a82]"
          >
            Amankan Seat Sekarang <ArrowRight className="size-5" />
          </a>
          <a href={`/paket/${pkg.slug}`} className="mt-4 block text-center text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline">
            Lihat detail lengkap paket
          </a>
        </div>
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: PackageWithSeats }) {
  return (
    <a
      href={`/paket/${pkg.slug}`}
      className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#007a82]/30 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#007a82]/10 px-3 py-1 text-xs font-bold text-[#007a82]">{pkg.durationDays} Hari</span>
        <SeatsBadge seatsLeft={pkg.seatsLeft} quota={pkg.quota} />
      </div>
      <h4 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-[#007a82]">{pkg.name}</h4>
      {pkg.departureDate && (
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays className="size-4" /> {formatDate(pkg.departureDate)}
        </p>
      )}
      <p className="mt-1 text-sm text-slate-500">
        {[pkg.hotelMakkah, pkg.hotelMadinah].filter(Boolean).join(' · ')}
      </p>
      <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
        <div>
          {pkg.originalPriceIdr && pkg.originalPriceIdr > pkg.priceIdr && (
            <p className="text-xs text-slate-400 line-through">{formatRupiah(pkg.originalPriceIdr)}</p>
          )}
          <p className="text-2xl font-extrabold text-[#d9923b]">{formatRupiah(pkg.priceIdr)}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-[#007a82] group-hover:text-white">
          <ArrowRight className="size-5" />
        </span>
      </div>
    </a>
  );
}

function EmptyPackages({ waUrl }: { waUrl: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-lg font-bold text-slate-800">Jadwal paket berikutnya segera dibuka</p>
      <p className="mt-2 text-sm text-slate-500">Hubungi kami untuk informasi keberangkatan terdekat dan daftar tunggu.</p>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
      >
        <WhatsAppIcon className="size-4" /> Tanya via WhatsApp
      </a>
    </div>
  );
}
