
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sharedHandsStore, SharedHand } from '@/stores/sharedHandsStore';
import { GlobalSidebar, useSidebar } from '@/components/GlobalSidebar';
import HandReplay from '@/components/share-hand/HandReplay';
import { getPositionName } from '@/utils/shareHandConstants';
import { HandViewHeader } from './HandViewHeader';
import { HandViewCard } from './HandViewCard';
import { HandViewComments } from './HandViewComments';

export const HandViewContent = () => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [hand, setHand] = useState<SharedHand | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const handId = urlParams.get('id');
    
    if (handId) {
      const foundHand = sharedHandsStore.getHand(handId);
      setHand(foundHand);
    }
  }, [location.search]);

  const getCurrencySymbol = () => {
    return hand?.formData.gameFormat === 'cash' ? '$' : '';
  };

  if (!hand) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-200 mb-4">Hand not found</h1>
          <Button onClick={() => navigate('/feed')} className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 w-full overflow-x-hidden">
      <HandViewHeader hand={hand} />

      <div className="flex w-full">
        <div className="hidden lg:block">
          <GlobalSidebar />
        </div>

        <main className={`flex-1 min-w-0 px-2 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } pt-16 lg:pt-6`}>
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            <HandViewCard hand={hand} />

            {/* Street-by-Street Hand Replay */}
            <div className="w-full">
              <HandReplay
                formData={hand.formData}
                getPositionName={getPositionName}
                getCurrencySymbol={getCurrencySymbol}
              />
            </div>

            <HandViewComments hand={hand} />
          </div>
        </main>
      </div>
    </div>
  );
};
