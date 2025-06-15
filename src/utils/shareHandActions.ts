import { ActionStep, StreetType, ShareHandFormData, Player } from '@/types/shareHand';
import { positionOrder } from './shareHandConstants';
import { createGameState, updateGameState, GameState } from './gameState';
import { standardizePosition, getActionOrder } from './positionMapping';

export const initializeActions = (
  street: StreetType,
  heroPosition: string,
  villainPosition: string,
  players?: Player[]
): ActionStep[] => {
  if (!heroPosition || !villainPosition) return [];
  
  // If we have players data, use it to create action order for all players
  if (players && players.length > 0) {
    // Filter players with positions and get their UI positions
    const playersWithPositions = players.filter(player => player.position);
    const uiPositions = playersWithPositions.map(player => player.position);
    
    // Get proper action order using position mapping
    const isPreflop = street === 'preflopActions';
    const orderedPositions = getActionOrder(uiPositions, isPreflop);
    
    // Create action steps in the correct order
    const actionSteps: ActionStep[] = [];
    
    for (const standardPos of orderedPositions) {
      // Find the player with this position (convert back to UI position for lookup)
      const player = playersWithPositions.find(p => standardizePosition(p.position) === standardPos);
      if (player) {
        actionSteps.push({
          playerId: player.id,
          playerName: player.name,
          isHero: player.isHero || false,
          completed: false,
          position: player.position
        });
      }
    }
    
    return actionSteps;
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

function hasRaiseInRound(actionHistory: any[], round: string): boolean {
  return actionHistory.some(action => 
    action.round === round && action.action === 'raise'
  );
}

function getNextToAct(gameState: GameState): string {
  const { activePlayers, currentPosition, actionOrder } = gameState;
  
  // Get only active players (not folded)
  const stillActive = activePlayers.filter(p => p.isActive);
  
  if (stillActive.length <= 1) {
    return stillActive[0]?.position || currentPosition;
  }
  
  // Find current position in action order
  const currentIndex = actionOrder.indexOf(currentPosition);
  
  // Find next active player in order
  for (let i = 1; i <= actionOrder.length; i++) {
    const nextIndex = (currentIndex + i) % actionOrder.length;
    const nextPosition = actionOrder[nextIndex];
    
    // Check if this player is still active
    const nextPlayer = stillActive.find(p => p.position === nextPosition);
    if (nextPlayer) {
      return nextPlayer.position;
    }
  }
  
  return stillActive[0].position; // Fallback
}

function isRoundComplete(gameState: GameState): boolean {
  const { activePlayers, lastAggressor } = gameState;
  
  // Get only active players (not folded)
  const stillActive = activePlayers.filter(p => p.isActive);
  
  // If only one player remains, round is complete
  if (stillActive.length <= 1) {
    return true;
  }
  
  // If no one has raised this round, check if everyone has acted
  if (!lastAggressor) {
    return stillActive.every(player => player.hasActedAfterRaise);
  }
  
  // If someone raised, check if all other active players have acted since the raise
  const allOthersActed = stillActive.every(player => {
    // The aggressor has acted by definition
    if (player.position === lastAggressor) {
      return true;
    }
    // All others must have acted after the raise
    return player.hasActedAfterRaise;
  });
  
  return allOthersActed;
}

function advanceToNextRound(gameState: GameState): void {
  const roundOrder: Array<GameState['round']> = 
    ['preflop', 'flop', 'turn', 'river', 'showdown'];
  
  const currentIndex = roundOrder.indexOf(gameState.round);
  if (currentIndex < roundOrder.length - 1) {
    gameState.round = roundOrder[currentIndex + 1];
  }
  
  // Reset betting for new round
  gameState.currentBet = 0;
  gameState.lastAggressor = '';
  
  // Get only active players (not folded) for the new round
  const stillActive = gameState.activePlayers.filter(p => p.isActive);
  
  // Reset hasActedAfterRaise for all active players
  gameState.activePlayers.forEach(player => {
    if (player.isActive) {
      player.hasActedAfterRaise = false;
    }
  });
  
  // Create new action order with only active players for post-flop
  if (gameState.round !== 'preflop') {
    const postFlopOrder = ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
    
    // Filter to only include positions of players who are still active
    const activePositions = stillActive.map(p => p.position);
    gameState.actionOrder = postFlopOrder.filter(pos => activePositions.includes(pos));
    
    console.log('Advanced to new round:', {
      round: gameState.round,
      activePositions,
      newActionOrder: gameState.actionOrder
    });
  }
  
  // Set first active player as current
  const firstActive = stillActive.find(p => 
    gameState.actionOrder.includes(p.position)
  );
  if (firstActive) {
    gameState.currentPosition = firstActive.position;
  }
}

export const processAction = (
  gameState: GameState, 
  playerPosition: string, 
  action: string, 
  amount: number = 0
): GameState => {
  // Clone game state to avoid mutation
  const newState = JSON.parse(JSON.stringify(gameState));
  
  // Add action to history
  newState.actionHistory.push({
    round: newState.round,
    player: playerPosition,
    action: action,
    amount: amount
  });
  
  console.log(`Processing action: ${playerPosition} ${action} ${amount}`, {
    currentRound: newState.round,
    activePlayers: newState.activePlayers.filter(p => p.isActive).map(p => p.position)
  });
  
  // Update game state based on action
  switch (action) {
    case 'fold':
      // Mark player as inactive
      newState.activePlayers = newState.activePlayers.map(p => 
        p.position === playerPosition ? { ...p, isActive: false } : p
      );
      console.log(`${playerPosition} folded. Remaining active players:`, 
        newState.activePlayers.filter(p => p.isActive).map(p => p.position));
      break;
      
    case 'check':
      // Mark player as having acted
      newState.activePlayers = newState.activePlayers.map(p => 
        p.position === playerPosition ? { ...p, hasActedAfterRaise: true } : p
      );
      break;
      
    case 'call':
      // Add call amount to pot and mark as acted
      newState.pot += amount;
      newState.activePlayers = newState.activePlayers.map(p => 
        p.position === playerPosition ? { ...p, hasActedAfterRaise: true } : p
      );
      break;
      
    case 'bet':
    case 'raise':
      // Add bet amount to pot
      newState.pot += amount;
      // Update current bet
      newState.currentBet = amount;
      // Update last aggressor
      newState.lastAggressor = playerPosition;
      
      // Reset action status for all players, set current player as acted
      newState.activePlayers = newState.activePlayers.map(player => ({
        ...player,
        hasActedAfterRaise: player.position === playerPosition
      }));
      break;
  }
  
  // Check if round is complete
  if (isRoundComplete(newState)) {
    // Get active players
    const stillActive = newState.activePlayers.filter(p => p.isActive);
    
    // If only one player remains, game is over
    if (stillActive.length <= 1) {
      newState.round = 'showdown';
      console.log('Game complete - only one player remaining');
      return newState;
    }
    
    // Advance to next round
    advanceToNextRound(newState);
    console.log(`Round complete. Advanced to ${newState.round} with players:`, 
      newState.activePlayers.filter(p => p.isActive).map(p => p.position));
  } else {
    // Set next player to act
    newState.currentPosition = getNextToAct(newState);
    console.log(`Next to act: ${newState.currentPosition}`);
  }
  
  return newState;
};

export const removeFoldedPlayerFromFutureStreets = (
  formData: ShareHandFormData,
  foldedPlayerId: string
): ShareHandFormData => {
  console.log(`Removing folded player ${foldedPlayerId} from future streets`);
  
  return {
    ...formData,
    flopActions: formData.flopActions.filter(action => action.playerId !== foldedPlayerId),
    turnActions: formData.turnActions.filter(action => action.playerId !== foldedPlayerId),
    riverActions: formData.riverActions.filter(action => action.playerId !== foldedPlayerId)
  };
};

export const createGameStateFromFormData = (formData: ShareHandFormData, street: StreetType): GameState => {
  const round = street.replace('Actions', '') as 'preflop' | 'flop' | 'turn' | 'river';
  const smallBlind = parseFloat(formData.smallBlind) || 1;
  const bigBlind = parseFloat(formData.bigBlind) || 2;
  
  return createGameState(formData.players || [], smallBlind, bigBlind, round);
};

export const getAvailableActions = (street: string, actionIndex: number, allActions: ActionStep[]): string[] => {
  // Get the current action step to determine player position
  const currentAction = allActions[actionIndex];
  if (!currentAction) {
    // If no current action exists, we're starting fresh - return default preflop actions
    const round = street.replace('Actions', '');
    if (round === 'preflop') {
      return ['fold', 'call', 'raise'];
    } else {
      return ['check', 'bet'];
    }
  }
  
  const position = standardizePosition(currentAction.position || '');
  const round = street.replace('Actions', '');
  
  // Get all previous actions in this street to determine current bet state
  const previousActions = allActions.slice(0, actionIndex);
  
  // Calculate current bet from previous actions
  let currentBet = 0;
  if (round === 'preflop') {
    currentBet = 2; // Start with BB amount for preflop
  }
  
  // Update current bet based on previous actions
  for (const action of previousActions) {
    if (action.action === 'bet' || action.action === 'raise') {
      const betAmount = parseFloat(action.betAmount || '0');
      if (betAmount > currentBet) {
        currentBet = betAmount;
      }
    }
  }
  
  // Create mock action history for hasRaiseInRound check
  const actionHistory = previousActions.map(action => ({
    round,
    action: action.action,
    player: action.playerName
  }));
  
  // Special case for BB preflop when no one has raised
  if (round === 'preflop' && 
      position === 'BB' && 
      currentBet === 2 && // BB amount
      !hasRaiseInRound(actionHistory, round)) {
    return ['check', 'bet'];
  }
  
  // No bet has been made in current round
  if (currentBet === 0) {
    return ['check', 'bet'];
  }
  
  // Bet has been made
  return ['fold', 'call', 'raise'];
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
  return action === 'bet' || action === 'raise' || action === 'call';
};
