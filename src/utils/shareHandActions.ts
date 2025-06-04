
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

function getNextToAct(gameState: GameState) {
  const { activePlayers, currentPosition } = gameState;
  
  // Get standard positions
  const standardPositions = activePlayers.map(p => standardizePosition(p.position));
  const currentStandardPosition = standardizePosition(currentPosition);
  
  // Find current position's index
  const currentIndex = positionOrder.indexOf(currentStandardPosition);
  
  // Find next active position clockwise
  for (let i = 1; i <= positionOrder.length; i++) {
    const nextIndex = (currentIndex + i) % positionOrder.length;
    const nextPosition = positionOrder[nextIndex];
    
    if (standardPositions.includes(nextPosition)) {
      // Find player with this position
      return activePlayers.find(p => 
        standardizePosition(p.position) === nextPosition
      )?.position || activePlayers[0].position;
    }
  }
  
  return activePlayers[0].position; // Fallback
}

// Modified round completion check that accounts for raises
function isRoundCompleteFixed(gameState: GameState): boolean {
  const { activePlayers, lastAggressor } = gameState;
  
  // If only one player remains, round is complete
  if (activePlayers.length <= 1) {
    return true;
  }
  
  // Check if all active players have acted after the last raise
  const allPlayersActed = activePlayers.every(player => {
    // If player is the last aggressor, they've acted
    if (player.position === lastAggressor) {
      return true;
    }
    
    // Check if player has acted after the last raise
    return (player as any).hasActedAfterRaise === true;
  });
  
  return allPlayersActed;
}

function isRoundComplete(gameState: GameState): boolean {
  const { activePlayers, currentBet, lastAggressor, actionHistory, round } = gameState;
  
  // If only one player remains, round is complete
  if (activePlayers.length <= 1) {
    return true;
  }
  
  // Get actions for current round
  const currentRoundActions = actionHistory.filter(action => action.round === round);
  
  // Check if all players have acted
  const playersWhoActed = new Set(currentRoundActions.map(action => action.player));
  
  // For each active player, check if they've acted appropriately
  for (const player of activePlayers) {
    const playerPosition = player.position;
    const playerActions = currentRoundActions.filter(action => action.player === playerPosition);
    
    if (playerActions.length === 0) {
      // Player hasn't acted yet
      return false;
    }
    
    const lastAction = playerActions[playerActions.length - 1];
    
    // If there's a current bet and player hasn't called/raised/folded, round not complete
    if (currentBet > 0 && lastAction.action === 'check') {
      return false;
    }
    
    // If player made the last aggression, check if all others have responded
    if (lastAggressor === playerPosition) {
      // Check if all other players have acted since this aggression
      const otherPlayers = activePlayers.filter(p => p.position !== playerPosition);
      for (const otherPlayer of otherPlayers) {
        const otherPlayerActions = currentRoundActions.filter(action => 
          action.player === otherPlayer.position
        );
        if (otherPlayerActions.length === 0) {
          return false;
        }
      }
    }
  }
  
  return true;
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
  
  // Reset hasActedAfterRaise for all players
  gameState.activePlayers.forEach(player => {
    (player as any).hasActedAfterRaise = false;
  });
  
  // Set first to act (SB or first active player)
  const postFlopOrder = ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
  for (const position of postFlopOrder) {
    const standardPos = standardizePosition(position);
    const player = gameState.activePlayers.find(p => 
      standardizePosition(p.position) === standardPos
    );
    if (player) {
      gameState.currentPosition = player.position;
      break;
    }
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
  
  // Update game state based on action
  switch (action) {
    case 'fold':
      // Remove player from active players
      newState.activePlayers = newState.activePlayers.filter(
        p => p.position !== playerPosition
      );
      break;
      
    case 'check':
      // No change to pot or bet
      break;
      
    case 'call':
      // Add call amount to pot
      newState.pot += amount;
      break;
      
    case 'bet':
    case 'raise':
      // Add bet amount to pot
      newState.pot += amount;
      // Update current bet
      newState.currentBet = amount;
      // Update last aggressor
      newState.lastAggressor = playerPosition;
      
      // IMPORTANT FIX: Reset action status for all other players
      // This ensures all players get to act again after a raise
      newState.activePlayers.forEach(player => {
        if (player.position !== playerPosition) {
          // Remove their last action in this round from consideration
          // when checking if round is complete
          player.hasActedAfterRaise = false;
        }
      });
      break;
  }
  
  // Mark current player as having acted after the latest raise
  const currentPlayer = newState.activePlayers.find(p => p.position === playerPosition);
  if (currentPlayer) {
    currentPlayer.hasActedAfterRaise = true;
  }
  
  // Check if round is complete - MODIFIED LOGIC
  if (isRoundCompleteFixed(newState)) {
    // If only one player remains, game is over
    if (newState.activePlayers.length === 1) {
      newState.round = 'showdown';
      return newState;
    }
    
    // Advance to next round
    advanceToNextRound(newState);
  } else {
    // Set next player to act
    newState.currentPosition = getNextToAct(newState);
  }
  
  return newState;
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
  if (!currentAction) return [];
  
  const position = standardizePosition(currentAction.position || '');
  const round = street.replace('Actions', '');
  
  // Create a mock game state to determine current bet and action history
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
