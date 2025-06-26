import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SharedHand } from '@/stores/sharedHandsStore';
import { MobileSidebar } from './MobileSidebar';

interface HandViewHeaderProps {
  hand: SharedHand;
}

export const HandViewHeader = ({ hand }: HandViewHeaderProps) => {
  const router = useRouter();

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 lg:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <h1 className="text-lg font-semibold text-slate-200">Hand Analysis</h1>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/feed')}
          className="border-slate-700/50 text-slate-300 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 w-fit">
          <TrendingUp className="w-3 h-3 mr-1" />
          {hand.formData.gameFormat === 'mtt' ? 'Tournament' : 'Cash Game'}
        </Badge>
      </div>
    </>
  );
};
