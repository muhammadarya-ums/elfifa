'use client'

import { useKbihuUrl } from './use-kbihu-url'

export default function KbihuLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const url = useKbihuUrl()
  return (
    <a href={url} className={className}>
      {children}
    </a>
  )
}
