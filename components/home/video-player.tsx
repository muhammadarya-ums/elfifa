'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/** Video profil: autoplay senyap saat terlihat, hormati prefers-reduced-motion. */
export default function VideoPlayer({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.5 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <div className="arch group relative aspect-[4/5] overflow-hidden bg-brand-950">
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload="metadata"
        muted
        loop
        playsInline
        className="size-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={label}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Jeda video' : 'Putar video'}
        className="absolute bottom-6 left-6 flex items-center gap-3 rounded-full bg-white/95 py-2 pl-2 pr-5 text-[13px] font-semibold text-ink shadow-lg backdrop-blur transition-transform hover:scale-[1.03]"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-white">
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
        </span>
        {playing ? 'Jeda' : 'Putar video'}
      </button>
    </div>
  )
}
