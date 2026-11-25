'use client'

import { useEffect, useState } from 'react'
import { CUSTOM_KBIHU_URL, CUSTOM_MAIN_HOST, KBIHU_URL } from '@/lib/site-config'

/** URL portal KBIHU sesuai domain yang sedang dibuka (lokal → /kbihu). */
export function useKbihuUrl() {
  const [url, setUrl] = useState('/kbihu')
  useEffect(() => {
    const host = window.location.hostname
    if (host.endsWith(CUSTOM_MAIN_HOST)) setUrl(CUSTOM_KBIHU_URL)
    else if (host.endsWith('vercel.app')) setUrl(KBIHU_URL)
  }, [])
  return url
}
