
import { Player } from '@/types/shareHand';

export interface GameStatePlayer {
  name: string;
  position: string;
  stack: number;
  isHero?: boolean;
  hasActedAfterRaise?: boolean;
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
}

export const createGameState = (
  players: Player[],
  smallBlind: number,
  bigBlind: number,
  round: 'preflop' | 'flop' | 'turn' | 'river' = 'preflop'
): GameState => {
  // Convert players to game state format
  const activePlayers: GameStatePlayer[] = players.map(player => ({
    name: player.name,
    position: player.position,
    stack: player.stackSize[0] || 100,
    isHero: player.isHero,
    hasActedAfterRaise: false // Initialize flag
  }));

  // Find small blind and big blind players
  const sbPlayer = activePlayers.find(p => p.position === 'sb');
  const bbPlayer = activePlayers.find(p => p.position === 'bb');
  
  // Initialize action history with blinds
  const actionHistory: ActionHistoryEntry[] = [];
  
  if (sbPlayer) {
    actionHistory.push({
      round: 'preflop',
      player: sbPlayer.name,
      action: 'post',
      amount: smallBlind
    });
  }
  
  if (bbPlayer) {
    actionHistory.push({
      round: 'preflop',
      player: bbPlayer.name,
      action: 'post',
      amount: bigBlind
    });
  }

  // Determine first to act based on round
  let currentPosition = '';
  if (round === 'preflop') {
    // Preflop: first to act is UTG (or first position after BB)
    const positionOrder = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
    for (const pos of positionOrder) {
      if (activePlayers.some(p => p.position === pos)) {
        currentPosition = pos;
        break;
      }
    }
  } else {
    // Post-flop: first to act is SB (or first active player)
    const postFlopOrder = ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
    for (const pos of postFlopOrder) {
      if (activePlayers.some(p => p.position === pos)) {
        currentPosition = pos;
        break;
      }
    }
  }

  return {
    round,
    activePlayers,
    currentPosition,
    currentBet: round === 'preflop' ? bigBlind : 0,
    lastAggressor: round === 'preflop' ? (bbPlayer?.name || '') : '',
    pot: round === 'preflop' ? smallBlind + bigBlind : 0,
    actionHistory
  };
};

export const updateGameState = (
  gameState: GameState,
  player: string,
  action: string,
  amount?: number
): GameState => {
  const newActionHistory = [...gameState.actionHistory, {
    round: gameState.round,
    player,
    action,
    amount
  }];

  let newCurrentBet = gameState.currentBet;
  let newLastAggressor = gameState.lastAggressor;
  let newPot = gameState.pot;

  // Update game state based on action
  switch (action) {
    case 'bet':
    case 'raise':
      if (amount) {
        newCurrentBet = amount;
        newLastAggressor = player;
        newPot += amount;
      }
      break;
    case 'call':
      newPot += gameState.currentBet;
      break;
    case 'fold':
      // Remove player from active players
      break;
    case 'check':
      // No state change needed
      break;
  }

  return {
    ...gameState,
    currentBet: newCurrentBet,
    lastAggressor: newLastAggressor,
    pot: newPot,
    actionHistory: newActionHistory
  };
};
