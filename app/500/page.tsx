'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';

const Error500 = () => {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-red-600 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-slate-200 mb-2">Server Error</h2>
          <p className="text-slate-400 mb-8">
            Something went wrong on our end. Please try again later or contact support if the
            problem persists.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-slate-700/50 text-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error500;
