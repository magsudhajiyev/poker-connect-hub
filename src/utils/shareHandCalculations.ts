
import { ShareHandFormData } from '@/types/shareHand';

export const calculatePotSize = (formData: ShareHandFormData): number => {
  let potSize = 0;
  
  // Start with blinds
  if (formData.smallBlind && formData.bigBlind) {
    potSize += parseFloat(formData.smallBlind) + parseFloat(formData.bigBlind);
  } else if (formData.gameFormat === 'cash') {
    potSize += 1.5; // Default blinds
  } else {
    potSize += 1.5; // Default blinds
  }
  
  // Add all completed actions from all streets
  const allActions = [
    ...formData.preflopActions,
    ...formData.flopActions,
    ...formData.turnActions,
    ...formData.riverActions
  ];
  
  allActions.forEach(action => {
    if (action.completed && action.betAmount && (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
      potSize += parseFloat(action.betAmount) || 0;
    }
  });
  
  return potSize;
};

export const updatePotWithAction = (formData: ShareHandFormData, action: string, amount: string): number => {
  const currentPot = calculatePotSize(formData);
  const betAmount = parseFloat(amount) || 0;
  
  switch (action) {
    case 'call':
      // For call, determine the call amount based on current bet
      const currentBet = formData.bigBlind ? parseFloat(formData.bigBlind) : 2;
      return currentPot + currentBet;
    case 'bet':
    case 'raise':
      return currentPot + betAmount;
    case 'check':
    case 'fold':
    default:
      return currentPot;
  }
};

export const getCurrencySymbol = (gameFormat: string): string => {
  return gameFormat === 'cash' ? '$' : 'BB';
};

export const getAllSelectedCards = (formData: ShareHandFormData): string[] => {
  return [
    ...formData.holeCards,
    ...formData.flopCards,
    ...formData.turnCard,
    ...formData.riverCard
  ];
};
