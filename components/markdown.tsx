import type { ReactNode } from 'react'

/**
 * Renderer Markdown minimal & AMAN untuk konten CMS.
 * - Tidak pernah memakai dangerouslySetInnerHTML: semua teks di-escape oleh React.
 * - HTML mentah tidak didukung (ditampilkan sebagai teks biasa).
 * - Tautan hanya http(s), mailto, tel, atau path internal — `javascript:` dsb. ditolak.
 * Didukung: ## / ### judul, paragraf, daftar `- ` dan `1. `, **tebal**, *miring*, [teks](url).
 */

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = `${keyBase}-${i++}`
    if (m[1] !== undefined) out.push(<strong key={k}>{m[1]}</strong>)
    else if (m[2] !== undefined) out.push(<em key={k}>{m[2]}</em>)
    else if (SAFE_URL.test(m[4])) {
      const external = /^https?:/i.test(m[4])
      out.push(
        <a key={k} href={m[4]} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
          {m[3]}
        </a>,
      )
    } else out.push(m[3])
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let para: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flushPara = () => {
    if (para.length) blocks.push(<p key={`p${blocks.length}`}>{inline(para.join(' '), `p${blocks.length}`)}</p>)
    para = []
  }
  const flushList = () => {
    if (!list) return
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `l${blocks.length}-${i}`)}</li>)
    blocks.push(list.ordered ? <ol key={`l${blocks.length}`}>{items}</ol> : <ul key={`l${blocks.length}`}>{items}</ul>)
    list = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    const h = /^(#{2,3})\s+(.+)$/.exec(line)
    const ul = /^[-*]\s+(.+)$/.exec(line)
    const ol = /^\d+[.)]\s+(.+)$/.exec(line)
    if (!line) {
      flushPara()
      flushList()
    } else if (h) {
      flushPara()
      flushList()
      const content = inline(h[2], `h${blocks.length}`)
      blocks.push(h[1].length === 2 ? <h2 key={`h${blocks.length}`}>{content}</h2> : <h3 key={`h${blocks.length}`}>{content}</h3>)
    } else if (ul || ol) {
      flushPara()
      const ordered = !!ol
      if (list && list.ordered !== ordered) flushList()
      list ??= { ordered, items: [] }
      list.items.push((ul ?? ol)![1])
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()

  // Kelompokkan per judul ## agar jarak antar-bagian konsisten
  const sections: ReactNode[][] = [[]]
  for (const b of blocks) {
    if (b && typeof b === 'object' && 'type' in b && b.type === 'h2') sections.push([])
    sections.at(-1)!.push(b)
  }
  return (
    <>
      {sections
        .filter((s) => s.length)
        .map((s, i) => (
          <section key={i}>{s}</section>
        ))}
    </>
  )
}
