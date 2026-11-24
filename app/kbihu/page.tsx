import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react'
import KbihuMobileNav from '@/components/kbihu-mobile-nav'
import RegistrationForm from '@/components/registration-form'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/social-icons'
import { getSettings, getUpcomingSchedules } from '@/lib/data'
import { formatDate, waLink } from '@/lib/format'
import { MAIN_URL } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

const KBIHU_NAME = 'KBIHU Elfifa'

const navItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Materi', href: '#kurikulum' },
  { label: 'Profil Asatidz', href: '#asatidz' },
  { label: 'Jadwal', href: '#jadwal' },
  { label: 'Pendaftaran', href: '#daftar' },
  { label: 'Cek Status', href: '/cek-status' },
]

const curriculum = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Pemahaman Fiqih',
    description: 'Memahami rukun, wajib, sunnah, dan adab ibadah dengan landasan ilmu yang kuat.',
  },
  {
    number: '02',
    icon: Users,
    title: 'Praktik Manasik',
    description: 'Menyempurnakan kesiapan melalui simulasi tawaf, sa’i, wukuf, dan rangkaian ibadah lainnya.',
  },
  {
    number: '03',
    icon: HeartHandshake,
    title: 'Pendampingan Penuh',
    description: 'Ustaz dan tim mendampingi jamaah dengan sepenuh perhatian selama di Haramain.',
  },
]

const asatidz = [
  { initials: 'HA', name: 'Ust. H. Abdullah, Lc., M.A.', role: 'Pembimbing Utama', color: 'bg-[#dbe9df]' },
  { initials: 'UF', name: 'Ustazah Fathimah, Lc.', role: 'Pembimbing Manasik', color: 'bg-[#eee5d5]' },
  { initials: 'UR', name: 'Ust. H. Rasyid, M.A.', role: 'Pembimbing Fiqih', color: 'bg-[#dce9ea]' },
]

function SectionHeading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#007a82]">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl tracking-[-0.035em] text-[#173e40] sm:text-[45px]">{children}</h2>
    </div>
  )
}

