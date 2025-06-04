
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareHandFormData } from '@/types/shareHand';
import { steps, getPositionName } from '@/utils/shareHandConstants';
import { getAvailableActions, getActionButtonClass } from '@/utils/shareHandActions';
import { validateCurrentStep } from '@/utils/shareHandValidation';
import { calculatePotSize, getCurrencySymbol, getAllSelectedCards } from '@/utils/shareHandCalculations';
import { sharedHandsStore } from '@/stores/sharedHandsStore';
import { useActionManagement } from './useActionManagement';

export const useShareHandLogic = () => {
  const navigate = useNavigate();
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
    players: [], // Initialize as empty array instead of undefined
    holeCards: [] as string[],
    flopCards: [] as string[],
    turnCard: [] as string[],
    riverCard: [] as string[],
    preflopActions: [] as any[],
    preflopDescription: '',
    flopActions: [] as any[],
    flopDescription: '',
    turnActions: [] as any[],
    turnDescription: '',
    riverActions: [] as any[],
    riverDescription: '',
    title: '',
    description: '',
    smallBlind: '',
    bigBlind: '',
    ante: false
  });

  const { updateAction, handleBetSizeSelect, initializeActionsForPositions } = useActionManagement(formData, setFormData);

  // Initialize actions when positions are set or players change
  useEffect(() => {
    console.log('FormData players changed, reinitializing actions:', formData.players);
    initializeActionsForPositions();
  }, [formData.heroPosition, formData.villainPosition, JSON.stringify(formData.players)]);

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
    const validation = validateCurrentStep(currentStep, formData);
    if (!validation.isValid) {
      if (validation.message) {
        alert(validation.message);
      }
      return;
    }
    
    console.log('Submitting hand:', formData, tags);
    
    // Add hand to store and navigate to feed
    const handId = sharedHandsStore.addHand(formData, tags);
    navigate('/feed');
  };

  // Updated getAvailableActions to accept all parameters
  const getAvailableActionsWithParams = (street: string, index: number, allActions: any[]) => {
    return getAvailableActions(street, index, allActions);
  };

  return {
    currentStep,
    setCurrentStep,
    tags,
    formData,
    setFormData,
    steps,
    getPositionName,
    getAvailableActions: getAvailableActionsWithParams,
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
