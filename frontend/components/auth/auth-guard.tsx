'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Context7-inspired AuthGuard component
 * Provides client-side route protection with automatic redirection
 */
export function AuthGuard({ 
  children, 
  fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div>,
  redirectTo = '/auth/signin'
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Context7 pattern: Wait for initial load, then redirect if no user
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?from=${encodeURIComponent(currentPath)}`;
      
      // Use replace to avoid back button issues
      router.replace(redirectUrl);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return <>{fallback}</>;
  }

  // Show nothing while redirecting unauthenticated users
  if (!user) {
    return <>{fallback}</>;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}

/**
 * Context7-inspired RedirectToSignIn component
 * Automatically redirects unauthenticated users
 */
export function RedirectToSignIn({ redirectTo = '/auth/signin' }: { redirectTo?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?from=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectTo]);

  return null;
}

/**
 * Context7-inspired SignedIn component
 * Only renders children if user is authenticated
 */
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Context7-inspired SignedOut component
 * Only renders children if user is not authenticated
 */
export function SignedOut({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading || user) {
    return null;
  }

  return <>{children}</>;
}