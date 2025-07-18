// src/poker-engine/core/state.ts
import { Position, Street, ActionType, GameType, GameFormat } from '@/types/poker';
import { PokerEvent } from './events';

// Re-export PokerEvent for convenience
export type { PokerEvent } from './events';

export interface PlayerState {
  id: string;
  name: string;
  position: Position;
  seatNumber: number;
  stackSize: number;
  status: 'active' | 'folded' | 'allIn' | 'sittingOut';

  // Cards
  holeCards: string[];

  // Betting state
  currentBet: number; // Amount bet in current street
  totalInvested: number; // Total across all streets
  hasActed: boolean; // Has acted this street
  isHero: boolean;
}

export interface BettingState {
  currentBet: number; // Current bet to match
  minRaise: number; // Minimum legal raise
  lastRaiseSize: number; // Size of last raise
  pot: number; // Main pot
  sidePots: SidePot[]; // Side pots

  // Action tracking
  actionOn: string | null; // Player ID to act
  numBets: number; // Number of bets/raises this street
  lastAggressor: string | null;
}

export interface SidePot {
  id: string;
  amount: number;
  eligiblePlayers: string[];
  created: {
    street: Street;
    allInPlayer: string;
  };
}

export interface GameConfig {
  gameType: GameType;
  gameFormat: GameFormat;
  blinds: {
    small: number;
    big: number;
    ante?: number;
  };
  currency?: string;
}

export interface HandState {
  // Game info
  gameId: string;
  gameConfig: GameConfig;

  // Current state
  street: Street;
  communityCards: string[];

  // Players
  players: Map<string, PlayerState>;
  playerOrder: string[]; // Player IDs in action order

  // Betting
  betting: BettingState;

  // History
  events: PokerEvent[];
  actionHistory: ActionRecord[];

  // Status
  isComplete: boolean;
  winners?: WinnerInfo[];
}

export interface ActionRecord {
  playerId: string;
  playerName: string;
  position: Position;
  action: ActionType;
  amount: number;
  street: Street;
  timestamp: Date;
  potAfter: number;
  stackAfter: number;
}

export interface WinnerInfo {
  playerId: string;
  amount: number;
  handStrength?: string;
  potType: 'main' | 'side';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface LegalAction {
  type: ActionType;
  minAmount?: number;
  maxAmount?: number;
  amount?: number;
  isPartialCall?: boolean;
}

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
