import { cookies } from 'next/headers'
import { getIronSession, IronSession } from 'iron-session'

export interface SessionData {
  admin?: string
  csrfToken?: string
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'kompleks_secret_32_karakter_atau_lebih!',
  cookieName: 'angkringan_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  return session
}

export async function requireAuth(): Promise<IronSession<SessionData>> {
  const session = await getSession()
  if (!session.admin) {
    throw new Error('Unauthorized')
  }
  if (!session.csrfToken) {
    session.csrfToken = crypto.randomUUID()
    await session.save()
  }
  return session
}

export function formatRupiah(angka: number): string {
  return 'Rp ' + angka.toLocaleString('id-ID')
}
