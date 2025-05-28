
import { ShareHandFormData } from '@/types/shareHand';

export const calculatePotSize = (formData: ShareHandFormData): number => {
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
