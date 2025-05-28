
import { useState, useEffect } from 'react';
import { ShareHandFormData, StreetType, ActionStep } from '@/types/shareHand';
import { steps, getPositionName } from '@/utils/shareHandConstants';
import { 
  initializeActions, 
  getAvailableActions, 
  getActionButtonClass, 
  createNextActionStep, 
  shouldAddNextAction 
} from '@/utils/shareHandActions';
import { validateCurrentStep } from '@/utils/shareHandValidation';
import { calculatePotSize, getCurrencySymbol, getAllSelectedCards } from '@/utils/shareHandCalculations';

export const useShareHandLogic = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tags, setTags] = useState<string[]>(['bluff', 'tournament']);
  
  const [formData, setFormData] = useState<ShareHandFormData>({
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

  const addNextActionStep = (street: StreetType, currentIndex: number) => {
    const actions = formData[street];
    const currentAction = actions[currentIndex];
    
    console.log(`Adding next action step after ${currentAction.action} by ${currentAction.playerName}`);
    
    if (shouldAddNextAction(currentAction.action!)) {
      const nextActionStep = createNextActionStep(currentAction);
      
      // Check if next action already exists
      const nextActionExists = actions.find((action, index) => 
        index > currentIndex && action.playerId === nextActionStep.playerId
      );
      
      if (!nextActionExists) {
        const updatedActions = [...actions, nextActionStep];
        console.log(`Adding next action step for ${nextActionStep.playerName}`, updatedActions);
        
        setFormData(prev => ({ ...prev, [street]: updatedActions }));
      }
    }
  };

  const updateAction = (street: StreetType, index: number, action: string, betAmount?: string) => {
    console.log(`Updating action at index ${index} on ${street}:`, action, betAmount);
    
    setFormData(prev => {
      const updatedActions = [...prev[street]];
      const previousAction = updatedActions[index].action;
      
      // Update the current action
      updatedActions[index] = {
        ...updatedActions[index],
        action,
        betAmount: betAmount || updatedActions[index].betAmount,
        completed: action !== 'bet' && action !== 'raise'
      };
      
      // If changing from bet/raise to something else, remove subsequent actions
      if ((previousAction === 'bet' || previousAction === 'raise') && 
          !shouldAddNextAction(action)) {
        console.log(`Action changed from ${previousAction} to ${action}, removing subsequent actions`);
        const actionsToKeep = updatedActions.slice(0, index + 1);
        const newFormData = { ...prev, [street]: actionsToKeep };
        
        // If the new action is bet or raise, add next action step
        if (shouldAddNextAction(action)) {
          setTimeout(() => {
            addNextActionStep(street, index);
          }, 100);
        }
        
        return newFormData;
      }
      
      const newFormData = { ...prev, [street]: updatedActions };
      
      // If this is a bet or raise action, add next action step
      if (shouldAddNextAction(action)) {
        setTimeout(() => {
          addNextActionStep(street, index);
        }, 100);
      }
      
      return newFormData;
    });
  };

  const handleBetSizeSelect = (street: StreetType, index: number, amount: string) => {
    console.log(`Bet size selected: ${amount} for index ${index} on ${street}`);
    
    setFormData(prev => {
      const updatedActions = [...prev[street]];
      
      updatedActions[index] = {
        ...updatedActions[index],
        betAmount: amount,
        completed: true
      };
      
      const newFormData = { ...prev, [street]: updatedActions };
      
      // Add next action step if this is a bet or raise
      if (shouldAddNextAction(updatedActions[index].action!)) {
        setTimeout(() => {
          addNextActionStep(street, index);
        }, 100);
      }
      
      return newFormData;
    });
  };

  useEffect(() => {
    if (formData.heroPosition && formData.villainPosition) {
      const streets: StreetType[] = [
        'preflopActions', 'flopActions', 'turnActions', 'riverActions'
      ];
      
      const updatedFormData = { ...formData };
      let hasChanges = false;
      
      streets.forEach(street => {
        if (updatedFormData[street].length === 0) {
          updatedFormData[street] = initializeActions(street, formData.heroPosition, formData.villainPosition);
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
    const validation = validateCurrentStep(currentStep, formData);
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
    const validation = validateCurrentStep(currentStep, formData);
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
    calculatePotSize: () => calculatePotSize(formData),
    getCurrencySymbol: () => getCurrencySymbol(formData.gameFormat),
    getAllSelectedCards: () => getAllSelectedCards(formData),
    addTag,
    removeTag,
    nextStep,
    prevStep,
    handleSubmit
  };
};
