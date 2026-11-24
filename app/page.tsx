import ElfifaLanding from '@/components/elfifa-landing'
import { getActivePackages, getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [settings, packages] = await Promise.all([getSettings(), getActivePackages()])
  return <ElfifaLanding settings={settings} packages={packages} />
}
