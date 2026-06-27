import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const adminRoutes = ['/dashboard', '/menu', '/api/menu/delete', '/api/order/pay', '/api/order/delete', '/api/dashboard', '/api/upload']

export function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url)

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  if (pathname === '/api/menu' && request.method === 'GET') {
    return NextResponse.next()
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const sessionCookie = request.cookies.get('angkringan_session')
    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/menu/:path*', '/qr/:path*', '/api/:path*'],
}
