// Unified interfaces for frontend and backend consistency
// These interfaces bridge the gap between frontend UI needs and backend game logic

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

// Unified Player interface that supports both frontend UI and backend game logic
export interface UnifiedPlayer {
  id: string;
  name: string;
  
  // Position handling - support both string and numeric
  position: string; // Primary: UTG, MP, CO, BTN, SB, BB for UI
  positionIndex?: number; // Optional: numeric position for backend logic
  
  // Stack/chips - unified as single number
  chips: number;
  
  // UI-specific properties
  isHero?: boolean;
  
  // Game state properties (optional for UI-only contexts)
  holeCards?: Card[];
  currentBet?: number;
  isActive?: boolean;
  hasActed?: boolean;
  isFolded?: boolean;
  isAllIn?: boolean;
}

// Unified GameState that works for both frontend and backend
export interface UnifiedGameState {
  gameId: string;
  players: UnifiedPlayer[];
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

// Action interfaces
export interface PokerAction {
  type: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
  amount?: number;
  isValid: boolean;
  description: string;
}

export interface ActionStep {
  playerId: string;
  playerName: string;
  isHero: boolean;
  action?: string;
  betAmount?: string;
  completed: boolean;
  position?: string;
}

// API Response types
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  message: string;
  errors?: string[];
}

// Error types for better error handling
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ApiError extends Error {
  type: ApiErrorType;
  code?: string;
  details?: any;
  retryable?: boolean;
}

// Conversion utilities type definitions
export interface ConversionUtils {
  frontendPlayerToUnified: (player: any) => UnifiedPlayer;
  unifiedPlayerToBackend: (player: UnifiedPlayer) => any;
  backendPlayerToUnified: (player: any) => UnifiedPlayer;
  stringToCard: (cardString: string) => Card | null;
  cardToString: (card: Card) => string;
}