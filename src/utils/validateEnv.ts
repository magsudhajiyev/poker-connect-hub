/**
 * Validates environment variables and provides helpful warnings
 */
export function validateEnvironmentVariables() {
  const warnings: string[] = [];
  const errors: string[] = [];
  const isClient = typeof window !== 'undefined';

  // Note: NEXT_PUBLIC_API_URL is not required since we use Next.js API routes
  // The API routes are served from the same domain as the frontend

  // Only check server-side variables on the server
  if (!isClient) {
    // Check NextAuth configuration
    if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
      errors.push('NEXTAUTH_SECRET is required in production.');
    }

    if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
      warnings.push('NEXTAUTH_URL should be set in production.');
    }

    // Check Google OAuth
    if (!process.env.GOOGLE_CLIENT_ID) {
      warnings.push('GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
      warnings.push('GOOGLE_CLIENT_SECRET is not set. Google OAuth will not work.');
    }
  }

  // Log results
  if (errors.length > 0) {
    console.error('🚨 Environment Configuration Errors:');
    errors.forEach((error) => console.error(`   ❌ ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    warnings.forEach((warning) => console.warn(`   ⚠️  ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0 && process.env.NODE_ENV === 'development') {
    // Only log success in development
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

// Helper to check if backend is properly configured
export function isBackendConfigured(): boolean {
  // Since we use Next.js API routes, backend is always configured
  // API routes are served from the same domain as the frontend
  return true;
}
