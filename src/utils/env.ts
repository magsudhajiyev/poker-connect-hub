/**
 * Environment utility to handle both Vite and Next.js environments
 */

export const getEnvVar = (key: string): string | undefined => {
  // For Next.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  // For Vite (fallback)
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env[key];
  }
  
  return undefined;
};

export const isDevelopment = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env.DEV;
  }
  
  return false;
};

export const isProduction = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env.PROD;
  }
  
  return false;
};

export const getApiUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_API_URL') || 
         getEnvVar('VITE_API_URL') || 
         'http://localhost:3001';
};

export const getAppUrl = (): string => {
  return getEnvVar('NEXT_PUBLIC_APP_URL') || 
         getEnvVar('VITE_APP_URL') || 
         'http://localhost:3000';
};

export const getGoogleClientId = (): string => {
  return getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || 
         getEnvVar('VITE_GOOGLE_CLIENT_ID') || 
         '';
};