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
  const [isSyncing, setIsSyncing] = useState(false);

  // Check for backend authentication
  useEffect(() => {
    const checkBackendAuth = async () => {
      console.log('🔄 AuthContext: checkBackendAuth started', {
        status,
        hasSession: Boolean(session),
        sessionEmail: session?.user?.email,
      });

      // Check if we're in a logout flow
      const urlParams = new URLSearchParams(window.location.search);
      const isLogout = urlParams.get('logout') === 'true';

      // Skip auth check if we're logging out
      if (isLogout) {
        console.log('🚪 AuthContext: Logout detected, skipping auth check');
        setIsCheckingBackendAuth(false);
        setBackendUser(null);
        return;
      }

      // Always check backend auth to ensure we have JWT cookies
      // This is important for Google OAuth users
      if (status === 'loading') {
        console.log('⏳ AuthContext: NextAuth still loading, waiting...');
        return; // Wait for NextAuth to finish loading
      }

      console.log('🔍 AuthContext: Checking backend auth via /api/auth/me');
      try {
        const response = await authEndpoints.getMe();

        if (response.data) {
          console.log('✅ AuthContext: Backend auth successful:', {
            id: response.data.id,
            email: response.data.email,
            hasCompletedOnboarding: response.data.hasCompletedOnboarding,
            hasCompletedOnboardingType: typeof response.data.hasCompletedOnboarding,
          });

          setBackendUser({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture,
            hasCompletedOnboarding: response.data.hasCompletedOnboarding,
            createdAt: response.data.createdAt,
          });
        }
      } catch (error) {
        console.log('❌ AuthContext: Backend auth failed:', error);

        // If we have a NextAuth session but no backend auth, sync with backend
        if (session?.user?.email && status === 'authenticated') {
          console.log(
            '🔄 AuthContext: Have NextAuth session but no backend auth, starting sync...',
            {
              sessionEmail: session.user.email,
              sessionHasCompletedOnboarding: (session.user as any).hasCompletedOnboarding,
            },
          );
          setIsSyncing(true);
          try {
            const syncPayload = {
              email: session.user.email,
              name: session.user.name || '',
              googleId: (session as any).user?.googleId || (session.user as any).id || '',
              picture: session.user.image || '',
            };

            console.log('📤 AuthContext: Sending sync request:', syncPayload);

            const syncResponse = await fetch('/api/auth/google/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(syncPayload),
            });

            console.log('📥 AuthContext: Sync response status:', syncResponse.status);

            if (syncResponse.ok) {
              const syncData = await syncResponse.json();
              console.log('📥 AuthContext: Sync response data:', {
                success: syncData.success,
                hasUser: Boolean(syncData.data?.user),
                userEmail: syncData.data?.user?.email,
                hasCompletedOnboarding: syncData.data?.user?.hasCompletedOnboarding,
                hasCompletedOnboardingType: typeof syncData.data?.user?.hasCompletedOnboarding,
              });

              if (syncData.data?.user) {
                const syncedUser = {
                  id: syncData.data.user.id,
                  email: syncData.data.user.email,
                  name: syncData.data.user.name,
                  picture: syncData.data.user.picture,
                  hasCompletedOnboarding: syncData.data.user.hasCompletedOnboarding,
                  createdAt: syncData.data.user.createdAt,
                };
                setBackendUser(syncedUser);
                console.log('✅ AuthContext: Backend user set after sync:', {
                  email: syncedUser.email,
                  hasCompletedOnboarding: syncedUser.hasCompletedOnboarding,
                  hasCompletedOnboardingType: typeof syncedUser.hasCompletedOnboarding,
                });
                // User is now synced and authenticated
                return;
              } else {
                console.error('❌ AuthContext: Sync response missing user data');
              }
            } else {
              console.error(
                '❌ AuthContext: Sync request failed with status:',
                syncResponse.status,
              );
            }
          } catch (syncError) {
            console.error('Failed to sync with backend:', syncError);
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

  console.log('👤 AuthContext: User state determined:', {
    hasBackendUser: Boolean(user),
    hasFallbackUser: Boolean(fallbackUser),
    effectiveUserEmail: effectiveUser?.email,
    effectiveUserHasCompletedOnboarding: effectiveUser?.hasCompletedOnboarding,
    isCheckingBackendAuth,
    isSyncing,
    status,
  });

  const loading = status === 'loading' || isCheckingBackendAuth || isSyncing;
  const isAuthenticated = status === 'authenticated' || Boolean(backendUser);

  // Redirect to onboarding if needed (simplified logic)
  useEffect(() => {
    console.log('🚦 AuthContext: Redirect logic triggered:', {
      hasEffectiveUser: Boolean(effectiveUser),
      loading,
      effectiveUserEmail: effectiveUser?.email,
      hasCompletedOnboarding: effectiveUser?.hasCompletedOnboarding,
      currentPath: window.location.pathname,
    });

    if (!effectiveUser || loading) {
      console.log('⏸️ AuthContext: Skipping redirect (no user or still loading)');
      return;
    }

    const currentPath = window.location.pathname;
    const onboardingRequiredPaths = ['/feed', '/share-hand', '/profile'];
    const isOnOnboardingRequiredPath = onboardingRequiredPaths.some((path) =>
      currentPath.startsWith(path),
    );

    console.log('🚦 AuthContext: Evaluating redirect:', {
      currentPath,
      isOnOnboardingRequiredPath,
      hasCompletedOnboarding: effectiveUser.hasCompletedOnboarding,
    });

    // Only redirect if user is on a protected path but hasn't completed onboarding
    if (!effectiveUser.hasCompletedOnboarding && isOnOnboardingRequiredPath) {
      console.log('🔄 AuthContext: Redirecting to onboarding (user has not completed onboarding)');
      router.push('/onboarding');
    } else if (effectiveUser.hasCompletedOnboarding && currentPath === '/onboarding') {
      // If user completed onboarding but is on onboarding page, redirect to feed
      console.log('✅ AuthContext: Redirecting to feed (onboarding already complete)');
      router.push('/feed');
    } else {
      console.log('🚦 AuthContext: No redirect needed');
    }
  }, [effectiveUser, loading, router]);

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
