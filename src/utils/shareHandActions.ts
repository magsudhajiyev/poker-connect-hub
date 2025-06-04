
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
      position: player.position // Add position to action step
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
    completed: false,
    position: currentAction.position // Preserve position info
  };
};

export const shouldAddNextAction = (action: string): boolean => {
  return action === 'bet' || action === 'raise';
};
