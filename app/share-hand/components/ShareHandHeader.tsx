'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ShareHandHeader = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-200 mb-1 sm:mb-2 truncate">Share Your Hand</h1>
        <p className="text-slate-400 text-xs sm:text-sm md:text-base">Tell the community about your poker experience</p>
      </div>
      <Button 
        variant="outline" 
        className="border-slate-700/50 text-slate-300 w-full sm:w-auto text-sm shrink-0"
        onClick={() => router.push('/feed')}
      >
        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
        <span className="hidden sm:inline">Back to Feed</span>
        <span className="sm:hidden">Back</span>
      </Button>
    </div>
  );
};

export default ShareHandHeader;