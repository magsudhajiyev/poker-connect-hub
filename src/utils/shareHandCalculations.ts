
import { ShareHandFormData } from '@/types/shareHand';

export const calculatePotSize = (formData: ShareHandFormData): number => {
  let potSize = 0;
  
  // Start with blinds
  if (formData.smallBlind && formData.bigBlind) {
    potSize += parseFloat(formData.smallBlind) + parseFloat(formData.bigBlind);
  } else {
    potSize += 1.5; // Default blinds (0.5 + 1.0)
  }
  
  // Add all completed actions from all streets
  const allActions = [
    ...formData.preflopActions,
    ...formData.flopActions,
    ...formData.turnActions,
    ...formData.riverActions
  ];
  
  // Track each player's total contribution to avoid double counting
  const playerContributions: { [playerId: string]: number } = {};
  
  allActions.forEach(action => {
    if (action.completed && action.betAmount && 
        (action.action === 'bet' || action.action === 'raise' || action.action === 'call')) {
      const amount = parseFloat(action.betAmount) || 0;
      const playerId = action.playerId || 'unknown';
      
      // For raises, only add the raise amount, not the total bet
      if (action.action === 'raise') {
        // Add only the raise portion (new bet minus previous bet)
        const prevContribution = playerContributions[playerId] || 0;
        const raiseAmount = amount - prevContribution;
        potSize += Math.max(0, raiseAmount);
        playerContributions[playerId] = amount;
      } else {
        // For bets and calls, add the full amount
        potSize += amount;
        playerContributions[playerId] = (playerContributions[playerId] || 0) + amount;
      }
    }
  });
  
  return potSize;
};

export const updatePotWithAction = (formData: ShareHandFormData, action: string, amount: string, currentBet: number = 0): number => {
  const currentPot = calculatePotSize(formData);
  const betAmount = parseFloat(amount) || 0;
  
  switch (action) {
    case 'call': {
      // For call, use the current bet amount that needs to be called
      const callAmount = currentBet || (formData.bigBlind ? parseFloat(formData.bigBlind) : 2);
      return currentPot + callAmount;
    }
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
