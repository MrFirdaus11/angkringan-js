import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.admin) {
    return NextResponse.json({ admin: null }, { status: 401 })
  }
  return NextResponse.json({ admin: session.admin, csrfToken: session.csrfToken })
}
