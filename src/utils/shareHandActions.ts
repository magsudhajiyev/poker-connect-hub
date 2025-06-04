
import { ActionStep, StreetType, ShareHandFormData, Player } from '@/types/shareHand';
import { positionOrder } from './shareHandConstants';

export const initializeActions = (
  street: StreetType,
  heroPosition: string,
  villainPosition: string,
  players?: Player[]
): ActionStep[] => {
  if (!heroPosition || !villainPosition) return [];
  
  // If we have players data, use it to create action order for all players
  if (players && players.length > 0) {
    // Sort players by position order (earliest position first)
    const sortedPlayers = [...players]
      .filter(player => player.position) // Only include players with positions
      .sort((a, b) => {
        const aIndex = positionOrder.indexOf(a.position);
        const bIndex = positionOrder.indexOf(b.position);
        return aIndex - bIndex;
      });
    
    return sortedPlayers.map(player => ({
      playerId: player.id,
      playerName: player.name,
      isHero: player.isHero || false,
      completed: false,
      position: player.position
    }));
  }
  
  // Fallback to hero/villain only if no players data
  const heroIndex = positionOrder.indexOf(heroPosition);
  const villainIndex = positionOrder.indexOf(villainPosition);
  
  const actionOrder: ActionStep[] = [];
  
  // For all streets, action starts from earliest position (lowest index)
  if (heroIndex < villainIndex) {
    // Hero is in earlier position, acts first
    actionOrder.push({
      playerId: 'hero',
      playerName: 'Hero',
      isHero: true,
      completed: false,
      position: heroPosition
    });
    actionOrder.push({
      playerId: 'villain',
      playerName: 'Villain',
      isHero: false,
      completed: false,
      position: villainPosition
    });
  } else {
    // Villain is in earlier position, acts first
    actionOrder.push({
      playerId: 'villain',
      playerName: 'Villain',
      isHero: false,
      completed: false,
      position: villainPosition
    });
    actionOrder.push({
      playerId: 'hero',
      playerName: 'Hero',
      isHero: true,
      completed: false,
      position: heroPosition
    });
  }
  
  return actionOrder;
};

export const getAvailableActions = (street: string, actionIndex: number, allActions: ActionStep[]): string[] => {
  // Get all previous actions in this street
  const previousActions = allActions.slice(0, actionIndex);
  
  // Check if there's been any betting action
  const hasBetting = previousActions.some(action => 
    action.action === 'bet' || action.action === 'raise'
  );
  
  // Check if this is the first action in the street
  const isFirstAction = actionIndex === 0;
  
  // Base actions
  let availableActions: string[] = [];
  
  if (hasBetting) {
    // If there's been betting, player can fold, call, or raise
    availableActions = ['fold', 'call', 'raise'];
  } else {
    // If no betting yet
    if (isFirstAction || previousActions.every(action => action.action === 'check')) {
      // First to act or everyone has checked - can check or bet
      availableActions = ['check', 'bet'];
    } else {
      // Someone has acted but no betting - can check, bet, or fold if facing action
      availableActions = ['check', 'bet'];
    }
  }
  
  return availableActions;
};

export const getActionButtonClass = (action: string, isSelected: boolean): string => {
  const baseClass = "transition-colors";
  if (isSelected) {
    return `${baseClass} bg-emerald-500 text-slate-900`;
  }
  return `${baseClass} border-slate-700/50 text-slate-300 hover:bg-slate-800/50`;
};

export const createNextActionStep = (currentAction: ActionStep, players?: Player[]): ActionStep => {
  // Find the next player in the action sequence based on current players
  if (players && players.length > 0) {
    const currentPlayerIndex = players.findIndex(p => p.id === currentAction.playerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];
    
    return {
      playerId: nextPlayer.id,
      playerName: nextPlayer.name,
      isHero: nextPlayer.isHero || false,
      completed: false,
      position: nextPlayer.position
    };
  }
  
  // Fallback for legacy hero/villain logic
  const nextPlayerId = currentAction.isHero ? 'villain' : 'hero';
  const nextPlayerName = currentAction.isHero ? 'Villain' : 'Hero';
  
  return {
    playerId: nextPlayerId,
    playerName: nextPlayerName,
    isHero: !currentAction.isHero,
    completed: false,
    position: currentAction.position // This will be wrong for legacy, but we prioritize players array
  };
};

export const shouldAddNextAction = (action: string): boolean => {
  return action === 'bet' || action === 'raise';
};
