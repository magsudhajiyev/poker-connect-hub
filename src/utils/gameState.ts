
import { Player } from '@/types/shareHand';

export interface GameStatePlayer {
  name: string;
  position: string;
  stack: number;
  isHero?: boolean;
  hasActedAfterRaise: boolean;
  isActive: boolean; // Track if player is still in the hand
}

export interface ActionHistoryEntry {
  round: string;
  player: string;
  action: string;
  amount?: number;
}

export interface GameState {
  round: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  activePlayers: GameStatePlayer[];
  currentPosition: string;
  currentBet: number;
  lastAggressor: string;
  pot: number;
  actionHistory: ActionHistoryEntry[];
  actionOrder: string[]; // Track the correct order of players for this round
}

export const createGameState = (
  players: Player[],
  smallBlind: number,
  bigBlind: number,
  round: 'preflop' | 'flop' | 'turn' | 'river' = 'preflop',
): GameState => {
  // Convert players to game state format
  const activePlayers: GameStatePlayer[] = players.map(player => ({
    name: player.name,
    position: player.position,
    stack: player.stackSize[0] || 100,
    isHero: player.isHero,
    hasActedAfterRaise: false,
    isActive: true,
  }));

  // Create action order based on positions
  const positionOrder = ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
  let actionOrder: string[];
  
  if (round === 'preflop') {
    // Preflop: start with UTG (first after BB)
    const playerPositions = activePlayers.map(p => p.position);
    actionOrder = [];
    
    // Add positions starting from UTG
    for (const pos of positionOrder) {
      if (playerPositions.includes(pos) && pos !== 'sb' && pos !== 'bb') {
        actionOrder.push(pos);
      }
    }
    // Add blinds at the end for preflop
    if (playerPositions.includes('sb')) {
actionOrder.push('sb');
}
    if (playerPositions.includes('bb')) {
actionOrder.push('bb');
}
  } else {
    // Post-flop: start with SB
    const playerPositions = activePlayers.map(p => p.position);
    actionOrder = positionOrder.filter(pos => playerPositions.includes(pos));
  }

  // Find small blind and big blind players
  const sbPlayer = activePlayers.find(p => p.position === 'sb');
  const bbPlayer = activePlayers.find(p => p.position === 'bb');
  
  // Initialize action history with blinds
  const actionHistory: ActionHistoryEntry[] = [];
  
  if (sbPlayer) {
    actionHistory.push({
      round: 'preflop',
      player: sbPlayer.position,
      action: 'post',
      amount: smallBlind,
    });
  }
  
  if (bbPlayer) {
    actionHistory.push({
      round: 'preflop',
      player: bbPlayer.position,
      action: 'post',
      amount: bigBlind,
    });
  }

  // Set first to act
  const currentPosition = actionOrder[0] || activePlayers[0].position;

  return {
    round,
    activePlayers,
    currentPosition,
    currentBet: round === 'preflop' ? bigBlind : 0,
    lastAggressor: round === 'preflop' ? (bbPlayer?.position || '') : '',
    pot: round === 'preflop' ? smallBlind + bigBlind : 0,
    actionHistory,
    actionOrder,
  };
};

export const updateGameState = (
  gameState: GameState,
  player: string,
  action: string,
  amount?: number,
): GameState => {
  const newActionHistory = [...gameState.actionHistory, {
    round: gameState.round,
    player,
    action,
    amount,
  }];

  let newCurrentBet = gameState.currentBet;
  let newLastAggressor = gameState.lastAggressor;
  let newPot = gameState.pot;
  let newActivePlayers = [...gameState.activePlayers];

  // Update game state based on action
  switch (action) {
    case 'bet':
    case 'raise':
      if (amount) {
        newCurrentBet = amount;
        newLastAggressor = player;
        newPot += amount;
        
        // Reset hasActedAfterRaise for all other players
        newActivePlayers = newActivePlayers.map(p => ({
          ...p,
          hasActedAfterRaise: p.position === player,
        }));
      }
      break;
    case 'call':
      newPot += gameState.currentBet;
      // Mark player as having acted
      newActivePlayers = newActivePlayers.map(p => 
        p.position === player ? { ...p, hasActedAfterRaise: true } : p,
      );
      break;
    case 'fold':
      // Remove player from active players
      newActivePlayers = newActivePlayers.map(p => 
        p.position === player ? { ...p, isActive: false } : p,
      );
      break;
    case 'check':
      // Mark player as having acted
      newActivePlayers = newActivePlayers.map(p => 
        p.position === player ? { ...p, hasActedAfterRaise: true } : p,
      );
      break;
  }

  return {
    ...gameState,
    currentBet: newCurrentBet,
    lastAggressor: newLastAggressor,
    pot: newPot,
    actionHistory: newActionHistory,
    activePlayers: newActivePlayers,
  };
};
