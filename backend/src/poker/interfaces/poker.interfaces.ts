export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  position: number;
  isActive: boolean;
  hasActed: boolean;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  minRaise: number;
  bigBlind: number;
  smallBlind: number;
  currentPlayerIndex: number;
  dealerPosition: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  bettingRound: number;
}

export interface PokerAction {
  type: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
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
