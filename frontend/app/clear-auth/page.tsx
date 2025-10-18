'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Context7-inspired utility page to clear authentication data
 * Useful for testing and debugging authentication flows
 */
export default function ClearAuthPage() {
  const router = useRouter();

  const clearAuth = () => {
    // Clear localStorage
    localStorage.removeItem('auth-token');
    
    // Clear cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  useEffect(() => {
    // Auto-clear on page load
    clearAuth();
  }, []);

  const handleGoToSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Cleared</CardTitle>
          <CardDescription>
            All authentication data has been removed from your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>LocalStorage cleared</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Cookies cleared</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Session reset</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleGoToSignIn} className="w-full">
              Go to Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Home
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This page is useful for testing after flushing the database
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
