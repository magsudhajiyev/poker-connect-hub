import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || '';

// Debug logging for production
if (process.env.NODE_ENV === 'production') {
  console.log('Environment:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV
  });
}

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to Google OAuth
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
    console.log('Login redirect URL:', `${apiUrl}/auth/google`);
    window.location.href = `${apiUrl}/auth/google`;
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post('/auth/logout');
      setUser(null);
      // Use setTimeout to ensure state is cleared before redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if request fails
      setUser(null);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
    // Don't set isLoggingOut to false here since we're redirecting
  };

  const refreshAuth = async () => {
    try {
      await axios.post('/auth/refresh');
      // After successful refresh, check auth status again
      await checkAuthStatus();
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up axios interceptor for automatic token refresh
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && user) {
          // Try to refresh token
          try {
            await refreshAuth();
            // Retry the original request
            return axios.request(error.config);
          } catch (refreshError) {
            // Refresh failed, logout user
            setUser(null);
            window.location.href = '/auth';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isLoggingOut,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};