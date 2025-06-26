import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't redirect during logout to prevent visual glitch
  useEffect(() => {
    if (!isAuthenticated && !isLoggingOut && !loading) {
      // Redirect to login page but save the attempted location
      router.push(`/auth?from=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoggingOut, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoggingOut) {
    return null; // Return null while redirecting
  }

  // Show loading screen during logout for smooth transition
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-400">Signing out...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
