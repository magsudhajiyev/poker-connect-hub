// Types for PokerActionsAlgorithm

export interface AlgorithmPlayer {
  id: string | number;
  name: string;
  position: string;
  positionIndex: number;
  stack: number;
  stackSize?: number | number[]; // For initial setup
  currentBet: number;
  totalInvested: number;
  isDealer?: boolean;
  isSB?: boolean;
  isBB?: boolean;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  hasActed: boolean;
  cards?: string[];
}

export interface AlgorithmAction {
  playerId: string | number;
  playerName: string;
  position: string;
  type: string; // 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allIn' | 'allInRaise'
  amount: number;
  street: 'preFlop' | 'flop' | 'turn' | 'river';
  raiseSize?: number;
  newBetLevel?: number;
  timestamp?: Date;
}

export interface StreetActions {
  preFlop: AlgorithmAction[];
  flop: AlgorithmAction[];
  turn: AlgorithmAction[];
  river: AlgorithmAction[];
}

export interface AlgorithmState {
  players: AlgorithmPlayer[];
  pot: number;
  currentBet: number;
  minRaise: number;
  lastRaiser: string | number | null;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  actionHistory: AlgorithmAction[];
  streetActions: StreetActions;
  currentStreet: 'preflop' | 'flop' | 'turn' | 'river';
  isComplete: boolean;
  sidePots: Array<{
    amount: number;
    eligiblePlayers: string[];
  }>;
}

export interface ValidAction {
  type: string; // 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allIn'
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  description: string;
}
