
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ShareHandHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-1 sm:mb-2">Share Your Hand</h1>
        <p className="text-slate-400 text-sm sm:text-base">Tell the community about your poker experience</p>
      </div>
      <Button variant="outline" className="border-slate-700/50 text-slate-300 w-full sm:w-auto">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Button>
    </div>
  );
};

export default ShareHandHeader;
