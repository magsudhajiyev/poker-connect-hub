import { ShareHandFormData } from '@/types/shareHand';

export interface PotCalculationOptions {
  returnInChips?: boolean; // If true, returns value in chips; if false, returns in current unit
  gameFormat?: string;
}

export const calculatePotSize = (
  formData: ShareHandFormData,
  options: PotCalculationOptions = {},
): number => {
  const { returnInChips = true, gameFormat = formData.gameFormat } = options;

  // Parse blinds safely
  const smallBlind = parseFloat(formData.smallBlind || '1');
  const bigBlind = parseFloat(formData.bigBlind || '2');

  // Start with blinds (always in chip amounts for consistency)
  let potSizeInChips = 0;
  if (!isNaN(smallBlind) && !isNaN(bigBlind)) {
    potSizeInChips += smallBlind + bigBlind;
  } else {
    potSizeInChips += 1.5; // Default blinds (0.5 + 1.0)
  }

  // Add all completed actions from all streets
  const allActions = [
    ...formData.preflopActions,
    ...formData.flopActions,
    ...formData.turnActions,
    ...formData.riverActions,
  ];

  // Track each player's current bet for the street to handle raises correctly
  const streetPlayerBets: { [playerId: string]: number } = {};

  allActions.forEach((action) => {
    if (
      action.completed &&
      action.betAmount &&
      (action.action === 'bet' ||
        action.action === 'raise' ||
        action.action === 'call' ||
        action.action === 'all-in')
    ) {
      const betAmount = parseFloat(action.betAmount) || 0;
      const playerId = action.playerId || 'unknown';

      // Convert bet amount to chips if needed
      let betAmountInChips = betAmount;
      if (gameFormat !== 'cash') {
        // For tournament formats, bet amounts might be in BB
        // Convert to chips by multiplying by big blind
        betAmountInChips = betAmount * bigBlind;
      }

      switch (action.action) {
        case 'bet':
        case 'all-in':
          // Full bet amount goes to pot
          potSizeInChips += betAmountInChips;
          streetPlayerBets[playerId] = betAmountInChips;
          break;

        case 'call':
          // Call amount goes to pot
          potSizeInChips += betAmountInChips;
          streetPlayerBets[playerId] = (streetPlayerBets[playerId] || 0) + betAmountInChips;
          break;

        case 'raise': {
          // For raises, the betAmount represents the total bet (call + raise)
          // We need to add only the new money to the pot
          const previousBet = streetPlayerBets[playerId] || 0;
          const newMoneyToPot = Math.max(0, betAmountInChips - previousBet);
          potSizeInChips += newMoneyToPot;
          streetPlayerBets[playerId] = betAmountInChips;
          break;
        }
      }
    }
  });

  // Return in requested format
  if (returnInChips) {
    return potSizeInChips;
  } else {
    // Convert back to display units for MTT/SNG
    return gameFormat === 'cash' ? potSizeInChips : potSizeInChips / bigBlind;
  }
};

export const updatePotWithAction = (
  formData: ShareHandFormData,
  action: string,
  amount: string,
  currentBet: number = 0,
  options: PotCalculationOptions = {},
): number => {
  const currentPotInChips = calculatePotSize(formData, { returnInChips: true });
  const betAmount = parseFloat(amount) || 0;
  const bigBlind = parseFloat(formData.bigBlind || '2');

  // Convert bet amount to chips if needed
  let betAmountInChips = betAmount;
  if (formData.gameFormat !== 'cash') {
    betAmountInChips = betAmount * bigBlind;
  }

  let newPotInChips = currentPotInChips;

  switch (action) {
    case 'call': {
      // For call, use the current bet amount that needs to be called
      let callAmountInChips = currentBet;
      if (formData.gameFormat !== 'cash' && currentBet > 0) {
        callAmountInChips = currentBet * bigBlind;
      } else if (currentBet === 0) {
        // Default to big blind if no current bet specified
        callAmountInChips = bigBlind;
      }
      newPotInChips += callAmountInChips;
      break;
    }
    case 'bet':
    case 'raise':
    case 'all-in':
      newPotInChips += betAmountInChips;
      break;
    case 'check':
    case 'fold':
    default:
      // No change to pot
      break;
  }

  // Return in requested format
  const { returnInChips = true } = options;
  if (returnInChips) {
    return newPotInChips;
  } else {
    return formData.gameFormat === 'cash' ? newPotInChips : newPotInChips / bigBlind;
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
    ...formData.riverCard,
  ];
};
