'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContextNext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/error-boundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in environment variables');
  }

  // Debug environment variables in production
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment check:', {
      googleClientId: googleClientId ? 'Set' : 'Not set',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    });
  }

  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log global application errors
    console.error('App Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    });

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.warn('App error in production - should be reported to error service');
    }
  };

  return (
    <ErrorBoundary
      onError={handleAppError}
      title="Application Error"
      description="We're sorry, but something went wrong with the application. Please try refreshing the page."
      showRetry={true}
      showGoHome={true}
      showReportBug={process.env.NODE_ENV === 'production'}
    >
      <SessionProvider>
        <GoogleOAuthProvider clientId={googleClientId || ''}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}