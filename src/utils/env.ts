/**
 * Environment utility to handle both Vite and Next.js environments
 */

export const getEnvVar = (key: string): string | undefined => {
  // For Next.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  // For Vite (fallback)
  if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
    // @ts-expect-error - import.meta is available in Vite environment
    return import.meta.env[key];
  }

  return undefined;
};

export const isDevelopment = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }

  if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
    // @ts-expect-error - import.meta is available in Vite environment
    return import.meta.env.DEV;
  }

  return false;
};

export const isProduction = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }

  if (typeof window !== 'undefined' && (window as any).import?.meta?.env) {
    // @ts-expect-error - import.meta is available in Vite environment
    return import.meta.env.PROD;
  }

  return false;
};

export const getApiUrl = (): string => {
  // No longer needed - using Next.js API routes with relative paths
  return '/api';
};

export const getAppUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_APP_URL') || getEnvVar('VITE_APP_URL') || 'http://localhost:3000';
};

export const getGoogleClientId = (): string => {
  return getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || getEnvVar('VITE_GOOGLE_CLIENT_ID') || '';
};
