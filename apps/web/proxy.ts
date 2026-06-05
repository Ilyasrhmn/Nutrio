import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Vendor lifecycle → portal sub-route map
// Kept in sync with StateMachineService.resolvePortalRoute()
const LIFECYCLE_ROUTES: Record<string, string> = {
  ANONYMOUS: '/eligibility',
  ELIGIBILITY_CHECKED: '/eligibility',
  REGISTERED: '/portal/status',
  PREPARING_DOCS: '/portal/status',
  DOCS_SUBMITTED: '/portal/status',
  INSPECTION_SCHEDULED: '/portal/status',
  INSPECTION_COMPLETED: '/portal/status',
  UNDER_REVIEW: '/portal/status',
  REVISION_REQUESTED: '/portal/status',
  APPROVED: '/portal/status',
  ONBOARDING: '/portal/onboarding',
  ACTIVE: '/portal/mission-control',
  SUSPENDED: '/portal/suspended',
  REVOKED: '/portal/revoked',
}

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

  // 3. Lifecycle-based routing for vendor role at /portal root
  // Requires `vendorLifecycle` cookie set by auth flow on login (see apps/web/lib/api-client.ts)
  if (token && pathname === '/portal') {
    const lifecycleStatus = request.cookies.get('vendorLifecycle')?.value
    if (lifecycleStatus && LIFECYCLE_ROUTES[lifecycleStatus]) {
      const target = new URL(LIFECYCLE_ROUTES[lifecycleStatus], request.url)
      return NextResponse.redirect(target)
    }
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
