// src/poker-engine/core/events.ts
import { Position, Street, ActionType, GameType, GameFormat } from '@/types/poker';

export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  version: number; // For future event schema changes
}

export interface HandInitializedEvent extends BaseEvent {
  type: 'HAND_INITIALIZED';
  data: {
    gameId: string;
    gameType: GameType;
    gameFormat: GameFormat;
    blinds: {
      small: number;
      big: number;
      ante?: number;
    };
    players: Array<{
      id: string;
      name: string;
      position: Position;
      stackSize: number;
      seatNumber: number;
      isHero: boolean;
    }>;
    buttonPosition: Position;
  };
}

export interface BlindsPostedEvent extends BaseEvent {
  type: 'BLINDS_POSTED';
  data: {
    posts: Array<{
      playerId: string;
      type: 'small' | 'big' | 'ante';
      amount: number;
    }>;
    deadSmallBlind?: number; // Dead money from missing SB
    deadBigBlind?: number; // Dead money from missing BB
  };
}

export interface CardsDealtEvent extends BaseEvent {
  type: 'CARDS_DEALT';
  data: {
    street: Street;
    cards: Array<{
      playerId?: string; // undefined for community cards
      cards: string[];
    }>;
  };
}

export interface ActionTakenEvent extends BaseEvent {
  type: 'ACTION_TAKEN';
  data: {
    playerId: string;
    action: ActionType;
    amount: number;
    isAllIn: boolean;
    street: Street;
    potBefore: number;
    potAfter: number;
  };
}

export interface StreetCompletedEvent extends BaseEvent {
  type: 'STREET_COMPLETED';
  data: {
    street: Street;
    pot: number;
    activePlayers: string[];
    nextStreet?: Street;
  };
}

export interface HandCompletedEvent extends BaseEvent {
  type: 'HAND_COMPLETED';
  data: {
    winners: Array<{
      playerId: string;
      amount: number;
      handStrength?: string;
    }>;
    showdown: boolean;
    finalPot: number;
  };
}

export type PokerEvent =
  | HandInitializedEvent
  | BlindsPostedEvent
  | CardsDealtEvent
  | ActionTakenEvent
  | StreetCompletedEvent
  | HandCompletedEvent;
