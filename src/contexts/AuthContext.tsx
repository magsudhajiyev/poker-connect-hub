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
  hasPassword?: boolean;
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
  const [isSyncing, setIsSyncing] = useState(false);

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

      // Check if this is a fresh login (came from signin page)
      const isFreshLogin =
        document.referrer.includes('/auth/signin') || window.location.pathname === '/onboarding';

      // Add extra delay for fresh logins to ensure cookies are set
      if (isFreshLogin && !backendUser) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Always check backend auth to ensure we have JWT cookies
      // This is important for Google OAuth users
      if (status === 'loading') {
        return; // Wait for NextAuth to finish loading
      }

      try {
        const response = await authEndpoints.getMe();

        // The response structure is { success: true, data: { user: {...} } }
        const userData = response.data?.data?.user || response.data?.user || response.data;

        if (userData && userData.id) {
          setBackendUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            hasCompletedOnboarding: userData.hasCompletedOnboarding,
            hasPassword: userData.hasPassword,
            createdAt: userData.createdAt,
          });
        }
      } catch (error: any) {
        // If we get a 401, try to refresh the token
        if (error?.response?.status === 401) {
          try {
            const refreshResponse = await authEndpoints.refreshToken();

            if (refreshResponse.data?.success) {
              // Retry getting user data with new token
              const retryResponse = await authEndpoints.getMe();
              const userData =
                retryResponse.data?.data?.user || retryResponse.data?.user || retryResponse.data;

              if (userData && userData.id) {
                setBackendUser({
                  id: userData.id,
                  email: userData.email,
                  name: userData.name,
                  picture: userData.picture,
                  hasCompletedOnboarding: userData.hasCompletedOnboarding,
                  hasPassword: userData.hasPassword,
                  createdAt: userData.createdAt,
                });
                return;
              }
            }
          } catch (_refreshError) {
            // Token refresh failed - this is expected if tokens are expired
            // Clear invalid tokens and continue
            setBackendUser(null);
          }
        }

        // If we have a NextAuth session but no backend auth, sync with backend
        if (session?.user?.email && status === 'authenticated') {
          // CRITICAL: Clear any existing backend user state before syncing
          // This prevents showing previous user data during Google OAuth
          if (backendUser && backendUser.email !== session.user.email) {
            setBackendUser(null);
          }

          setIsSyncing(true);
          try {
            const syncPayload = {
              email: session.user.email,
              name: session.user.name || '',
              googleId: (session as any).user?.googleId || (session.user as any).id || '',
              picture: session.user.image || '',
            };

            const syncResponse = await fetch('/api/auth/google/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(syncPayload),
            });

            if (syncResponse.ok) {
              const syncData = await syncResponse.json();

              if (syncData.data?.user) {
                const syncedUser = {
                  id: syncData.data.user.id,
                  email: syncData.data.user.email,
                  name: syncData.data.user.name,
                  picture: syncData.data.user.picture,
                  hasCompletedOnboarding: syncData.data.user.hasCompletedOnboarding,
                  hasPassword: syncData.data.user.hasPassword,
                  createdAt: syncData.data.user.createdAt,
                };
                setBackendUser(syncedUser);

                // Note: Password setup will be handled in onboarding flow

                // After sync, try to verify auth cookies were set by calling /api/auth/me
                try {
                  await authEndpoints.getMe();
                  // Silent verification - no action needed if it works
                } catch {
                  // Silent fail - cookies might not be immediately available
                }

                // User is now synced and authenticated
                return;
              }
            }
          } catch {
            // Silent fail - sync might not always work
          } finally {
            setIsSyncing(false);
          }
        }

        // Not authenticated via backend
        setBackendUser(null);
      } finally {
        setIsCheckingBackendAuth(false);
      }
    };

    checkBackendAuth();
  }, [status, session]);

  // Determine the current user from either auth method
  // ALWAYS prefer backend user data as it has the most up-to-date onboarding status
  const user = backendUser || null;

  // Only fall back to session data if we have no backend user AND we're not currently syncing
  const fallbackUser =
    !user && !isSyncing && session?.user
      ? {
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          picture: session.user.image || undefined,
          hasCompletedOnboarding:
            (session.user as User & { hasCompletedOnboarding?: boolean }).hasCompletedOnboarding ??
            false,
          createdAt: new Date().toISOString(),
        }
      : null;

  const effectiveUser = user || fallbackUser;

  const loading = status === 'loading' || isCheckingBackendAuth || isSyncing;
  const isAuthenticated = status === 'authenticated' || Boolean(backendUser);

  // Redirect to onboarding if needed (simplified logic)
  useEffect(() => {
    if (!effectiveUser || loading) {
      return;
    }

    const currentPath = window.location.pathname;
    const onboardingRequiredPaths = ['/feed', '/share-hand', '/profile'];
    const isOnOnboardingRequiredPath = onboardingRequiredPaths.some((path) =>
      currentPath.startsWith(path),
    );

    // Only redirect if user is on a protected path but hasn't completed onboarding
    if (!effectiveUser.hasCompletedOnboarding && isOnOnboardingRequiredPath) {
      router.push('/onboarding');
    } else if (effectiveUser.hasCompletedOnboarding && currentPath === '/onboarding') {
      // If user completed onboarding but is on onboarding page, redirect to feed
      router.push('/feed');
    }
  }, [effectiveUser, loading, router]);

  const login = () => {
    // Navigate to sign in page
    router.push('/auth/signin');
  };

  const logout = async () => {
    setIsLoggingOut(true);

    // Clear backend user state immediately to prevent stale data
    setBackendUser(null);

    // Also clear any auth check states to prevent race conditions
    setIsCheckingBackendAuth(false);
    setIsSyncing(false);

    try {
      // Always call both logout methods to ensure complete session clearing
      // This prevents the issue where switching between auth methods shows previous user

      // 1. Call backend logout to clear JWT cookies and invalidate refresh token
      try {
        await authEndpoints.logout();
      } catch (_backendError) {
        // Backend logout failed - continue with NextAuth logout
        // This is not critical as we clear cookies anyway
      }

      // 2. Sign out from NextAuth if there's a session
      if (session) {
        try {
          await signOut({ redirect: false });
        } catch (_nextAuthError) {
          // Last resort: force clear all state
          setBackendUser(null);
          setIsCheckingBackendAuth(false);
          setIsSyncing(false);
        }
      }

      // 3. Clear all possible client-side storage
      if (typeof window !== 'undefined') {
        // Clear any localStorage/sessionStorage that might hold auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        sessionStorage.clear();

        // Force clear all cookies from client side as well
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });

        // Clear cookies with domain variations
        const domain = window.location.hostname;
        document.cookie.split(';').forEach(function (c) {
          const eqPos = c.indexOf('=');
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
        });
      }

      // Wait a bit for all logout operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Use replace instead of push to prevent back navigation issues
      router.replace('/');

      // Force a complete page reload to ensure all state is cleared
      // This is critical to prevent any cached auth state
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          // Add logout parameter to prevent middleware redirect
          // Use absolute URL to ensure we go to home page
          window.location.href = `${window.location.origin}/?logout=true`;
        }, 100);
      }
    } catch (_error) {
      // Even if logout fails, clear state and redirect to home
      setBackendUser(null);
      setIsCheckingBackendAuth(false);
      setIsSyncing(false);
      router.replace('/');

      // Force reload as last resort
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = `${window.location.origin}/?logout=true`;
        }, 100);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const refreshAuth = async () => {
    // Always re-check backend auth status to get the latest user data
    // This is important after onboarding completion to get updated hasCompletedOnboarding status
    try {
      const response = await authEndpoints.getMe();

      // The response structure is { success: true, data: { user: {...} } }
      const userData = response.data?.data?.user || response.data?.user || response.data;

      if (userData && userData.id) {
        setBackendUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          hasCompletedOnboarding: userData.hasCompletedOnboarding,
          hasPassword: userData.hasPassword,
          createdAt: userData.createdAt,
        });

        // If onboarding was just completed, navigate to feed
        if (userData.hasCompletedOnboarding && window.location.pathname === '/onboarding') {
          router.push('/feed');
        }
      } else {
        // No valid backend user
        setBackendUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      setBackendUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
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
