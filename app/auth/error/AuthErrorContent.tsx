'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access was denied. You may not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  OAuthSignin: 'Error occurred while signing in with OAuth provider.',
  OAuthCallback: 'Error occurred during OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
  EmailCreateAccount: 'Could not create email provider user in the database.',
  Callback: 'Error occurred during callback.',
  OAuthAccountNotLinked:
    'To confirm your identity, sign in with the same account you used originally.',
  EmailSignin: 'The email could not be sent.',
  CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred. Please try again.',
};

export default function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
              <p className="text-slate-400">{errorMessage}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/auth/signin" className="flex-1">
                <Button variant="outline" className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="default" className="w-full">
                  Go Home
                </Button>
              </Link>
            </div>

            {error === 'AccessDenied' && (
              <div className="text-sm text-slate-500 mt-4">
                <p>If you continue to experience issues, please ensure:</p>
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>Your Google account is not restricted</li>
                  <li>You have allowed the necessary permissions</li>
                  <li>Try clearing your browser cookies and cache</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
