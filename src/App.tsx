
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error-boundary';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Blog from './pages/Blog';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import ShareHand from './pages/ShareHand';
import HandView from './pages/HandView';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';

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

const App = () => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log global application errors
    console.error('App Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
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
      showReportBug={import.meta.env.PROD}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/share-hand" element={<ShareHand />} />
              <Route path="/hand-view" element={<HandView />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/404" element={<Error404 />} />
              <Route path="/500" element={<Error500 />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