export default async function KbihuPage() {
  const [settings, upcoming] = await Promise.all([getSettings(), getUpcomingSchedules(6)])
  const year = new Date().getFullYear()
  const KBIHU_WA_URL = waLink(
    settings.kbihu_whatsapp,
    "Assalamu'alaikum KBIHU Elfifa, saya ingin bertanya tentang bimbingan manasik Haji/Umrah.",
  )
  const kbihu = {
    name: KBIHU_NAME,
    email: settings.kbihu_email,
    address: settings.kbihu_address,
    phoneDisplay: settings.kbihu_phone,
    officeHours: settings.kbihu_office_hours,
    social: { instagram: settings.kbihu_instagram, facebook: settings.kbihu_facebook },
  }
  const schedules = upcoming.map((s, i) => ({
    id: s.id,
    date: formatDate(s.date, { day: 'numeric' }),
    month: formatDate(s.date, { month: 'short' }).toUpperCase(),
    fullDate: formatDate(s.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: `${s.startTime.replace(':', '.')} – ${s.endTime.replace(':', '.')}`,
    topic: s.topic,
    location: s.location,
    status: i === 0 ? 'Terdekat' : 'Terjadwal',
    featured: i === 0,
  }))

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbfcfb] text-[#173b3d]">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-30 border-b border-[#dfeae7] bg-white/95 backdrop-blur">
        <div className="relative mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <a href="#beranda" className="flex items-center gap-3" aria-label="KBIHU Elfifa, beranda">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007a82] text-white shadow-sm">
              <BookOpen size={20} strokeWidth={1.8} />
            </span>
            <span className="font-serif text-[20px] font-semibold tracking-[-0.02em] text-[#143e40]">{kbihu.name}</span>
          </a>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#557174] lg:flex" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <a key={item.href} className="transition-colors hover:text-[#007a82]" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={KBIHU_WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-[#b9cfcb] px-5 py-2.5 text-[13px] font-semibold text-[#21595b] transition-colors hover:border-[#007a82] hover:bg-[#f1f8f6] sm:inline-flex"
            >
              <WhatsAppIcon className="size-4 text-[#25a35a]" />
              Konsultasi
            </a>
            <KbihuMobileNav items={navItems} ctaHref={KBIHU_WA_URL} />
          </div>
        </div>
      </header>

      <main>
        {/* ==================== HERO ==================== */}
        <section id="beranda" className="relative border-b border-[#dfeae7] bg-[#eff7f5]">
          <div className="mx-auto grid min-h-[620px] max-w-7xl items-center px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-10 lg:py-20">
            <div className="relative z-10 max-w-[570px]">
              <div className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#007a82]">
                <span className="h-px w-9 bg-[#8aaea8]" />
                Lembaga Bimbingan Resmi
              </div>
              <h1 className="max-w-[580px] font-serif text-[42px] leading-[1.08] tracking-[-0.045em] text-[#163e40] sm:text-[58px] lg:text-[62px]">
                Membimbing dengan Ilmu, <em className="font-normal text-[#007a82]">Mengantarkan</em> Menuju Mabrur.
              </h1>
              <p className="mt-7 max-w-[490px] text-[16px] leading-8 text-[#567174]">
                Lembaga bimbingan ibadah Haji dan Umrah resmi dengan kurikulum sesuai sunnah dan pendampingan intensif dari tanah air hingga ke Tanah Suci.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#daftar"
                  className="inline-flex items-center gap-2 rounded-full bg-[#007a82] px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_8px_22px_rgba(0,122,130,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#00656c]"
                >
                  Daftar Bimbingan <ArrowRight size={16} />
                </a>
                <a
                  href="#jadwal"
                  className="inline-flex items-center gap-2 rounded-full border border-[#9dbab5] bg-white/40 px-6 py-3.5 text-[13px] font-bold text-[#236064] transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  Jadwal Manasik
                </a>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-[#638083]">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#007a82]" /> Terdaftar Kemenag
                </span>
                <span className="flex items-center gap-2">
                  <Users size={17} className="text-[#007a82]" /> 12 tahun membimbing
                </span>
              </div>
            </div>

            <div className="relative mt-14 min-h-[340px] lg:mt-0 lg:min-h-[480px]">
              <div className="absolute inset-0 rounded-[32px] bg-[#9fc9c0] opacity-35 blur-3xl" />
              <div className="relative h-full min-h-[340px] overflow-hidden rounded-[28px] border-[10px] border-white/70 shadow-[0_24px_70px_rgba(37,86,80,0.14)] lg:min-h-[480px]">
                <img
                  src="/images/manasik-hero.webp"
                  alt="Jamaah mengikuti pembelajaran manasik"
                  width={1200}
                  height={670}
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173f40]/55 via-transparent to-white/10" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">Belajar sebelum berangkat</p>
                  <p className="mt-1 font-serif text-xl">Perjalanan yang dimulai dengan ilmu.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== KURIKULUM ==================== */}
        <section id="kurikulum" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHeading eyebrow="Kurikulum kami">Tahapan Bimbingan KBIHU</SectionHeading>
            <p className="max-w-[340px] text-sm leading-7 text-[#668084]">
              Kami menyiapkan jamaah dengan ilmu yang benar, praktik yang terarah, dan pendampingan yang menenangkan.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {curriculum.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.number}
                  className="group rounded-2xl border border-[#dce9e5] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#9bc6be] hover:shadow-[0_14px_34px_rgba(42,94,87,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#007a82]">
                      <Icon size={23} strokeWidth={1.6} />
                    </span>
                    <span className="font-serif text-3xl text-[#bdd3ce]">{item.number}</span>
                  </div>
                  <h3 className="mt-8 font-serif text-[24px] text-[#1c4849]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-[#6a8182]">{item.description}</p>
                  <a href="#daftar" className="mt-6 inline-flex items-center gap-1 text-[12px] font-bold text-[#007a82]">
                    Ikuti bimbingan <ChevronRight size={15} />
                  </a>
                </article>
              )
            })}
          </div>
        </section>

        {/* ==================== ASATIDZ ==================== */}
        <section id="asatidz" className="border-y border-[#e1ebe8] bg-[#f2f7f5]">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <SectionHeading eyebrow="Para pembimbing">
                Dibimbing oleh Asatidz
                <br className="hidden sm:block" /> Berpengalaman
              </SectionHeading>
              <a
                href={KBIHU_WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-[#007a82]"
              >
                Konsultasi dengan pembimbing <ArrowRight size={15} />
              </a>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {asatidz.map((ustaz) => (
                <article key={ustaz.name} className="flex items-center gap-5 rounded-2xl border border-[#dce9e5] bg-white p-5">
                  <div
                    className={`flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full ${ustaz.color} font-serif text-2xl font-semibold text-[#41706d] ring-4 ring-[#f1f7f4]`}
                    aria-hidden="true"
                  >
                    {ustaz.initials}
                  </div>
                  <div>
                    <h3 className="font-serif text-[18px] leading-6 text-[#204a4b]">{ustaz.name}</h3>
                    <p className="mt-1 text-[12px] text-[#789092]">{ustaz.role}</p>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#edf7f2] px-2.5 py-1 text-[10px] font-bold text-[#41806d]">
                      <Check size={11} /> Tersertifikasi Kemenag
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== JADWAL ==================== */}
        <section id="jadwal" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHeading eyebrow="Agenda terdekat">Jadwal Manasik</SectionHeading>
            <p className="flex items-center gap-2 text-sm text-[#668084]">
              <CalendarDays size={17} className="text-[#007a82]" /> {settings.kbihu_season}
            </p>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#dce9e5] bg-white" role="table" aria-label="Jadwal manasik">
            <div
              role="row"
              className="hidden grid-cols-[120px_140px_1.5fr_1fr_130px] border-b border-[#e8efed] bg-[#f5f9f7] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#789092] md:grid"
            >
              <span role="columnheader">Tanggal</span>
              <span role="columnheader">Waktu</span>
              <span role="columnheader">Materi</span>
              <span role="columnheader">Lokasi</span>
              <span role="columnheader">Status</span>
            </div>
            {schedules.length === 0 && (
              <div role="row" className="px-6 py-10 text-center text-sm text-[#6a8182]">
                <span role="cell">Jadwal manasik gelombang berikutnya segera diumumkan. Hubungi sekretariat untuk informasi.</span>
              </div>
            )}
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                role="row"
                className={`grid gap-3 border-b border-[#edf2f0] px-5 py-5 last:border-0 md:grid-cols-[120px_140px_1.5fr_1fr_130px] md:items-center md:gap-4 md:px-6 ${schedule.featured ? 'bg-[#f4faf7]' : ''}`}
              >
                <div role="cell" className="flex items-center gap-3" title={schedule.fullDate}>
                  <span className="font-serif text-3xl text-[#1f5b5b]">{schedule.date}</span>
                  <span className="text-[10px] font-bold text-[#7b9290]">{schedule.month}</span>
                </div>
                <span role="cell" className="flex items-center gap-2 text-[13px] text-[#5d7779]">
                  <Clock3 size={15} className="text-[#8bb3aa]" />
                  {schedule.time}
                </span>
                <span role="cell" className="font-medium text-[#315c5d]">{schedule.topic}</span>
                <span role="cell" className="flex items-center gap-2 text-[13px] text-[#6a8182]">
                  <MapPin size={14} className="text-[#8bb3aa]" />
                  {schedule.location}
                </span>
                <span role="cell">
                  <span
                    className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-bold ${schedule.featured ? 'bg-[#dff0e8] text-[#3e806d]' : 'bg-[#f1f5f3] text-[#77908d]'}`}
                  >
                    {schedule.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== PENDAFTARAN ==================== */}
        <section id="daftar" className="mx-5 mb-20 overflow-hidden rounded-[28px] bg-[#0d7378] sm:mx-8 lg:mx-auto lg:max-w-7xl">
          <div className="relative grid gap-4 px-7 py-14 sm:px-14 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[34px] border-white/10" />
            <div className="absolute -bottom-28 right-24 h-56 w-56 rounded-full border-[24px] border-[#9fbd83]/20" />
            <div className="relative max-w-[620px] lg:sticky lg:top-28">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c5e1b0]">Langkah pertama perjalanan Anda</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] text-white sm:text-[46px]">
                Siapkan ibadah terbaik bersama kami.
              </h2>
              <p className="mt-4 max-w-[500px] text-[15px] leading-7 text-[#d5e9e5]">
                Pendaftaran bimbingan Haji dan Umrah gelombang berikutnya telah dibuka. Mari belajar dan berangkat dengan tenang.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={KBIHU_WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/20"
                >
                  <WhatsAppIcon className="size-4" /> Tanya via WhatsApp
                </a>
                <a
                  href="/cek-status"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
                >
                  Cek status pendaftaran <ArrowRight size={15} />
                </a>
              </div>
            </div>
            <div className="relative mt-10 rounded-3xl bg-white p-6 text-left sm:p-8 lg:mt-0">
              <RegistrationForm variant="kbihu" />
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-[#dfeae7] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#007a82] text-white">
                <BookOpen size={18} />
              </span>
              <span className="font-serif text-xl font-semibold text-[#143e40]">{kbihu.name}</span>
            </div>
            <p className="mt-4 max-w-[290px] text-[13px] leading-6 text-[#718789]">
              Menuntun langkah menuju Baitullah dengan ilmu, adab, dan pendampingan.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={kbihu.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram KBIHU Elfifa"
                className="rounded-full border border-[#d5e5e1] p-2 text-[#52807d] transition-colors hover:bg-[#eff7f5]"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={kbihu.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook KBIHU Elfifa"
                className="rounded-full border border-[#d5e5e1] p-2 text-[#52807d] transition-colors hover:bg-[#eff7f5]"
              >
                <FacebookIcon className="size-4" />
              </a>
            </div>
            <a
              href={MAIN_URL}
              className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#b57930] hover:underline"
            >
              Paket Umroh Elfifa Travel <ExternalLink size={13} />
            </a>
          </div>
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#315c5d]">Sekretariat</h3>
            <p className="mt-4 flex gap-2 text-[13px] leading-6 text-[#718789]">
              <MapPin className="mt-1 shrink-0 text-[#007a82]" size={15} />
              {kbihu.address}
            </p>
            <a href={KBIHU_WA_URL} target="_blank" rel="noopener noreferrer" className="mt-2 flex gap-2 text-[13px] text-[#718789] hover:text-[#007a82]">
              <Phone className="mt-0.5 shrink-0 text-[#007a82]" size={15} />
              {kbihu.phoneDisplay}
            </a>
          </div>
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#315c5d]">Hubungi kami</h3>
            <a href={`mailto:${kbihu.email}`} className="mt-4 flex gap-2 text-[13px] text-[#718789] hover:text-[#007a82]">
              <Mail className="mt-0.5 shrink-0 text-[#007a82]" size={15} />
              {kbihu.email}
            </a>
            <p className="mt-4 text-[12px] leading-6 text-[#8a9e9e]">{kbihu.officeHours}</p>
          </div>
        </div>
        <div className="border-t border-[#e5eeeb] px-5 py-5 text-center text-[11px] text-[#8ca0a0]">
          © {year} {kbihu.name}. Membimbing dengan ilmu.
        </div>
      </footer>
    </div>
  )
}
