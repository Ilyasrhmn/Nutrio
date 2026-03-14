import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  // Define route groups
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isPublicRoute = pathname === '/'
  const isProtectedRoute = pathname.startsWith('/portal')

  // 1. If trying to access portal without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. If authenticated and trying to access auth or landing page, redirect to portal
  if (token && (isAuthRoute || isPublicRoute)) {
    const portalUrl = new URL('/portal', request.url)
    return NextResponse.redirect(portalUrl)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
