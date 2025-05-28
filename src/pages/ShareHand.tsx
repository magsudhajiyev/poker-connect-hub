import { useState } from 'react';
import { ProfileTopBar } from '@/components/profile/ProfileTopBar';
import { GlobalSidebar, SidebarProvider, useSidebar } from '@/components/GlobalSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Share2, Upload, Camera, Plus, X, Check } from 'lucide-react';
import CardSelector from '@/components/CardSelector';

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
    gameFormat: '', // MTT or Cash Game
    stackSize: '',
    heroPosition: '',
    villainPosition: '',
    heroStackSize: [100], // Array for slider value
    villainStackSize: [100], // Array for slider value
    heroCards: { card1: '', card2: '' },
    preflopActions: [] as ActionStep[],
    preflopDescription: '',
    flopCards: { card1: '', card2: '', card3: '' },
    flopActions: [] as ActionStep[],
    flopDescription: '',
    turnCard: '',
    turnActions: [] as ActionStep[],
    turnDescription: '',
    riverCard: '',
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

  // Get all selected cards to disable them in future selections
  const getSelectedCards = () => {
    const selected: string[] = [];
    
    // Add hero cards
    if (formData.heroCards.card1) selected.push(formData.heroCards.card1);
    if (formData.heroCards.card2) selected.push(formData.heroCards.card2);
    
    // Add flop cards
    if (formData.flopCards.card1) selected.push(formData.flopCards.card1);
    if (formData.flopCards.card2) selected.push(formData.flopCards.card2);
    if (formData.flopCards.card3) selected.push(formData.flopCards.card3);
    
    // Add turn card
    if (formData.turnCard) selected.push(formData.turnCard);
    
    // Add river card
    if (formData.riverCard) selected.push(formData.riverCard);
    
    return selected;
  };

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
    // TODO: Implement submission logic
  };

  const getStackSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Stack Size ($)' : 'Stack Size (BB)';
  };

  const getStackSizePlaceholder = () => {
    return formData.gameFormat === 'cash' ? '200' : '100';
  };

  const getCurrencySymbol = () => {
    return formData.gameFormat === 'cash' ? '$' : 'BB';
  };

  const getBetSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Bet Size ($)' : 'Bet Size (BB)';
  };

  // Calculate pot size
  const calculatePotSize = () => {
    let potSize = 0;
    
    // Add blinds for preflop
    if (formData.gameFormat === 'cash') {
      potSize += 1.5; // Assume $0.5 SB + $1 BB for cash
    } else {
      potSize += 1.5; // Assume 0.5 SB + 1 BB for tournament
    }
    
    // Add all bets from all streets
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

  // Position order for action flow
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

  const getAvailableActions = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', playerIndex: number) => {
    const actions = formData[street];
    const currentPlayerAction = actions[playerIndex];
    
    // Check if there's a bet or raise before this action
    const previousActions = actions.slice(0, playerIndex);
    const lastAction = previousActions[previousActions.length - 1];
    
    let availableActions = ['fold'];
    
    if (!lastAction || !lastAction.action) {
      // First to act or no previous action
      availableActions = ['fold', 'check', 'bet'];
    } else if (lastAction.action === 'check') {
      // Previous player checked
      availableActions = ['fold', 'check', 'bet'];
    } else if (lastAction.action === 'bet' || lastAction.action === 'raise') {
      // Previous player bet or raised
      availableActions = ['fold', 'call', 'raise'];
    } else if (lastAction.action === 'call') {
      // Previous player called
      availableActions = ['fold', 'check', 'bet'];
    }
    
    return availableActions;
  };

  const updateAction = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', playerIndex: number, action: string, betAmount?: string) => {
    const actions = [...formData[street]];
    if (actions.length === 0) {
      const newActions = initializeActions(street);
      setFormData({...formData, [street]: newActions});
      return;
    }
    
    // For call action, get the bet amount from previous action
    let finalBetAmount = betAmount;
    if (action === 'call') {
      const previousActions = actions.slice(0, playerIndex);
      const lastBetAction = previousActions.reverse().find(a => a.action === 'bet' || a.action === 'raise');
      finalBetAmount = lastBetAction?.betAmount || '0';
    }
    
    actions[playerIndex] = {
      ...actions[playerIndex],
      action,
      betAmount: finalBetAmount,
      completed: true
    };
    
    // If this was a bet or raise, add another action for the opponent
    if ((action === 'bet' || action === 'raise') && actions.length === playerIndex + 1) {
      const currentPlayer = actions[playerIndex];
      const opponentIsHero = !currentPlayer.isHero;
      
      actions.push({
        playerId: opponentIsHero ? 'hero' : 'villain',
        playerName: opponentIsHero ? 'Hero' : 'Villain',
        isHero: opponentIsHero,
        completed: false
      });
    }
    
    setFormData({...formData, [street]: actions});
  };

  const renderActionFlow = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions') => {
    let actions = formData[street];
    
    if (actions.length === 0) {
      actions = initializeActions(street);
      setFormData({...formData, [street]: actions});
    }
    
    return (
      <div className="space-y-4">
        <h4 className="text-md font-medium text-slate-300">Action Flow</h4>
        {actions.map((actionStep, index) => {
          const availableActions = getAvailableActions(street, index);
          
          return (
            <div key={`${actionStep.playerId}-${index}`} className="border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`font-medium ${actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'}`}>
                  {actionStep.playerName} ({getPositionName(actionStep.isHero ? formData.heroPosition : formData.villainPosition)})
                </span>
                {actionStep.completed && (
                  <Check className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300">Action</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {availableActions.map((action) => (
                      <Button
                        key={action}
                        variant={actionStep.action === action ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateAction(street, index, action)}
                        className={`${
                          actionStep.action === action 
                            ? 'bg-emerald-500 text-slate-900' 
                            : 'border-slate-700/50 text-slate-300'
                        }`}
                      >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {(actionStep.action === 'bet' || actionStep.action === 'raise') && (
                  <div>
                    <Label className="text-slate-300">{getBetSizeLabel()}</Label>
                    <Input
                      value={actionStep.betAmount || ''}
                      onChange={(e) => updateAction(street, index, actionStep.action!, e.target.value)}
                      placeholder="2.5"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                    />
                  </div>
                )}

                {actionStep.action === 'call' && actionStep.betAmount && (
                  <div>
                    <Label className="text-slate-300">Call Amount</Label>
                    <div className="text-emerald-400 font-medium">
                      {getCurrencySymbol()}{actionStep.betAmount}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    const potSize = calculatePotSize();
    const showPot = currentStep > 0; // Show pot on all screens except Game Setup
    const selectedCards = getSelectedCards();

    switch (currentStep) {
      case 0: // Game Setup
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Game Setup</h3>
            
            {/* Game Format Selection with Toggle Buttons */}
            <div>
              <Label className="text-slate-300 mb-3 block">Game Format</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={formData.gameFormat === 'mtt' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, gameFormat: 'mtt'})}
                  className={`h-16 flex flex-col items-center justify-center relative ${
                    formData.gameFormat === 'mtt' 
                      ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                      : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {formData.gameFormat === 'mtt' && (
                    <Check className="absolute top-2 right-2 w-4 h-4" />
                  )}
                  <span className="font-medium">MTT</span>
                  <span className="text-xs opacity-75">Multi-Table Tournament</span>
                </Button>
                
                <Button
                  variant={formData.gameFormat === 'cash' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, gameFormat: 'cash'})}
                  className={`h-16 flex flex-col items-center justify-center relative ${
                    formData.gameFormat === 'cash' 
                      ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                      : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {formData.gameFormat === 'cash' && (
                    <Check className="absolute top-2 right-2 w-4 h-4" />
                  )}
                  <span className="font-medium">Cash Game</span>
                  <span className="text-xs opacity-75">Real Money Cash</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="game-type" className="text-slate-300">Game Type</Label>
                <Select value={formData.gameType} onValueChange={(value) => setFormData({...formData, gameType: value})}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="nlhe">No Limit Hold'em</SelectItem>
                    <SelectItem value="plo">Pot Limit Omaha</SelectItem>
                    <SelectItem value="stud">Seven Card Stud</SelectItem>
                    <SelectItem value="mixed">Mixed Games</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="stack-size" className="text-slate-300">{getStackSizeLabel()}</Label>
                <Input
                  id="stack-size"
                  value={formData.stackSize}
                  onChange={(e) => setFormData({...formData, stackSize: e.target.value})}
                  placeholder={getStackSizePlaceholder()}
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hero Position and Stack */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hero-position" className="text-slate-300">Hero Position</Label>
                  <Select value={formData.heroPosition} onValueChange={(value) => setFormData({...formData, heroPosition: value})}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="utg">UTG</SelectItem>
                      <SelectItem value="mp">Middle Position</SelectItem>
                      <SelectItem value="co">Cut Off</SelectItem>
                      <SelectItem value="btn">Button</SelectItem>
                      <SelectItem value="sb">Small Blind</SelectItem>
                      <SelectItem value="bb">Big Blind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-slate-300 mb-3 block">
                    Hero Stack Size: {formData.gameFormat === 'cash' ? '$' : ''}{formData.heroStackSize[0]}{formData.gameFormat === 'mtt' ? ' BB' : ''}
                  </Label>
                  <Slider
                    value={formData.heroStackSize}
                    onValueChange={(value) => setFormData({...formData, heroStackSize: value})}
                    max={formData.gameFormat === 'cash' ? 1000 : 200}
                    min={1}
                    step={formData.gameFormat === 'cash' ? 10 : 1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1{formData.gameFormat === 'cash' ? '0' : ''}</span>
                    <span>{formData.gameFormat === 'cash' ? '1000' : '200'}{formData.gameFormat === 'mtt' ? ' BB' : ''}</span>
                  </div>
                </div>
              </div>
              
              {/* Villain Position and Stack */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="villain-position" className="text-slate-300">Villain Position</Label>
                  <Select value={formData.villainPosition} onValueChange={(value) => setFormData({...formData, villainPosition: value})}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="utg">UTG</SelectItem>
                      <SelectItem value="mp">Middle Position</SelectItem>
                      <SelectItem value="co">Cut Off</SelectItem>
                      <SelectItem value="btn">Button</SelectItem>
                      <SelectItem value="sb">Small Blind</SelectItem>
                      <SelectItem value="bb">Big Blind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-slate-300 mb-3 block">
                    Villain Stack Size: {formData.gameFormat === 'cash' ? '$' : ''}{formData.villainStackSize[0]}{formData.gameFormat === 'mtt' ? ' BB' : ''}
                  </Label>
                  <Slider
                    value={formData.villainStackSize}
                    onValueChange={(value) => setFormData({...formData, villainStackSize: value})}
                    max={formData.gameFormat === 'cash' ? 1000 : 200}
                    min={1}
                    step={formData.gameFormat === 'cash' ? 10 : 1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1{formData.gameFormat === 'cash' ? '0' : ''}</span>
                    <span>{formData.gameFormat === 'cash' ? '1000' : '200'}{formData.gameFormat === 'mtt' ? ' BB' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Preflop
        return (
          <div className="space-y-6">
            {showPot && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-center">
                  <span className="text-slate-300">Current Pot: </span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {getCurrencySymbol()}{potSize.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-slate-200 mb-4">Preflop Action</h3>
            
            {/* Hole Cards Selection */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">Your Hole Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardSelector
                  label="First Card"
                  value={formData.heroCards.card1}
                  onChange={(card) => setFormData({
                    ...formData,
                    heroCards: { ...formData.heroCards, card1: card }
                  })}
                  disabledCards={selectedCards.filter(c => c !== formData.heroCards.card1)}
                />
                <CardSelector
                  label="Second Card"
                  value={formData.heroCards.card2}
                  onChange={(card) => setFormData({
                    ...formData,
                    heroCards: { ...formData.heroCards, card2: card }
                  })}
                  disabledCards={selectedCards.filter(c => c !== formData.heroCards.card2)}
                />
              </div>
              
              {/* Cards Preview */}
              {formData.heroCards.card1 && formData.heroCards.card2 && (
                <div className="flex items-center space-x-3 pt-4">
                  <span className="text-slate-300 font-medium">Your Hand:</span>
                  <div className="flex space-x-2">
                    <div className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-sm ${
                      formData.heroCards.card1.includes('♥') || formData.heroCards.card1.includes('♦') ? 'text-red-400' : 'text-slate-200'
                    }`}>
                      {formData.heroCards.card1}
                    </div>
                    <div className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-sm ${
                      formData.heroCards.card2.includes('♥') || formData.heroCards.card2.includes('♦') ? 'text-red-400' : 'text-slate-200'
                    }`}>
                      {formData.heroCards.card2}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {renderActionFlow('preflopActions')}

            <div>
              <Label htmlFor="preflop-description" className="text-slate-300">Preflop Insights (Optional)</Label>
              <Textarea
                id="preflop-description"
                value={formData.preflopDescription}
                onChange={(e) => setFormData({...formData, preflopDescription: e.target.value})}
                placeholder="Describe your thoughts, reads, or situation before the flop..."
                rows={3}
                className="bg-slate-900/50 border-slate-700/50 text-slate-200"
              />
            </div>
          </div>
        );

      case 2: // Flop
        return (
          <div className="space-y-6">
            {showPot && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-center">
                  <span className="text-slate-300">Current Pot: </span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {getCurrencySymbol()}{potSize.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-slate-200 mb-4">Flop</h3>
            
            {/* Flop Cards Selection */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">Flop Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardSelector
                  label="First Flop Card"
                  value={formData.flopCards.card1}
                  onChange={(card) => setFormData({
                    ...formData,
                    flopCards: { ...formData.flopCards, card1: card }
                  })}
                  disabledCards={selectedCards.filter(c => c !== formData.flopCards.card1)}
                />
                <CardSelector
                  label="Second Flop Card"
                  value={formData.flopCards.card2}
                  onChange={(card) => setFormData({
                    ...formData,
                    flopCards: { ...formData.flopCards, card2: card }
                  })}
                  disabledCards={selectedCards.filter(c => c !== formData.flopCards.card2)}
                />
                <CardSelector
                  label="Third Flop Card"
                  value={formData.flopCards.card3}
                  onChange={(card) => setFormData({
                    ...formData,
                    flopCards: { ...formData.flopCards, card3: card }
                  })}
                  disabledCards={selectedCards.filter(c => c !== formData.flopCards.card3)}
                />
              </div>

              {/* Board Preview */}
              {formData.flopCards.card1 && formData.flopCards.card2 && formData.flopCards.card3 && (
                <div className="flex items-center space-x-3 pt-4">
                  <span className="text-slate-300 font-medium">Board:</span>
                  <div className="flex space-x-2">
                    {[formData.flopCards.card1, formData.flopCards.card2, formData.flopCards.card3].map((card, index) => (
                      <div key={index} className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-sm ${
                        card.includes('♥') || card.includes('♦') ? 'text-red-400' : 'text-slate-200'
                      }`}>
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderActionFlow('flopActions')}

            <div>
              <Label htmlFor="flop-description" className="text-slate-300">Flop Insights (Optional)</Label>
              <Textarea
                id="flop-description"
                value={formData.flopDescription}
                onChange={(e) => setFormData({...formData, flopDescription: e.target.value})}
                placeholder="Describe your thoughts about this flop texture, your hand strength, reads..."
                rows={3}
                className="bg-slate-900/50 border-slate-700/50 text-slate-200"
              />
            </div>
          </div>
        );

      case 3: // Turn
        return (
          <div className="space-y-6">
            {showPot && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-center">
                  <span className="text-slate-300">Current Pot: </span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {getCurrencySymbol()}{potSize.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-slate-200 mb-4">Turn</h3>
            
            {/* Turn Card Selection */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">Turn Card</h4>
              <div className="max-w-sm">
                <CardSelector
                  label="Turn Card"
                  value={formData.turnCard}
                  onChange={(card) => setFormData({ ...formData, turnCard: card })}
                  disabledCards={selectedCards.filter(c => c !== formData.turnCard)}
                />
              </div>

              {/* Board Preview with Turn */}
              {formData.flopCards.card1 && formData.flopCards.card2 && formData.flopCards.card3 && formData.turnCard && (
                <div className="flex items-center space-x-3 pt-4">
                  <span className="text-slate-300 font-medium">Board:</span>
                  <div className="flex space-x-2">
                    {[formData.flopCards.card1, formData.flopCards.card2, formData.flopCards.card3, formData.turnCard].map((card, index) => (
                      <div key={index} className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-sm ${
                        card.includes('♥') || card.includes('♦') ? 'text-red-400' : 'text-slate-200'
                      }`}>
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderActionFlow('turnActions')}

            <div>
              <Label htmlFor="turn-description" className="text-slate-300">Turn Insights (Optional)</Label>
              <Textarea
                id="turn-description"
                value={formData.turnDescription}
                onChange={(e) => setFormData({...formData, turnDescription: e.target.value})}
                placeholder="How did the turn card change the dynamics? Your reasoning for the action..."
                rows={3}
                className="bg-slate-900/50 border-slate-700/50 text-slate-200"
              />
            </div>
          </div>
        );

      case 4: // River
        return (
          <div className="space-y-6">
            {showPot && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-center">
                  <span className="text-slate-300">Final Pot: </span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {getCurrencySymbol()}{potSize.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-slate-200 mb-4">River & Summary</h3>
            
            {/* River Card Selection */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">River Card</h4>
              <div className="max-w-sm">
                <CardSelector
                  label="River Card"
                  value={formData.riverCard}
                  onChange={(card) => setFormData({ ...formData, riverCard: card })}
                  disabledCards={selectedCards.filter(c => c !== formData.riverCard)}
                />
              </div>

              {/* Final Board Preview */}
              {formData.flopCards.card1 && formData.flopCards.card2 && formData.flopCards.card3 && formData.turnCard && formData.riverCard && (
                <div className="flex items-center space-x-3 pt-4">
                  <span className="text-slate-300 font-medium">Final Board:</span>
                  <div className="flex space-x-2">
                    {[formData.flopCards.card1, formData.flopCards.card2, formData.flopCards.card3, formData.turnCard, formData.riverCard].map((card, index) => (
                      <div key={index} className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-sm ${
                        card.includes('♥') || card.includes('♦') ? 'text-red-400' : 'text-slate-200'
                      }`}>
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderActionFlow('riverActions')}

            <div>
              <Label htmlFor="title" className="text-slate-300">Hand Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Give your hand a catchy title"
                className="bg-slate-900/50 border-slate-700/50 text-slate-200"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">Hand Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Overall summary, final thoughts, outcome, what you learned..."
                rows={4}
                className="bg-slate-900/50 border-slate-700/50 text-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-3 block">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ProfileTopBar />
      
      <div className="flex pt-16">
        <GlobalSidebar />

        {/* Main Content */}
        <main className={`flex-1 px-4 py-6 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
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
                  
                  {/* Progress Bar */}
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
                {/* Step Content */}
                {renderStepContent()}

                {/* Navigation Buttons */}
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
                    {/* Show Share now button from Game Setup onwards, but not on final step */}
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
