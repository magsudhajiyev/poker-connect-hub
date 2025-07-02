'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authEndpoints } from '@/services/authApi';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [isCheckingBackendAuth, setIsCheckingBackendAuth] = useState(true);

  // Check for backend authentication
  useEffect(() => {
    const checkBackendAuth = async () => {
      // Check if we're in a logout flow
      const urlParams = new URLSearchParams(window.location.search);
      const isLogout = urlParams.get('logout') === 'true';

      // Skip auth check if we're logging out
      if (isLogout) {
        setIsCheckingBackendAuth(false);
        setBackendUser(null);
        return;
      }

      // Always check backend auth to ensure we have JWT cookies
      // This is important for Google OAuth users
      if (status === 'loading') {
        return; // Wait for NextAuth to finish loading
      }

      try {
        const response = await authEndpoints.getMe();

        if (response.data) {
          setBackendUser({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture,
            hasCompletedOnboarding: response.data.hasCompletedOnboarding,
            createdAt: response.data.createdAt,
          });
        }
      } catch {
        // Not authenticated via backend
        setBackendUser(null);
      } finally {
        setIsCheckingBackendAuth(false);
      }
    };

    checkBackendAuth();
  }, [status]);

  // Determine the current user from either auth method
  // Prefer backend user data as it has the most up-to-date onboarding status
  const user =
    backendUser ||
    (session?.user
      ? {
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          picture: session.user.image || undefined,
          hasCompletedOnboarding:
            (session.user as User & { hasCompletedOnboarding?: boolean }).hasCompletedOnboarding ||
            false,
          createdAt: new Date().toISOString(),
        }
      : null);

  const loading = status === 'loading' || isCheckingBackendAuth;
  const isAuthenticated = status === 'authenticated' || Boolean(backendUser);

  // Redirect to onboarding if needed (simplified logic)
  useEffect(() => {
    if (!user || loading) {
      return;
    }

    const currentPath = window.location.pathname;
    const onboardingRequiredPaths = ['/feed', '/share-hand', '/profile'];
    const isOnOnboardingRequiredPath = onboardingRequiredPaths.some((path) =>
      currentPath.startsWith(path),
    );

    // Only redirect if user is on a protected path but hasn't completed onboarding
    if (!user.hasCompletedOnboarding && isOnOnboardingRequiredPath) {
      console.log('🔄 AuthContext: Redirecting to onboarding (user incomplete)');
      router.push('/onboarding');
    } else if (user.hasCompletedOnboarding && currentPath === '/onboarding') {
      // If user completed onboarding but is on onboarding page, redirect to feed
      console.log('✅ AuthContext: Redirecting to feed (onboarding complete)');
      router.push('/feed');
    }
  }, [user, loading, router]);

  const login = () => {
    // Navigate to sign in page
    router.push('/auth/signin');
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // If user is authenticated via backend, call backend logout
      if (backendUser && !session) {
        await authEndpoints.logout();
        setBackendUser(null);
      } else {
        // Otherwise use NextAuth signOut
        await signOut({ redirect: false });
      }

      // Clear any local state
      // (removed hasCheckedOnboarding state)

      // Wait a bit for cookies to be cleared
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use replace instead of push to prevent back navigation issues
      router.replace('/');

      // Force a page reload to ensure all state is cleared
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          // Add logout parameter to prevent middleware redirect
          // Use absolute URL to ensure we go to home page
          window.location.href = `${window.location.origin}/?logout=true`;
        }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const refreshAuth = async () => {
    // NextAuth handles session refresh automatically
    // For backend auth, we can re-check the auth status
    if (!session && backendUser) {
      try {
        const response = await authEndpoints.getMe();

        if (response.data) {
          setBackendUser({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture,
            hasCompletedOnboarding: response.data.hasCompletedOnboarding,
            createdAt: response.data.createdAt,
          });
        }
      } catch {
        setBackendUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isLoggingOut,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
