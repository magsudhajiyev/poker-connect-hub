/**
 * Validates environment variables and provides helpful warnings
 */
export function validateEnvironmentVariables() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check NEXT_PUBLIC_API_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    errors.push('NEXT_PUBLIC_API_URL is not set. Backend communication will fail.');
  } else if (apiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    warnings.push(
      'NEXT_PUBLIC_API_URL contains localhost in production. Make sure backend is deployed.',
    );
  }

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return Boolean(
    apiUrl && (process.env.NODE_ENV === 'development' || !apiUrl.includes('localhost')),
  );
}
