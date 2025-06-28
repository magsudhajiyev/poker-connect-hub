'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
      // Only check backend auth if there's no NextAuth session
      if (status === 'authenticated' || status === 'loading') {
        setIsCheckingBackendAuth(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3001/auth/me', {
          withCredentials: true,
        });

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
  const user = session?.user
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
    : backendUser;

  const loading = status === 'loading' || isCheckingBackendAuth;
  const isAuthenticated = status === 'authenticated' || Boolean(backendUser);

  const login = () => {
    // Navigate to sign in page
    router.push('/auth/signin');
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // If user is authenticated via backend, call backend logout
      if (backendUser && !session) {
        await axios.post(
          'http://localhost:3001/auth/logout',
          {},
          {
            withCredentials: true,
          },
        );
        setBackendUser(null);
      } else {
        // Otherwise use NextAuth signOut
        await signOut({ redirect: false });
      }
      router.push('/');
    } catch {
      console.error('Logout error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const refreshAuth = async () => {
    // NextAuth handles session refresh automatically
    // For backend auth, we can re-check the auth status
    if (!session && backendUser) {
      try {
        const response = await axios.get('http://localhost:3001/auth/me', {
          withCredentials: true,
        });

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
