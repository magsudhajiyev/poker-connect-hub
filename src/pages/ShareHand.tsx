import { useState, useEffect } from 'react';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Share2, Plus, X, Check } from 'lucide-react';
import BetSizingButtons from '@/components/BetSizingButtons';
import CardInput from '@/components/CardInput';
import GameSetupStep from '@/components/share-hand/GameSetupStep';
import PreflopStep from '@/components/share-hand/PreflopStep';
import FlopStep from '@/components/share-hand/FlopStep';
import TurnStep from '@/components/share-hand/TurnStep';
import RiverStep from '@/components/share-hand/RiverStep';
import ActionFlow from '@/components/share-hand/ActionFlow';
import PotDisplay from '@/components/share-hand/PotDisplay';
import SelectedCardsDisplay from '@/components/share-hand/SelectedCardsDisplay';

interface ActionStep {
  playerId: string;
  playerName: string;
  isHero: boolean;
  action?: string;
  betAmount?: string;
  completed: boolean;
}

const ShareHandContent = () => {
  const { isCollapsed } = useSidebar();
  const [currentStep, setCurrentStep] = useState(0);
  const [tags, setTags] = useState<string[]>(['bluff', 'tournament']);
  
  const [formData, setFormData] = useState({
    gameType: '',
    gameFormat: '',
    stackSize: '',
    heroPosition: '',
    villainPosition: '',
    heroStackSize: [100],
    villainStackSize: [100],
    holeCards: [] as string[],
    flopCards: [] as string[],
    turnCard: [] as string[],
    riverCard: [] as string[],
    preflopActions: [] as ActionStep[],
    preflopDescription: '',
    flopActions: [] as ActionStep[],
    flopDescription: '',
    turnActions: [] as ActionStep[],
    turnDescription: '',
    riverActions: [] as ActionStep[],
    title: '',
    description: ''
  });

  const steps = [
    { id: 'game-setup', title: 'Game Setup', description: 'Basic game information' },
    { id: 'preflop', title: 'Preflop', description: 'Preflop action and betting' },
    { id: 'flop', title: 'Flop', description: 'Flop cards and action' },
    { id: 'turn', title: 'Turn', description: 'Turn card and action' },
    { id: 'river', title: 'River', description: 'River card and final action' }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const positionOrder = ['utg', 'mp', 'co', 'btn', 'sb', 'bb'];
  
  const getPositionName = (position: string) => {
    const names: { [key: string]: string } = {
      'utg': 'UTG',
      'mp': 'Middle Position',
      'co': 'Cut Off',
      'btn': 'Button',
      'sb': 'Small Blind',
      'bb': 'Big Blind'
    };
    return names[position] || position;
  };

  const initializeActions = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions') => {
    if (!formData.heroPosition || !formData.villainPosition) return [];
    
    const heroIndex = positionOrder.indexOf(formData.heroPosition);
    const villainIndex = positionOrder.indexOf(formData.villainPosition);
    
    const actionOrder: ActionStep[] = [];
    
    if (heroIndex < villainIndex) {
      actionOrder.push({
        playerId: 'hero',
        playerName: 'Hero',
        isHero: true,
        completed: false
      });
      actionOrder.push({
        playerId: 'villain',
        playerName: 'Villain',
        isHero: false,
        completed: false
      });
    } else {
      actionOrder.push({
        playerId: 'villain',
        playerName: 'Villain',
        isHero: false,
        completed: false
      });
      actionOrder.push({
        playerId: 'hero',
        playerName: 'Hero',
        isHero: true,
        completed: false
      });
    }
    
    return actionOrder;
  };

  const getAvailableActions = (street: string, index: number) => {
    return ['fold', 'call', 'bet', 'raise', 'check'];
  };

  const getActionButtonClass = (action: string, isSelected: boolean) => {
    const baseClass = "transition-colors";
    if (isSelected) {
      return `${baseClass} bg-emerald-500 text-slate-900`;
    }
    return `${baseClass} border-slate-700/50 text-slate-300 hover:bg-slate-800/50`;
  };

  const addNextActionStep = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', currentIndex: number) => {
    const actions = formData[street];
    const currentAction = actions[currentIndex];
    
    console.log(`Processing action: ${currentAction.action} by ${currentAction.playerName} at index ${currentIndex}`);
    
    // If this action requires a response (bet, raise), add the next player's action
    if (currentAction.action === 'bet' || currentAction.action === 'raise') {
      // For a raise, we need to give the original bettor a chance to respond
      if (currentAction.action === 'raise') {
        // Find the original bettor (the player who made the first bet in this sequence)
        const originalBettor = actions.find((action, index) => 
          index < currentIndex && action.action === 'bet'
        );
        
        if (originalBettor) {
          // Check if the original bettor already has a subsequent action
          const originalBettorHasResponse = actions.find((action, index) => 
            index > currentIndex && action.playerId === originalBettor.playerId
          );
          
          if (!originalBettorHasResponse) {
            const newActionStep: ActionStep = {
              playerId: originalBettor.playerId,
              playerName: originalBettor.playerName,
              isHero: originalBettor.isHero,
              completed: false
            };
            
            const updatedActions = [...actions];
            updatedActions.push(newActionStep);
            
            console.log(`Adding response action for original bettor ${originalBettor.playerName} after raise`, updatedActions);
            
            setFormData({ ...formData, [street]: updatedActions });
            return;
          }
        }
      }
      
      // For a regular bet or if no original bettor found, add next player action
      const nextPlayerId = currentAction.isHero ? 'villain' : 'hero';
      const nextPlayerName = currentAction.isHero ? 'Villain' : 'Hero';
      
      // Check if next action step already exists
      const nextActionExists = actions.find((action, index) => 
        index > currentIndex && action.playerId === nextPlayerId
      );
      
      if (!nextActionExists) {
        const newActionStep: ActionStep = {
          playerId: nextPlayerId,
          playerName: nextPlayerName,
          isHero: !currentAction.isHero,
          completed: false
        };
        
        const updatedActions = [...actions];
        updatedActions.push(newActionStep);
        
        console.log(`Adding next action step for ${nextPlayerName} after ${currentAction.action}`, updatedActions);
        
        setFormData({ ...formData, [street]: updatedActions });
      }
    }
  };

  const updateAction = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', index: number, action: string, betAmount?: string) => {
    console.log(`Updating action at index ${index} on ${street}:`, action, betAmount);
    
    const updatedActions = [...formData[street]];
    updatedActions[index] = {
      ...updatedActions[index],
      action,
      betAmount: betAmount || updatedActions[index].betAmount,
      completed: true
    };
    
    setFormData({ ...formData, [street]: updatedActions });
    
    // Add next action step if needed
    addNextActionStep(street, index);
  };

  const handleBetSizeSelect = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', index: number, amount: string) => {
    const updatedActions = [...formData[street]];
    updatedActions[index] = {
      ...updatedActions[index],
      betAmount: amount
    };
    setFormData({ ...formData, [street]: updatedActions });
  };

  const calculatePotSize = () => {
    let potSize = 0;
    
    if (formData.gameFormat === 'cash') {
      potSize += 1.5;
    } else {
      potSize += 1.5;
    }
    
    const allActions = [
      ...formData.preflopActions,
      ...formData.flopActions,
      ...formData.turnActions,
      ...formData.riverActions
    ];
    
    allActions.forEach(action => {
      if (action.betAmount && (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
        potSize += parseFloat(action.betAmount) || 0;
      }
    });
    
    return potSize;
  };

  const getCurrencySymbol = () => {
    return formData.gameFormat === 'cash' ? '$' : 'BB';
  };

  useEffect(() => {
    if (formData.heroPosition && formData.villainPosition) {
      const streets: Array<'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions'> = [
        'preflopActions', 'flopActions', 'turnActions', 'riverActions'
      ];
      
      const updatedFormData = { ...formData };
      let hasChanges = false;
      
      streets.forEach(street => {
        if (updatedFormData[street].length === 0) {
          updatedFormData[street] = initializeActions(street);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setFormData(updatedFormData);
      }
    }
  }, [formData.heroPosition, formData.villainPosition]);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting hand:', formData, tags);
  };

  const renderStepContent = () => {
    const potSize = calculatePotSize();
    const showPot = currentStep > 0;

    const commonProps = {
      formData,
      setFormData,
      getPositionName,
      getCurrencySymbol,
      calculatePotSize,
      getAvailableActions,
      updateAction,
      getActionButtonClass,
      handleBetSizeSelect
    };

    switch (currentStep) {
      case 0:
        return <GameSetupStep {...commonProps} />;
      case 1:
        return <PreflopStep {...commonProps} showPot={showPot} />;
      case 2:
        return <FlopStep {...commonProps} showPot={showPot} />;
      case 3:
        return <TurnStep {...commonProps} showPot={showPot} />;
      case 4:
        return <RiverStep {...commonProps} showPot={showPot} tags={tags} addTag={addTag} removeTag={removeTag} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
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

            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardHeader>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-200">Hand Details</h2>
                  
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-slate-400">
                      {steps.map((step, index) => (
                        <span key={step.id} className={index <= currentStep ? 'text-emerald-400' : ''}>
                          {step.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {renderStepContent()}

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="border-slate-700/50 text-slate-300 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-3">
                    {currentStep > 0 && currentStep < steps.length - 1 && (
                      <Button
                        variant="outline"
                        onClick={handleSubmit}
                        className="border-slate-700/50 text-slate-300"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Now
                      </Button>
                    )}
                    
                    {currentStep < steps.length - 1 ? (
                      <Button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-emerald-500 to-violet-500 text-slate-900"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Complete & Share
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const ShareHand = () => {
  return (
    <SidebarProvider>
      <ShareHandContent />
    </SidebarProvider>
  );
};

export default ShareHand;
