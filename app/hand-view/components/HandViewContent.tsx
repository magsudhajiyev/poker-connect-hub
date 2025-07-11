'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sharedHandsApi, SharedHand } from '@/services/sharedHandsApi';
import { GlobalSidebar, useSidebar } from '@/components/GlobalSidebar';
import { LazyHandReplay as HandReplay } from '../../share-hand/components/lazy-components';
import { getPositionName } from '@/utils/shareHandConstants';
import { HandViewHeader } from './HandViewHeader';
import { HandViewCard } from './HandViewCard';
import { HandViewComments } from './HandViewComments';
import { toast } from '@/hooks/use-toast';

interface HandViewContentProps {
  handId?: string;
}

export const HandViewContent = ({ handId: propHandId }: HandViewContentProps = {}) => {
  const { isCollapsed } = useSidebar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hand, setHand] = useState<SharedHand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHand = async (id: string) => {
      try {
        setIsLoading(true);
        const response = await sharedHandsApi.getSharedHand(id);

        if (response.success && response.data) {
          setHand(response.data);
        } else {
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to load hand',
            variant: 'destructive',
          });
        }
      } catch (_error) {
        toast({
          title: 'Error',
          description: 'Failed to load hand',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Use prop handId if provided, otherwise get from search params
    const handId = propHandId || searchParams.get('id');

    if (handId) {
      fetchHand(handId);
    } else {
      setIsLoading(false);
    }
  }, [propHandId, searchParams]);

  const getCurrencySymbol = () => {
    return hand?.gameFormat === 'cash' ? '$' : '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!hand) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-200 mb-4">Hand not found</h1>
          <Button
            onClick={() => router.push('/feed')}
            className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
          >
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

        <main
          className={`flex-1 min-w-0 px-2 sm:px-4 py-4 sm:py-6 transition-all duration-300 ${
            isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } pt-16 lg:pt-6`}
        >
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            <HandViewCard hand={hand} />

            {/* Street-by-Street Hand Replay */}
            <div className="w-full">
              <HandReplay
                formData={{
                  ...hand,
                  holeCards: hand.preflopCards?.holeCards
                    ? [
                        (hand.preflopCards.holeCards as any).card1,
                        (hand.preflopCards.holeCards as any).card2,
                      ].filter(Boolean)
                    : [],
                  heroPosition: (hand.positions as any)?.heroPosition || '',
                  villainPosition: (hand.positions as any)?.villainPosition || '',
                  players: (hand.positions as any)?.players || [],
                  smallBlind: (hand.analysis as any)?.smallBlind || '',
                  bigBlind: (hand.analysis as any)?.bigBlind || '',
                  ante: (hand.analysis as any)?.ante || false,
                  preflopDescription: (hand.analysis as any)?.preflopDescription || '',
                  flopDescription: (hand.analysis as any)?.flopDescription || '',
                  turnDescription: (hand.analysis as any)?.turnDescription || '',
                  riverDescription: (hand.analysis as any)?.riverDescription || '',
                  turnCard: hand.turnCard ? [hand.turnCard] : [],
                  riverCard: hand.riverCard ? [hand.riverCard] : [],
                  stackSize: '',
                  heroStackSize: [],
                  villainStackSize: [],
                  flopCards: hand.flopCards || [],
                  preflopActions: (hand.preflopActions as any) || [],
                  flopActions: (hand.flopActions as any) || [],
                  turnActions: (hand.turnActions as any) || [],
                  riverActions: (hand.riverActions as any) || [],
                }}
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
