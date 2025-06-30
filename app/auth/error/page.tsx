import { Suspense } from 'react';
import AuthErrorContent from './AuthErrorContent';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-red-500/20 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-64 bg-slate-700/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
