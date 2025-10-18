import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication (Context7 pattern)
const protectedRoutes = ['/', '/profile', '/settings', '/issues']

// Define auth routes that should redirect if already authenticated
const authRoutes = ['/auth/signin', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

// Define public routes that don't require authentication
const publicRoutes = ['/health', '/api/health']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the token from cookies (Context7 security pattern)
  const token = request.cookies.get('auth-token')?.value
  
  // Check route types
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Context7 pattern: For protected routes, let client-side auth handle verification
  // Don't redirect here to avoid redirect loops with stale tokens
  if (isProtectedRoute) {
    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
  
  // Context7 pattern: Allow access to auth routes regardless of token
  // Client-side auth context will handle the actual verification and redirect
  if (isAuthRoute) {
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

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
