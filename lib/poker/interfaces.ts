export interface Player {
  id: string;
  name: string;
  position: string;
  chips: number;
  currentBet: number;
  isAllIn: boolean;
  isFolded: boolean;
  hasActed: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  pot: number;
  currentBet: number;
  bigBlind: number;
  smallBlind: number;
  minRaise?: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  bettingRound: number;
}

export interface PokerAction {
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount?: number;
  isValid: boolean;
  description: string;
}

export interface LegalActionsResponse {
  gameId: string;
  playerId: string;
  legalActions: PokerAction[];
  gameState: {
    currentBet: number;
    playerChips: number;
    potSize: number;
    minRaise: number;
  };
}