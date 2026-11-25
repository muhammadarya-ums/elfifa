import 'server-only'

/**
 * Proteksi CSRF untuk Route Handler (Server Action sudah memeriksa Origin otomatis).
 * Permintaan yang mengubah data wajib berasal dari domain yang sama.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export const jsonError = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
