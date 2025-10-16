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
  
  console.log('🔍 Middleware check:', {
    pathname,
    hasToken: !!token,
    timestamp: new Date().toISOString()
  })
  
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
    console.log('✅ Public route access allowed:', pathname)
    return NextResponse.next()
  }
  
  // Context7 pattern: Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !token) {
    console.log('🔒 Protected route access denied - redirecting to signin:', pathname)
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  
  // Context7 pattern: Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    console.log('👤 Already authenticated - redirecting to dashboard:', pathname)
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  console.log('✅ Route access granted:', pathname)
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