"use client";

import {
  ArrowDown,
  ArrowRight,
  Building2,
  Check,
  ExternalLink,
  Hotel,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Pause,
  Phone,
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

// Color Palette Constants
const TEAL = '#007a82';
const GOLD = '#d9923b';

// WhatsApp Configuration
const WA_NUMBER = '628123456789';
const WA_MESSAGE = encodeURIComponent(
  'Assalamu\'alaikum Elfifa, saya ingin konsultasi mengenai Paket Umroh 17 Hari Awal Musim Dingin.'
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

// Facilities Mapping
const facilities: [ElementType, string][] = [
  [PackageCheck, 'Perlengkapan'],
  [QrCode, 'Visa Umroh'],
  [Ticket, 'Tiket PP Confirmed'],
  [UserRound, 'Mutawwif Sesuai Sunnah'],
  [Utensils, 'Konsumsi 3x Sehari'],
  [Hotel, 'Hotel Dekat Masjid'],
  [BusIcon, 'Bus AC Executive'],
  [Video, 'Dokumentasi Syar\'i'],
];

// Gallery Data
type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

const galleryData: GalleryItem[] = [
  {
    id: 'galeri-1',
    src: '/galeri/jamaah1.jpeg',
    alt: 'Jamaah di Masjidil Haram Makkah',
  },
  {
    id: 'galeri-2',
    src: '/galeri/jamaah2.jpeg',
    alt: 'Kebersamaan Jamaah Elfifa',
  },
  {
    id: 'galeri-3',
    src: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    alt: 'Arsitektur Pelataran Ka\'bah',
  },
  {
    id: 'galeri-4',
    src: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    alt: 'Suasana Pelaksanaan Umroh',
  },
  {
    id: 'galeri-5',
    src: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
    alt: 'Masjid Nabawi Madinah',
  },
  {
    id: 'galeri-6',
    src: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=800&q=80',
    alt: 'Pelataran Kota Suci',
  },
  {
    id: 'galeri-7',
    src: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=800&q=80',
    alt: 'Ziarah & Silaturahmi Jamaah',
  },
  {
    id: 'galeri-8',
    src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
    alt: 'Momen Khusyuk Ibadah',
  },
];

/* ==================== CUSTOM ICONS ==================== */

function Logo() {
  return (
    <a
      href="#beranda"
      className="flex flex-shrink-0 items-center gap-2"
      aria-label="Elfifa Home"
    >
      <img
        src="/logo.png"
        alt="Elfifa Travel Umroh"
        className="h-10 w-auto object-contain sm:h-12 lg:h-13"
      />
    </a>
  );
}

function MosqueIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className || 'size-6'}
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

/* ==================== MAIN COMPONENT ==================== */

export default function ElfifaLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [kbihuTargetUrl, setKbihuTargetUrl] = useState('/kbihu');

  // Video Autoplay State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Dynamic KBIHU Switcher Domain Detector
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname.includes('vercel.app')) {
        // Lingkungan Preview Vercel Subdomain
        setKbihuTargetUrl('https://kbihu-elfifa.vercel.app');
      } else if (hostname.includes('elfifa.com')) {
        // Lingkungan Produksi Custom Domain
        setKbihuTargetUrl('https://kbihu.elfifa.com');
      } else {
        // Localhost atau fallback
        setKbihuTargetUrl('/kbihu');
      }
    }
  }, []);

  // Detect Scroll for Header Shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Smooth Video Playback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                })
                .catch(() => {
                  setIsPlaying(false);
                  setAutoplayBlocked(true);
                });
            }
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
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
    ['Galeri', '#galeri'],
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#d9923b]/20 selection:text-[#007a82]">
      
      {/* ==================== KBIHU DEMO BAR (Cara 1 Switcher) ==================== */}
      <div className="bg-gradient-to-r from-slate-900 via-[#007a82] to-slate-900 px-4 py-2 text-xs font-medium text-white shadow-inner">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="hidden rounded bg-[#d9923b] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-950 sm:inline-block">
              Portal Terintegrasi
            </span>
            <p className="truncate text-slate-200">
              Mencari Kelompok Bimbingan Ibadah Haji & Umroh?
            </p>
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
          scrolled ? 'shadow-md border-b border-slate-100' : ''
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* Desktop Nav Links */}
          <div className="hidden items-center space-x-8 lg:flex">
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

          {/* Action CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href={kbihuTargetUrl}
              className="flex items-center gap-1.5 rounded-full border border-[#007a82]/30 bg-[#007a82]/5 px-4 py-2 text-xs font-bold text-[#007a82] transition-all hover:bg-[#007a82] hover:text-white"
            >
              <Building2 className="size-4" />
              Subdomain KBIHU
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#d9923b] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#d9923b]/30 transition-all hover:-translate-y-0.5 hover:bg-[#b57930] hover:shadow-lg"
            >
              Daftar Sekarang
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="text-[#007a82] focus:outline-none lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {menuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl lg:hidden">
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
            
            <div className="mt-4 flex flex-col gap-2 pt-2">
              <a
                href={kbihuTargetUrl}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#007a82] bg-[#007a82]/5 py-2.5 text-center text-sm font-bold text-[#007a82]"
              >
                <Building2 className="size-4" />
                Portal KBIHU Elfifa
              </a>
              <a
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl bg-[#d9923b] py-3 text-center text-sm font-bold text-white shadow-md"
              >
                Daftar via WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ==================== HERO SECTION ==================== */}
        <section
          id="beranda"
          className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pb-20 pt-24 lg:min-h-[88vh] lg:pt-28"
        >
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              alt="Makkah Suci Background"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#007a82]/95 via-[#007a82]/85 to-slate-900/90 mix-blend-multiply" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md shadow-lg sm:text-sm">
              <span className="inline-block size-2 animate-ping rounded-full bg-[#d9923b]" />
              Update Keberangkatan Musim Ini
            </div>

            <h1 className="text-balance text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-[5.5rem]">
              Umroh <span className="text-[#d9923b]">17 Hari</span>
            </h1>
            <h2 className="mt-3 text-2xl font-light text-slate-200 drop-shadow-md sm:text-3xl md:text-4xl">
              Awal Musim Dingin
            </h2>
            
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base font-light leading-relaxed text-slate-100 drop-shadow sm:text-lg">
              Perjalanan Ibadah <strong className="font-semibold text-white">Lebih Khusyuk & Lebih Nyaman</strong> bersama Elfifa Travel. Rasakan kemudahan ibadah tanah suci dengan pelayanan full service terpercaya.
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
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto sm:text-lg"
              >
                <MessageCircle className="size-5 text-green-400 fill-current" />
                Konsultasi Gratis
              </a>
            </div>
          </div>

          {/* SVG Shape Divider */}
          <div className="absolute bottom-0 z-10 w-full overflow-hidden leading-none">
            <svg
              className="block h-[40px] w-full md:h-[70px]"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
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
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">
                Profil Elfifa Travel
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Lebih dari Sekadar Perjalanan, Ini Tentang Kekhusyukan Ibadah.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                Kami memahami bahwa ibadah Umroh adalah impian spiritual yang mulia. Elfifa hadir memastikan perjalanan Anda di Tanah Suci berlangsung lancar, tenang, dan berkesan tanpa beban teknis.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {[
                  { title: 'Pembimbing (Mutawwif) Berilmu & Ramah', desc: 'Sesuai dengan petunjuk sunnah untuk membimbing keabsahan ibadah.' },
                  { title: 'Akomodasi Hotel Premium & Strategis', desc: 'Jarak dekat ke pelataran Masjidil Haram & Masjid Nabawi.' },
                  { title: 'Izin Resmi Kemenag RI', desc: 'Jaminan keamanan, kenyamanan, dan kepastian jadwal penerbangan.' }
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

            {/* Interactive Video Container */}
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto lg:mr-0">
              <div className="absolute -left-6 -top-6 size-40 rounded-full bg-[#d9923b]/20 blur-3xl" />
              <div className="absolute -bottom-8 -right-8 size-48 rounded-full bg-[#007a82]/20 blur-3xl" />
              
              <div 
                className="group relative z-10 overflow-hidden rounded-[2.5rem] border-8 border-white bg-slate-900 shadow-2xl cursor-pointer"
                onClick={togglePlay}
              >
                <video
                  ref={videoRef}
                  src="/pemberangkatan-umrah.mp4"
                  poster="image_274300.jpg"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loop
                  muted
                  playsInline
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none" />

                {(!isPlaying || autoplayBlocked) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-[2px] transition-all duration-300">
                    <button
                      className="flex size-20 items-center justify-center rounded-full bg-[#d9923b] text-white shadow-[0_0_30px_rgba(217,146,59,0.5)] transition-transform hover:scale-110"
                      aria-label="Putar video"
                    >
                      <Play className="ml-1 size-8 fill-current" />
                    </button>
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

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm pointer-events-none">
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
                  <p className="text-xs font-bold uppercase leading-tight text-slate-500">Tahun<br/>Pengalaman</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================== PAKET SPECIAL SECTION ==================== */}
        <section id="paket" className="bg-[#f8fcfb] px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="text-3xl font-bold text-[#007a82] md:text-4xl">Detail Paket Spesial</h2>
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#d9923b]" />
            </div>

            <div className="grid overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl md:grid-cols-[1.2fr_.8fr]">
              
              {/* Hotel & Amenities */}
              <div className="p-8 md:p-12">
                <h3 className="mb-8 text-2xl font-bold text-slate-800 md:text-3xl">Akomodasi & Keunggulan</h3>
                
                <div className="mb-8 space-y-6">
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10">
                      <Hotel className="size-6 text-[#007a82]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Hotel Ghalib <span className="text-sm font-normal text-slate-500">(9 Hari Makkah)</span></h4>
                      <p className="mb-2 text-sm text-slate-600">± 250 meter dari Masjidil Haram</p>
                      <div className="flex text-[#d9923b]">
                        {[1, 2, 3].map((i) => (
                          <Star key={i} className="size-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#007a82]/10">
                      <MosqueIcon className="size-6 text-[#007a82]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Royal Andalus <span className="text-sm font-normal text-slate-500">(6 Hari Madinah)</span></h4>
                      <p className="mb-2 text-sm text-slate-600">Pelataran Masjid Nabawi</p>
                      <div className="flex text-[#d9923b]">
                        {[1, 2, 3, 4].map((i) => (
                          <Star key={i} className="size-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Free Bonuses */}
                <div className="relative overflow-hidden rounded-2xl bg-[#007a82] p-6 text-white shadow-lg">
                  <div className="absolute -bottom-6 -right-6 opacity-10">
                    <PackageCheck className="size-40" />
                  </div>
                  <h4 className="mb-4 text-lg font-bold text-[#d9923b]">Spesial Bonus Free:</h4>
                  <ul className="relative z-10 grid gap-3 sm:grid-cols-2">
                    {['Percetakan Alquran', 'Jabal Magnet', 'Kuliner Khas Arab', 'Ziarah Thaif', 'Albaik Fast Food'].map((item) => (
                      <li key={item} className="flex items-center gap-3 font-medium text-sm">
                        <Check className="size-5 shrink-0 text-[#d9923b]" /> {item}
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
              </div>

              {/* Price & CTA Side */}
              <div className="relative flex flex-col justify-center bg-slate-900 p-8 text-white md:p-12">
                <div className="absolute inset-0 bg-[#007a82]/30 mix-blend-multiply" />
                <div className="relative z-10 text-center lg:text-left">
                  <p className="mb-2 text-lg font-medium text-slate-300 md:text-xl">Investasi Akhirat</p>
                  
                  <div className="mb-2 flex items-center justify-center gap-3 lg:justify-start">
                    <span className="text-2xl font-semibold text-slate-400 line-through decoration-red-500 decoration-4">
                      Rp 42,9 Jt
                    </span>
                  </div>

                  <div className="relative mb-6 inline-block">
                    <span className="absolute -left-6 -top-4 rotate-[-12deg] rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                      DISKON PROMO
                    </span>
                    <h2 className="text-5xl font-extrabold text-[#d9923b] drop-shadow-md sm:text-6xl md:text-7xl">
                      <span className="mr-1 align-top text-3xl">Rp</span>39,9<span className="ml-1 align-top text-2xl">Jt</span>
                    </h2>
                  </div>

                  <p className="mx-auto mb-8 max-w-xs text-xs italic text-slate-400 sm:text-sm lg:mx-0">
                    *Termasuk tiket pesawat PP, visa, hotel, mutawwif & bus AC
                  </p>

                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9923b] py-4 text-lg font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-white hover:text-[#007a82]"
                  >
                    <MessageCircle className="size-6 fill-current" /> Amankan Seat Sekarang
                  </a>
                  <p className="mt-3 animate-pulse text-center text-xs font-semibold text-[#d9923b]">
                    Sisa Kuota Terbatas!
                  </p>
                </div>
              </div>

            </div>

            <div className="mx-auto mt-8 max-w-4xl rounded-r-xl border-l-4 border-amber-400 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-start">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p className="ml-3 text-xs text-amber-900 sm:text-sm">
                  <strong>Catatan:</strong> Harga & jadwal penerbangan sewaktu-waktu dapat disesuaikan mengikuti regulasi penerbangan dan fluktuasi kurs mata uang.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FASILITAS ==================== */}
        <section id="fasilitas" className="relative overflow-hidden bg-white px-5 py-24 lg:px-8">
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <span className="mb-3 block text-sm font-bold uppercase tracking-widest text-[#d9923b]">
                Layanan Terpadu
              </span>
              <h2 className="mb-5 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Fasilitas Selama Perjalanan
              </h2>
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
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d9923b]">
                  Dokumentasi
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Galeri Kebersamaan Jamaah
                </h2>
              </div>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-sm font-bold text-[#007a82] sm:flex">
                Tanya Foto Jamaah <ArrowRight className="size-4" />
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

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 px-5 pb-6 pt-16 text-slate-300 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.3fr_.7fr_1fr]">
            <div>
              <div className="mb-5 inline-flex items-center rounded-xl bg-white p-2">
                <img 
                  src="/logo.png" 
                  alt="Elfifa Logo" 
                  className="h-8 w-auto object-contain sm:h-10" 
                />
              </div>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-400">
                Penyedia layanan perjalanan Umroh praktis full service terpercaya, memastikan kenyamanan dan kelancaran ibadah Anda di Tanah Suci.
              </p>
              <div className="flex gap-4">
                <a href="#beranda" aria-label="Instagram" className="text-slate-400 hover:text-white">
                  <InstagramIcon className="size-5" />
                </a>
                <a href="#beranda" aria-label="Facebook" className="text-slate-400 hover:text-white">
                  <FacebookIcon className="size-5" />
                </a>
                <a href="#beranda" aria-label="YouTube" className="text-slate-400 hover:text-white">
                  <YoutubeIcon className="size-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-bold text-white">Navigasi Portal</h3>
              <div className="flex flex-col gap-3 text-sm">
                <a href="#beranda" className="hover:text-[#007a82]">Beranda Umroh</a>
                <a href="#paket" className="hover:text-[#007a82]">Paket Promo 17 Hari</a>
                <a href="#fasilitas" className="hover:text-[#007a82]">Fasilitas Layanan</a>
                <a href={kbihuTargetUrl} className="font-semibold text-[#d9923b] hover:underline">
                  Portal Subdomain KBIHU ➔
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-bold text-white">Hubungi Kami</h3>
              <div className="flex flex-col gap-4 text-sm">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#007a82]" />
                  Jl. Raya Jemursari No. 42, Surabaya, Jawa Timur
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

          <div className="mt-14 border-t border-slate-800 pt-8 text-center text-xs text-slate-500 sm:text-sm">
            © 2026 Elfifa Travel Umroh & KBIHU. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ==================== FLOATING WHATSAPP FAB ==================== */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform duration-300 hover:scale-110"
      >
        <MessageCircle className="size-7 fill-current" />
      </a>

    </div>
  );
}