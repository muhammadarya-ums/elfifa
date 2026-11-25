import { WhatsAppIcon } from '@/components/social-icons'

export default function WhatsAppFab({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat dengan tim Elfifa di WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#1fa855] text-white shadow-[0_16px_32px_-12px_rgba(31,168,85,0.7)] transition-transform duration-300 hover:scale-105 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
