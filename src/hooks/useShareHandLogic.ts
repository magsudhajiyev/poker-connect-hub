import { useState, useEffect } from 'react';

interface ActionStep {
  playerId: string;
  playerName: string;
  isHero: boolean;
  action?: string;
  betAmount?: string;
  completed: boolean;
}

export const useShareHandLogic = () => {
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

  const removeSubsequentActions = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', fromIndex: number) => {
    const actions = formData[street];
    const updatedActions = actions.slice(0, fromIndex + 1);
    
    console.log(`Removing subsequent actions after index ${fromIndex} on ${street}`, updatedActions);
    
    setFormData({ ...formData, [street]: updatedActions });
  };

  const addNextActionStep = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', currentIndex: number) => {
    const actions = formData[street];
    const currentAction = actions[currentIndex];
    
    console.log(`Processing action: ${currentAction.action} by ${currentAction.playerName} at index ${currentIndex}`);
    
    if (currentAction.action === 'bet' || currentAction.action === 'raise') {
      if (currentAction.action === 'raise') {
        const originalBettor = actions.find((action, index) => 
          index < currentIndex && action.action === 'bet'
        );
        
        if (originalBettor) {
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
      
      const nextPlayerId = currentAction.isHero ? 'villain' : 'hero';
      const nextPlayerName = currentAction.isHero ? 'Villain' : 'Hero';
      
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
    const previousAction = updatedActions[index].action;
    
    updatedActions[index] = {
      ...updatedActions[index],
      action,
      betAmount: betAmount || updatedActions[index].betAmount,
      completed: action !== 'bet' && action !== 'raise' // Don't mark bet/raise as completed until bet size is set
    };
    
    // If action changed from bet/raise to fold/check, remove subsequent actions
    if ((previousAction === 'bet' || previousAction === 'raise') && 
        (action === 'fold' || action === 'check')) {
      console.log(`Action changed from ${previousAction} to ${action}, removing subsequent actions`);
      const actionsToKeep = updatedActions.slice(0, index + 1);
      setFormData({ ...formData, [street]: actionsToKeep });
      return;
    }
    
    // If changing from any action to bet/raise, also remove subsequent actions first
    if (action === 'bet' || action === 'raise') {
      removeSubsequentActions(street, index);
      // Update with the new action
      const cleanedActions = [...formData[street]];
      cleanedActions[index] = {
        ...cleanedActions[index],
        action,
        betAmount: betAmount || cleanedActions[index].betAmount,
        completed: false // Don't mark as completed until bet size is set
      };
      setFormData({ ...formData, [street]: cleanedActions });
      
      // Immediately add next action step for bet/raise
      setTimeout(() => {
        addNextActionStep(street, index);
      }, 0);
      return;
    }
    
    setFormData({ ...formData, [street]: updatedActions });
  };

  const handleBetSizeSelect = (street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions', index: number, amount: string) => {
    console.log(`Bet size selected: ${amount} for index ${index} on ${street}`);
    
    const updatedActions = [...formData[street]];
    
    updatedActions[index] = {
      ...updatedActions[index],
      betAmount: amount,
      completed: true // Mark as completed when bet size is selected
    };
    
    setFormData({ ...formData, [street]: updatedActions });
  };

  const validateCurrentStep = () => {
    if (currentStep === 0) return { isValid: true, message: '' };
    
    const streetName = ['preflopActions', 'flopActions', 'turnActions', 'riverActions'][currentStep - 1] as 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions';
    const actions = formData[streetName];
    
    // Check if any bet/raise action is missing bet amount
    const incompleteBetAction = actions.find(action => 
      (action.action === 'bet' || action.action === 'raise') && 
      (!action.betAmount || action.betAmount.trim() === '')
    );
    
    if (incompleteBetAction) {
      return {
        isValid: false,
        message: `Please specify the bet size for ${incompleteBetAction.playerName}'s ${incompleteBetAction.action} before proceeding.`
      };
    }
    
    return { isValid: true, message: '' };
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
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      alert(validation.message); // Simple alert for now, could be replaced with toast
      return;
    }
    
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
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    
    console.log('Submitting hand:', formData, tags);
  };

  return {
    currentStep,
    setCurrentStep,
    tags,
    formData,
    setFormData,
    steps,
    getPositionName,
    getAvailableActions,
    getActionButtonClass,
    updateAction,
    handleBetSizeSelect,
    calculatePotSize,
    getCurrencySymbol,
    addTag,
    removeTag,
    nextStep,
    prevStep,
    handleSubmit
  };
};
