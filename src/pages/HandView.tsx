
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { ShareHandFormData } from '@/types/shareHand';
import HandDisplay from '@/components/share-hand/HandDisplay';
import { sharedHandsStore, SharedHand } from '@/stores/sharedHandsStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HandViewContent = () => {
  const { isCollapsed } = useSidebar();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [handData, setHandData] = useState<SharedHand | null>(null);

  useEffect(() => {
    const handId = searchParams.get('id');
    if (handId) {
      const hand = sharedHandsStore.getHandById(handId);
      if (hand) {
        setHandData(hand);
      } else {
        // Hand not found, redirect to feed
        navigate('/feed');
      }
    } else {
      // No ID provided, show dummy data
      setHandData({
        id: 'dummy',
        formData: {
          gameType: 'No Limit Hold\'em',
          gameFormat: 'cash',
          stackSize: '100',
          heroPosition: 'BTN',
          villainPosition: 'BB',
          heroStackSize: [98],
          villainStackSize: [102],
          holeCards: ['As', 'Kh'],
          flopCards: ['Qd', 'Jc', '9s'],
          turnCard: ['Tc'],
          riverCard: ['8h'],
          preflopActions: [
            {
              playerId: 'hero',
              playerName: 'Hero',
              isHero: true,
              action: 'raise',
              betAmount: '3',
              completed: true
            },
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'call',
              betAmount: '3',
              completed: true
            }
          ],
          preflopDescription: 'Standard open with AKo from the button. Villain calls from BB which is typical for this position.',
          flopActions: [
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'check',
              completed: true
            },
            {
              playerId: 'hero',
              playerName: 'Hero',
              isHero: true,
              action: 'bet',
              betAmount: '4.5',
              completed: true
            },
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'call',
              betAmount: '4.5',
              completed: true
            }
          ],
          flopDescription: 'Great flop for our hand - we have top pair top kicker plus a gutshot straight draw. Betting for value and protection against draws.',
          turnActions: [
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'check',
              completed: true
            },
            {
              playerId: 'hero',
              playerName: 'Hero',
              isHero: true,
              action: 'bet',
              betAmount: '12',
              completed: true
            },
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'raise',
              betAmount: '35',
              completed: true
            },
            {
              playerId: 'hero',
              playerName: 'Hero',
              isHero: true,
              action: 'call',
              betAmount: '35',
              completed: true
            }
          ],
          turnDescription: 'Turn completes our straight! When villain check-raises big, they likely have a strong hand but we have the nuts. Easy call.',
          riverActions: [
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'bet',
              betAmount: '65',
              completed: true
            },
            {
              playerId: 'hero',
              playerName: 'Hero',
              isHero: true,
              action: 'raise',
              betAmount: '150',
              completed: true
            },
            {
              playerId: 'villain',
              playerName: 'Villain',
              isHero: false,
              action: 'fold',
              completed: true
            }
          ],
          riverDescription: 'River doesn\'t change much. Villain leads out big but we still have the nuts. Raised for value but villain folds - probably had two pair or a set.',
          title: 'Nut Straight vs Aggressive Villain - BTN vs BB',
          description: 'Great example of how position and hand reading come together. Started with a premium hand, flopped well, and turned the nuts. The key was recognizing villain\'s aggression pattern and extracting maximum value while being ready to stack off with the nuts.'
        },
        tags: ['cash-game', 'button-vs-bb', 'nut-straight', 'value-betting', 'hand-reading'],
        authorName: 'Alex Rivera',
        authorUsername: '@pokerwizard',
        authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 83,
        comments: 14
      });
    }
  }, [searchParams, navigate]);

  const getPositionName = (position: string) => {
    const positions: { [key: string]: string } = {
      'UTG': 'Under The Gun',
      'MP': 'Middle Position',
      'CO': 'Cutoff',
      'BTN': 'Button',
      'SB': 'Small Blind',
      'BB': 'Big Blind'
    };
    return positions[position] || position;
  };

  const getCurrencySymbol = () => '$';

  const calculatePotSize = () => {
    if (!handData) return 0;
    
    // Calculate pot size based on all actions
    let pot = 0;
    
    // Add preflop actions
    handData.formData.preflopActions.forEach(action => {
      if (action.betAmount && (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
        pot += parseFloat(action.betAmount);
      }
    });
    
    // Add flop actions
    handData.formData.flopActions.forEach(action => {
      if (action.betAmount && (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
        pot += parseFloat(action.betAmount);
      }
    });
    
    // Add turn actions
    handData.formData.turnActions.forEach(action => {
      if (action.betAmount && (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
        pot += parseFloat(action.betAmount);
      }
    });
    
    // Add river actions (only completed actions)
    handData.formData.riverActions.forEach(action => {
      if (action.completed && action.betAmount && (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
        pot += parseFloat(action.betAmount);
      }
    });
    
    return pot;
  };

  if (!handData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading hand...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/feed')}
              className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
            
            <HandDisplay
              formData={handData.formData}
              tags={handData.tags}
              getPositionName={getPositionName}
              getCurrencySymbol={getCurrencySymbol}
              calculatePotSize={calculatePotSize}
              authorName={handData.authorName}
              authorUsername={handData.authorUsername}
              authorAvatar={handData.authorAvatar}
              createdAt={handData.createdAt}
              likes={handData.likes}
              comments={handData.comments}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const HandView = () => {
  return (
    <SidebarProvider>
      <HandViewContent />
    </SidebarProvider>
  );
};

export default HandView;
