
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ShareHandHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-200 mb-2">Share Your Hand</h1>
        <p className="text-slate-400">Tell the community about your poker experience</p>
      </div>
      <Button variant="outline" className="border-slate-700/50 text-slate-300">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Button>
    </div>
  );
};

export default ShareHandHeader;
