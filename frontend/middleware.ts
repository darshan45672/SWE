/**
 * Authentication Middleware for Protected Routes
 * 
 * Note: Since we're using localStorage for token storage (client-side),
 * this middleware cannot directly check authentication status.
 * It only handles redirects for auth pages when already logged in.
 * 
 * For protected routes, the AuthContext will handle redirects on the client side.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login', 
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/reset-password'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow all public routes and static assets
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, let the client-side AuthContext handle authentication
  // The middleware just ensures proper headers are set
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)',
  ],
};
