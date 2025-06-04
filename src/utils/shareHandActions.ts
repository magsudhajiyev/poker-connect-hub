
import { ActionStep, StreetType, ShareHandFormData } from '@/types/shareHand';
import { positionOrder } from './shareHandConstants';

export const initializeActions = (
  street: StreetType,
  heroPosition: string,
  villainPosition: string
): ActionStep[] => {
  if (!heroPosition || !villainPosition) return [];
  
  const heroIndex = positionOrder.indexOf(heroPosition);
  const villainIndex = positionOrder.indexOf(villainPosition);
  
  const actionOrder: ActionStep[] = [];
  
  // For preflop, action starts from UTG (earliest position = lowest index)
  if (street === 'preflopActions') {
    // The player with the lower index (earlier position) acts first
    if (heroIndex < villainIndex) {
      // Hero is in earlier position, acts first
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
      // Villain is in earlier position, acts first
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
  } else {
    // For post-flop streets (flop, turn, river), action starts from Small Blind (earliest position = lowest index)
    // Same logic applies - earliest position acts first
    if (heroIndex < villainIndex) {
      // Hero is in earlier position, acts first
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
      // Villain is in earlier position, acts first
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
  }
  
  return actionOrder;
};

export const getAvailableActions = (street: string, index: number): string[] => {
  return ['fold', 'call', 'bet', 'raise', 'check'];
};

export const getActionButtonClass = (action: string, isSelected: boolean): string => {
  const baseClass = "transition-colors";
  if (isSelected) {
    return `${baseClass} bg-emerald-500 text-slate-900`;
  }
  return `${baseClass} border-slate-700/50 text-slate-300 hover:bg-slate-800/50`;
};

export const createNextActionStep = (currentAction: ActionStep): ActionStep => {
  const nextPlayerId = currentAction.isHero ? 'villain' : 'hero';
  const nextPlayerName = currentAction.isHero ? 'Villain' : 'Hero';
  
  return {
    playerId: nextPlayerId,
    playerName: nextPlayerName,
    isHero: !currentAction.isHero,
    completed: false
  };
};

export const shouldAddNextAction = (action: string): boolean => {
  return action === 'bet' || action === 'raise';
};
