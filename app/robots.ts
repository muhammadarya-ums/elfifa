import type { MetadataRoute } from 'next'
import { MAIN_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${MAIN_URL}/sitemap.xml`,
  }
}
