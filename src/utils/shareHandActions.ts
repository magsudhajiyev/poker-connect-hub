
import { ActionStep, StreetType } from '@/types/shareHand';
import { positionOrder } from './shareHandConstants';

export const initializeActions = (street: StreetType, heroPosition: string, villainPosition: string, players?: any[]): ActionStep[] => {
  // If we have players array, use that; otherwise fall back to legacy hero/villain
  if (players && players.length > 0) {
    const playersWithPositions = players.filter(p => p.position);
    
    // Sort players by position order
    const sortedPlayers = playersWithPositions.sort((a, b) => {
      const aIndex = positionOrder.indexOf(a.position);
      const bIndex = positionOrder.indexOf(b.position);
      return aIndex - bIndex;
    });

    // For preflop, start with the first player after big blind
    // For postflop streets, start with small blind or first active player
    let startingPlayerIndex = 0;
    
    if (street === 'preflopActions') {
      // Find big blind and start with next player
      const bbIndex = sortedPlayers.findIndex(p => p.position === 'bb');
      if (bbIndex !== -1) {
        startingPlayerIndex = (bbIndex + 1) % sortedPlayers.length;
      }
    } else {
      // Postflop: start with small blind or first active player
      const sbIndex = sortedPlayers.findIndex(p => p.position === 'sb');
      startingPlayerIndex = sbIndex !== -1 ? sbIndex : 0;
    }

    const startingPlayer = sortedPlayers[startingPlayerIndex];
    
    return [{
      playerId: startingPlayer.id,
      playerName: startingPlayer.name,
      isHero: !!startingPlayer.isHero,
      completed: false
    }];
  }

  // Legacy fallback for hero/villain only
  const heroIndex = positionOrder.indexOf(heroPosition);
  const villainIndex = positionOrder.indexOf(villainPosition);
  
  let firstToAct: ActionStep;
  
  if (street === 'preflopActions') {
    if (heroIndex < villainIndex) {
      firstToAct = { playerId: 'hero', playerName: 'Hero', isHero: true, completed: false };
    } else {
      firstToAct = { playerId: 'villain', playerName: 'Villain', isHero: false, completed: false };
    }
  } else {
    if (heroIndex < villainIndex) {
      firstToAct = { playerId: 'hero', playerName: 'Hero', isHero: true, completed: false };
    } else {
      firstToAct = { playerId: 'villain', playerName: 'Villain', isHero: false, completed: false };
    }
  }
  
  return [firstToAct];
};

export const getAvailableActions = (street: StreetType, index: number, formData?: any): string[] => {
  const baseActions = ['fold', 'call', 'bet', 'raise', 'check'];
  
  // For the first action on each street, usually can't call (unless there's a blind)
  if (index === 0 && street === 'preflopActions') {
    return ['fold', 'call', 'raise']; // Can call the big blind preflop
  }
  
  if (index === 0) {
    return ['check', 'bet'];
  }
  
  return baseActions;
};

export const getActionButtonClass = (action: string, isSelected: boolean): string => {
  const baseClass = "w-full text-xs h-7";
  
  if (isSelected) {
    switch (action) {
      case 'fold':
        return `${baseClass} bg-red-500 text-white border-red-500`;
      case 'call':
      case 'check':
        return `${baseClass} bg-blue-500 text-white border-blue-500`;
      case 'bet':
      case 'raise':
        return `${baseClass} bg-emerald-500 text-white border-emerald-500`;
      default:
        return `${baseClass} bg-slate-600 text-white border-slate-600`;
    }
  }
  
  return `${baseClass} bg-slate-900/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-white`;
};

export const createNextActionStep = (currentAction: ActionStep, players?: any[]): ActionStep => {
  if (players && players.length > 0) {
    const playersWithPositions = players.filter(p => p.position);
    const sortedPlayers = playersWithPositions.sort((a, b) => {
      const aIndex = positionOrder.indexOf(a.position);
      const bIndex = positionOrder.indexOf(b.position);
      return aIndex - bIndex;
    });

    const currentPlayerIndex = sortedPlayers.findIndex(p => p.id === currentAction.playerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % sortedPlayers.length;
    const nextPlayer = sortedPlayers[nextPlayerIndex];

    return {
      playerId: nextPlayer.id,
      playerName: nextPlayer.name,
      isHero: !!nextPlayer.isHero,
      completed: false
    };
  }

  // Legacy fallback for hero/villain
  return {
    playerId: currentAction.playerId === 'hero' ? 'villain' : 'hero',
    playerName: currentAction.playerId === 'hero' ? 'Villain' : 'Hero',
    isHero: currentAction.playerId !== 'hero',
    completed: false
  };
};

export const shouldAddNextAction = (action: string): boolean => {
  return action === 'bet' || action === 'raise';
};
