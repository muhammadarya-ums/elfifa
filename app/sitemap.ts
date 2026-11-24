import type { MetadataRoute } from 'next'
import { KBIHU_URL, MAIN_URL } from '@/lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: MAIN_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: KBIHU_URL, lastModified, changeFrequency: 'weekly', priority: 0.8 },
  ]
}
