"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Hotel,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Pause,
  Phone,
  Plane,
  Play,
  QrCode,
  ShieldCheck,
  Star,
  Ticket,
  UserRound,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import { useState, useEffect, useRef, type ElementType, type SVGProps } from 'react';

const teal = '#007a82';
const gold = '#d9923b';

// Menambahkan typing agar Icon dikenali dengan benar oleh TypeScript
const facilities: [ElementType, string][] = [
  [PackageCheck, 'Perlengkapan'],
  [QrCode, 'Visa'],
  [Ticket, 'Tiket PP'],
  [UserRound, 'Mutawwif'],
  [Utensils, 'Konsumsi'],
  [Hotel, 'Hotel'],
  [BusIcon, 'Bus AC'],
  [Video, 'Dokumentasi'],
];

// DATA GALERI: Ganti "src" dengan link gambar atau path lokal (contoh: "/images/foto1.jpg")
type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

const galleryData: GalleryItem[] = [
  {
    id: 'galeri-1',
    src: '/galeri/jamaah1.jpeg',
    alt: 'Masjidil Haram',
  },
  {
    id: 'galeri-2',
    src: '/galeri/jamaah2.jpeg',
    alt: 'Jamaah Elfifa',
  },
  {
    id: 'galeri-3',
    src: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    alt: 'Arsitektur Islam',
  },
  {
    id: 'galeri-4',
    src: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    alt: 'Perjalanan Ibadah',
  },
  {
    id: 'galeri-5',
    src: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
    alt: 'Madinah',
  },
  {
    id: 'galeri-6',
    src: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=800&q=80',
    alt: 'Kota Suci',
  },
  {
    id: 'galeri-7',
    src: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=800&q=80',
    alt: 'Kebersamaan',
  },
  {
    id: 'galeri-8',
    src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
    alt: 'Momen Berharga',
  },
];

const articles: [string, string, string, string, string][] = [
  [
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80',
    'Tips',
    '12 Des 2024',
    'Persiapan Fisik Sebelum Berangkat Umroh',
    'Bekali diri dengan persiapan yang matang agar ibadah berjalan lebih khusyuk dan nyaman.',
  ],
  [
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80',
    'Panduan',
    '08 Des 2024',
    'Panduan Memilih Paket Umroh Terbaik',
    'Kenali hal-hal penting yang perlu diperhatikan sebelum memilih travel umroh.',
  ],
  [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80',
    'Update',
    '01 Des 2024',
    'Keutamaan Bulan Rajab untuk Umroh',
    'Temukan keberkahan perjalanan spiritual di bulan yang penuh kemuliaan.',
  ],
];

/* ==================== CUSTOM ICONS ==================== */

// Komponen Logo yang sudah diupdate menggunakan image logo.png
function Logo() {
  return (
    <a
      href="#beranda"
      className="flex flex-shrink-0 items-center"
      aria-label="Elfifa home"
    >
      <img
        src="/logo.png"
        alt="Elfifa Umroh Praktis Full Service"
        className="h-10 w-auto object-contain sm:h-12 lg:h-14"
      />
    </a>
  );
}

function MosqueIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className || "size-6"} 
      {...props}
    >
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

function InstagramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className || 'size-4'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className || 'size-4'} fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10H8.2v3h2.6v8h2.7Z" />
    </svg>
  );
}

function YoutubeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className || 'size-4'} fill="currentColor" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.8V8.2l6.4 3.8-6.4 3.8Z" />
    </svg>
  );
}

