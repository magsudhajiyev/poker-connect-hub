'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

  const user = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    picture: session.user.image || undefined,
    hasCompletedOnboarding: (session.user as any).hasCompletedOnboarding || false,
    createdAt: new Date().toISOString(),
  } : null;

  const loading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const login = () => {
    // Navigate to sign in page
    router.push('/auth/signin');
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const refreshAuth = async () => {
    // NextAuth handles session refresh automatically
    // This is kept for compatibility
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