export default function ElfifaLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // State & Ref untuk Autoplay Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Efek shadow navbar saat di-scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer untuk memutar video otomatis saat terlihat di layar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            // Coba memutar video unmuted
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                })
                .catch((error) => {
                  console.warn("Browser memblokir autoplay karena belum ada interaksi user:", error);
                  setIsPlaying(false);
                  setAutoplayBlocked(true); // Memunculkan tombol play manual
                });
            }
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // Video akan play jika 60% areanya masuk layar
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }
    }
  };

  const navItems = [
    ['Beranda', '#beranda'],
    ['Paket Promo', '#paket'],
    ['Fasilitas', '#fasilitas'],
    ['Profil', '#profil'],
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#d9923b]/20 selection:text-[#007a82]">
      
      {/* ==================== NAVBAR ==================== */}
      <nav
        className={`fixed top-0 z-50 w-full bg-white transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="font-medium text-slate-600 transition-colors hover:text-[#007a82]"
              >
                {label}
              </a>
            ))}
          </div>

          <a
            href="#paket"
            className="hidden rounded-full bg-[#d9923b] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#d9923b]/30 transition-all hover:-translate-y-0.5 hover:bg-[#b57930] hover:shadow-lg md:block"
          >
            Daftar Sekarang
          </a>

          <button
            className="text-[#007a82] focus:outline-none md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {menuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg md:hidden">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-slate-50 py-3 text-sm font-semibold text-slate-600 last:border-0"
              >
                {label}
              </a>
            ))}
            <a
              href="#paket"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block rounded-full bg-[#d9923b] py-3 text-center text-sm font-bold text-white shadow-md"
            >
              Daftar Sekarang
            </a>
          </div>
        )}
      </nav>

      <main>
        {/* ==================== HERO ==================== */}
        <section
          id="beranda"
          className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pb-20 pt-28 lg:min-h-[85vh] lg:pt-32"
        >
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              alt="Makkah Background"
              className="h-full w-full object-cover object-center"
            />
            {/* Teal Gradient Overlay dari desain HTML */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#007a82]/95 via-[#007a82]/80 to-[#007a82]/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {/* Badge Update */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-1.5 text-sm font-semibold tracking-wide text-white backdrop-blur-sm shadow-lg">
            Update 17 September 2026
            </div>

            {/* Typography */}
            <h1 className="text-balance text-5xl font-bold leading-tight text-white drop-shadow-xl md:text-6xl lg:text-[5.5rem]">
              Umroh <span className="text-[#d9923b]">17 Hari</span>
            </h1>
            <h2 className="mt-4 text-3xl font-light text-slate-200 drop-shadow-md md:text-4xl">
              Awal Musim Dingin
            </h2>
            
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg font-light leading-relaxed text-slate-100 drop-shadow">
              Perjalanan Ibadah <strong className="font-semibold text-white">Lebih Lama, Lebih Nyaman</strong> bersama Elfifa. Nikmati kemudahan beribadah dengan pelayanan full service kami.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#paket"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d9923b] px-8 py-3.5 text-lg font-bold text-white shadow-[0_4px_15px_rgba(217,146,59,0.4)] transition-all hover:-translate-y-1 hover:bg-[#b57930] sm:w-auto"
              >
                Lihat Paket Promo
                <ArrowDown className="size-5" />
              </a>

              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-8 py-3.5 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto"
              >
                <MessageCircle className="size-5 text-green-400" />
                Konsultasi Gratis
              </a>
            </div>
          </div>

          {/* SVG Shape Divider di bawah Hero (Mengikuti bentuk ombak HTML) */}
          <div className="absolute bottom-0 z-10 w-full overflow-hidden leading-none">
            <svg
              className="block h-[50px] w-full md:h-[80px]"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,151.71,130.64,228.9,120,265.8,114.86,299.72,106.18,321.39,56.44Z"
                className="fill-slate-50"
              ></path>
            </svg>
          </div>
        </section>

        {/* ==================== PROFIL (Redesigned Video Autoplay Layout) ==================== */}
        <section id="profil" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Kolom Kiri: Teks & Info */}
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">
                Tentang Kami
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Lebih dari Sekadar Perjalanan, Ini Tentang Kekhusyukan.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Kami memahami bahwa ibadah Umroh adalah momen spiritual yang sangat dinantikan. Oleh karena itu, Elfifa hadir untuk memastikan setiap detik ibadah Anda di Tanah Suci berjalan lancar, aman, dan nyaman tanpa perlu memikirkan urusan teknis.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {[
                  { title: 'Pembimbing (Mutawwif) Berpengalaman', desc: 'Dibimbing langsung oleh ustadz yang kompeten sesuai sunnah.' },
                  { title: 'Fasilitas Akomodasi Premium', desc: 'Lokasi hotel strategis, dekat dengan pelataran Masjidil Haram & Nabawi.' },
                  { title: 'Legalitas Resmi Terdaftar', desc: 'Perusahaan travel berizin resmi Kemenag RI, menjamin keamanan jamaah.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10 text-[#007a82]">
                      <Check className="size-5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Video Card with Autoplay Unmuted Logic */}
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto lg:mr-0">
              {/* Efek Blur dekoratif di belakang */}
              <div className="absolute -left-6 -top-6 size-40 rounded-full bg-[#d9923b]/20 blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 size-48 rounded-full bg-[#007a82]/20 blur-3xl"></div>
              
              {/* Video Card Container */}
              <div 
                className="group relative z-10 overflow-hidden rounded-[2.5rem] border-8 border-white bg-slate-900 shadow-2xl cursor-pointer"
                onClick={togglePlay}
              >
                {/* VIDEO ELEMENT: Unmuted by default, poster dari image yang dilampirkan */}
                <video
                  ref={videoRef}
                  src="/pemberangkatan-umrah.mp4" /* Placeholder video source */
                  poster="image_274300.jpg"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loop
                  playsInline
                />
                
                {/* Overlay transparan memudar ke bawah */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none" />

                {/* State: AutoPlay Blocked by Browser (Meminta aksi user) */}
                {(!isPlaying || autoplayBlocked) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-[2px] transition-all duration-300">
                    <button
                      className="flex size-20 items-center justify-center rounded-full bg-[#d9923b] text-white shadow-[0_0_30px_rgba(217,146,59,0.5)] transition-transform hover:scale-110"
                      aria-label="Putar video cerita jamaah"
                    >
                      <Play className="ml-1 size-8 fill-current" />
                    </button>
                    {autoplayBlocked && (
                      <span className="mt-4 rounded-full bg-slate-900/70 px-4 py-1 text-xs font-medium text-white backdrop-blur-md">
                        Klik untuk memutar suara
                      </span>
                    )}
                  </div>
                )}

                {/* State: Playing (Tampilkan ikon pause samar saat di-hover) */}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex size-16 items-center justify-center rounded-full bg-slate-900/50 text-white backdrop-blur-md">
                      <Pause className="size-6 fill-current" />
                    </div>
                  </div>
                )}

                {/* Info Box Floating di dalam video */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#007a82]/10 text-[#007a82]">
                      <Video className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Pemberangkatan Umrah Jamaah elfifa</p>
                      <p className="text-xs font-medium text-slate-500">Durasi: 0:52 Menit</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Badge Ekstra menonjol ke luar */}
              <div className="absolute -left-6 top-1/4 z-20 hidden rounded-2xl bg-white p-4 shadow-xl md:block">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-[#d9923b]">10+</span>
                  <p className="text-xs font-bold uppercase leading-tight text-slate-500">Tahun<br/>Pengalaman</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================== PAKET ==================== */}
        <section id="paket" className="bg-[#f8fcfb] px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="text-3xl font-bold text-[#007a82] md:text-4xl">Detail Paket Spesial</h2>
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#d9923b]"></div>
            </div>

            <div className="grid overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl md:grid-cols-[1.2fr_.8fr]">
              
              {/* Kiri: Akomodasi & Bonus */}
              <div className="p-8 md:p-12">
                <h3 className="mb-8 text-2xl font-bold text-slate-800 md:text-3xl">Akomodasi & Keunggulan</h3>
                
                {/* Hotel List */}
                <div className="mb-8 space-y-6">
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10">
                      <Hotel className="size-6 text-[#007a82]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Ghalib <span className="text-sm font-normal text-slate-500">(9 Hari di Makkah)</span></h4>
                      <p className="mb-2 text-sm text-slate-600"><i className="fa-solid fa-location-dot mr-1 text-[#d9923b]"></i> 250 meter dari Masjidil Haram</p>
                      <div className="flex text-[#d9923b]">
                        {[1,2,3].map(i => <Star key={i} className="size-4 fill-current" />)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10">
                      <MosqueIcon className="size-6 text-[#007a82]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Royal Andalus <span className="text-sm font-normal text-slate-500">(6 Hari di Madinah)</span></h4>
                      <p className="mb-2 text-sm text-slate-600"><i className="fa-solid fa-location-dot mr-1 text-[#d9923b]"></i> 0 meter dari Masjid Nabawi</p>
                      <div className="flex text-[#d9923b]">
                        {[1,2,3,4].map(i => <Star key={i} className="size-4 fill-current" />)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Freebies */}
                <div className="relative overflow-hidden rounded-2xl bg-[#007a82] p-6 text-white shadow-lg">
                  <div className="absolute -bottom-6 -right-6 opacity-10">
                    <PackageCheck className="size-40" />
                  </div>
                  <h4 className="mb-4 text-lg font-bold text-[#d9923b]">Spesial Bonus Free:</h4>
                  <ul className="relative z-10 grid gap-3 sm:grid-cols-2">
                    {['Percetakan Alquran', 'Jabal Magnet', 'Kuliner Arab', 'Ziarah Thaif', 'Albaik'].map(item => (
                      <li key={item} className="flex items-center gap-3 font-medium">
                        <Check className="size-5 text-[#d9923b]" /> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex gap-3">
                    <span className="rounded bg-white/20 px-3 py-1 text-sm font-medium"><Check className="mr-1 inline size-4" /> Paket All In</span>
                    <span className="rounded bg-white/20 px-3 py-1 text-sm font-medium"><Ticket className="mr-1 inline size-4" /> Ticket Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Kanan: Harga & CTA */}
              <div className="relative flex flex-col justify-center bg-[#007a82] p-8 text-white md:p-12">
                <div className="absolute inset-0 bg-slate-900/20 mix-blend-multiply" />
                <div className="relative z-10 text-center lg:text-left">
                  <p className="mb-2 text-xl font-medium text-slate-200 md:text-2xl">Biaya Hanya</p>
                  
                  <div className="mb-2 flex items-center justify-center gap-3 lg:justify-start">
                    <span className="text-2xl font-semibold text-slate-400 line-through decoration-red-500 decoration-4">Rp 42,9 Jt</span>
                  </div>

                  <div className="relative mb-6 inline-block">
                    <span className="absolute -left-6 -top-4 rotate-[-12deg] rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md sm:text-sm">
                      PROMO
                    </span>
                    <h2 className="text-6xl font-extrabold text-[#d9923b] drop-shadow-md md:text-7xl">
                      <span className="mr-1 align-top text-4xl">Rp</span>39,9<span className="ml-1 align-top text-3xl">Jt</span>
                    </h2>
                  </div>

                  <p className="mx-auto mb-8 max-w-xs text-xs italic text-slate-300 sm:text-sm lg:mx-0">
                    *termasuk biaya kenaikan tiket pesawat & kurs USD 18.000
                  </p>

                  <a
                    href="https://wa.me/628123456789"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9923b] py-4 text-xl font-bold text-white shadow-xl transition-transform hover:-translate-y-1 hover:bg-white hover:text-[#007a82]"
                  >
                    <MessageCircle className="size-6" /> Daftar Sekarang
                  </a>
                  <p className="mt-3 animate-pulse text-center text-sm font-semibold text-[#d9923b]">Seat Terbatas!</p>
                </div>
              </div>

            </div>

            <div className="mx-auto mt-8 max-w-4xl rounded-r-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-sm">
              <div className="flex items-start">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-yellow-500" />
                <p className="ml-3 text-sm text-yellow-800">
                  <strong>Perhatian:</strong> Harga & Jadwal dapat berubah sewaktu-waktu mengikuti kebijakan Hotel / Maskapai penerbangan serta nilai Kurs Dollar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FASILITAS ICONS ==================== */}
        <section id="fasilitas" className="relative overflow-hidden bg-white px-5 py-24 lg:px-8">
          {/* Dekorasi Background */}
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-50 to-transparent blur-3xl" />
          
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <span className="mb-3 block text-sm font-bold uppercase tracking-widest text-[#d9923b]">
                Kenyamanan Anda Prioritas Kami
              </span>
              <h2 className="mb-5 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Fasilitas & Layanan
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
                Kami memastikan setiap aspek perjalanan ibadah Anda tertangani dengan standar profesionalisme tinggi untuk kenyamanan maksimal.
              </p>
            </div>

            {/* Grid 4 Kolom */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {facilities.map(([Icon, label]) => (
                <div
                  key={label}
                  className="group relative flex flex-col items-center justify-center gap-5 rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-2 hover:border-[#007a82]/20 hover:shadow-[0_12px_30px_-8px_rgba(0,122,130,0.2)]"
                >
                  {/* Overlay gradien tipis saat di-hover */}
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-transparent to-[#007a82]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Icon Container */}
                  <div className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007a82]/10 to-[#007a82]/5 text-[#007a82] transition-all duration-300 group-hover:scale-110 group-hover:from-[#007a82] group-hover:to-[#085d63] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#007a82]/30">
                    <Icon className="size-8" />
                  </div>

                  {/* Label */}
                  <h3 className="relative z-10 text-base font-bold text-slate-700 transition-colors duration-300 group-hover:text-[#007a82] sm:text-lg">
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
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">
                  Momen Penuh Makna
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Galeri Kegiatan Jamaah
                </h2>
              </div>
              <a href="#kontak" className="hidden items-center gap-1 text-sm font-bold text-[#007a82] sm:flex">
                Lihat Galeri <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryData.map((item) => (
                <div key={item.id} className="group aspect-square overflow-hidden rounded-2xl">
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

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer id="kontak" className="bg-slate-900 px-5 pb-6 pt-16 text-slate-300 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.3fr_.7fr_1fr]">
            <div>
              <div className="mb-5 inline-flex items-center rounded-xl bg-white p-2">
                {/* Logo juga diperbarui di bagian footer dengan sedikit background putih agar jelas di tema gelap */}
                <img 
                  src="/logo.png" 
                  alt="Elfifa Logo" 
                  className="h-8 w-auto object-contain sm:h-10" 
                />
              </div>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-400">
                Penyedia layanan perjalanan Umroh praktis full service yang terpercaya, memastikan kenyamanan dan kekhusyukan ibadah Anda di Tanah Suci.
              </p>
              <div className="flex gap-4">
                <a href="#kontak" aria-label="Instagram" className="text-slate-400 transition-colors hover:text-white">
                  <InstagramIcon className="size-6" />
                </a>
                <a href="#kontak" aria-label="Facebook" className="text-slate-400 transition-colors hover:text-white">
                  <FacebookIcon className="size-6" />
                </a>
                <a href="#kontak" aria-label="YouTube" className="text-slate-400 transition-colors hover:text-white">
                  <YoutubeIcon className="size-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-bold text-white">Tautan Cepat</h3>
              <div className="flex flex-col gap-3 text-sm">
                <a href="#beranda" className="transition-colors hover:text-[#007a82]">Beranda</a>
                <a href="#paket" className="transition-colors hover:text-[#007a82]">Paket Promo</a>
                <a href="#fasilitas" className="transition-colors hover:text-[#007a82]">Fasilitas</a>
                <a href="#profil" className="transition-colors hover:text-[#007a82]">Profil Kami</a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-bold text-white">Hubungi Kami</h3>
              <div className="flex flex-col gap-4 text-sm">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#007a82]" />
                  Jl. Raya Jemursari No. 42, Surabaya, Indonesia
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-[#007a82]" />
                  +62 812-3456-7890
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-[#007a82]" />
                  halo@elfifa.id
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © 2026 Elfifa Travel Umroh. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>

      {/* ==================== WHATSAPP FAB ==================== */}
      <a
        href="https://wa.me/628123456789"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex size-14 animate-bounce items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform duration-300 hover:scale-110 hover:bg-[#20b858]"
      >
        <MessageCircle className="size-7 fill-current" />
      </a>
    </div>
  );
}