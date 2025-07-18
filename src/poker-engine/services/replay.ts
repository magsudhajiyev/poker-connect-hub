// src/poker-engine/services/replay.ts
import { PokerHandEngine } from '../core/engine';
import { IPokerHand } from '@/types/poker-engine';
import { HandState } from '../core/state';
import { PokerEvent } from '../core/events';
import { Street } from '@/types/poker';

export interface ActionTimelineItem {
  index: number;
  type: string;
  timestamp: Date;
  description: string;
  street: Street;
  playerId?: string;
  playerName?: string;
}

export class HandReplayService {
  private engine: PokerHandEngine;
  private currentIndex: number = -1;
  private states: Map<number, HandState> = new Map();

  constructor(private hand: IPokerHand) {
    this.engine = new PokerHandEngine(hand.gameConfig as any);
    this.precomputeStates();
  }

  // Precompute states for performance
  private precomputeStates(): void {
    this.hand.events.forEach((event, index) => {
      this.engine.applyEvent(event);
      this.states.set(index, this.engine.getCurrentState());
    });
  }

  // Load at specific street using snapshots
  loadAtStreet(street: Street): HandState {
    // Find the last event for this street
    let targetIndex = -1;

    for (let i = this.hand.events.length - 1; i >= 0; i--) {
      const event = this.hand.events[i];
      if (event.type === 'STREET_COMPLETED' && (event as any).data.street === street) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex >= 0) {
      this.currentIndex = targetIndex;
      return this.states.get(targetIndex)!;
    }

    // Fallback to beginning
    this.currentIndex = 0;
    return this.states.get(0)!;
  }

  // Navigation methods
  nextAction(): HandState | null {
    if (this.currentIndex >= this.hand.events.length - 1) {
      return null;
    }

    this.currentIndex++;
    return this.states.get(this.currentIndex) || null;
  }

  previousAction(): HandState | null {
    if (this.currentIndex <= 0) {
      return null;
    }

    this.currentIndex--;
    return this.states.get(this.currentIndex) || null;
  }

  jumpToAction(index: number): HandState {
    if (index < 0 || index >= this.hand.events.length) {
      throw new Error('Invalid event index');
    }

    this.currentIndex = index;
    return this.states.get(index)!;
  }

  getCurrentState(): HandState | null {
    return this.states.get(this.currentIndex) || null;
  }

  // Generate timeline for UI
  getActionTimeline(): ActionTimelineItem[] {
    return this.hand.events.map((event, index) => {
      const item: ActionTimelineItem = {
        index,
        type: event.type,
        timestamp: event.timestamp,
        description: this.generateDescription(event),
        street: this.getEventStreet(event),
      };

      if (event.type === 'ACTION_TAKEN') {
        const state = this.states.get(index);
        const actionEvent = event as any;
        const player = state?.players.get(actionEvent.data.playerId);
        if (player) {
          item.playerId = player.id;
          item.playerName = player.name;
        }
      }

      return item;
    });
  }

  private generateDescription(event: PokerEvent): string {
    switch (event.type) {
      case 'HAND_INITIALIZED': {
        const initEvent = event as any;
        return `Hand started with ${initEvent.data.players.length} players`;
      }

      case 'BLINDS_POSTED':
        return 'Blinds posted';

      case 'CARDS_DEALT': {
        const cardsEvent = event as any;
        if (cardsEvent.data.cards[0].playerId) {
          return 'Hole cards dealt';
        }
        return `${cardsEvent.data.street} cards dealt`;
      }

      case 'ACTION_TAKEN': {
        const actionEvent = event as any;
        const state = this.states.get(this.hand.events.indexOf(event));
        const player = state?.players.get(actionEvent.data.playerId);
        const name = player?.name || 'Unknown';

        switch (actionEvent.data.action) {
          case 'fold':
            return `${name} folds`;
          case 'check':
            return `${name} checks`;
          case 'call':
            return `${name} calls ${actionEvent.data.amount}`;
          case 'bet':
            return `${name} bets ${actionEvent.data.amount}`;
          case 'raise':
            return `${name} raises to ${actionEvent.data.amount}`;
          case 'all-in':
            return `${name} goes all-in for ${actionEvent.data.amount}`;
          default:
            return `${name} ${actionEvent.data.action}`;
        }
      }

      case 'STREET_COMPLETED': {
        const streetEvent = event as any;
        return `${streetEvent.data.street} completed`;
      }

      case 'HAND_COMPLETED':
        return 'Hand completed';

      default:
        return (event as any).type || 'Unknown event';
    }
  }

  private getEventStreet(event: PokerEvent): Street {
    if (event.type === 'ACTION_TAKEN') {
      return (event as any).data.street;
    }
    if (event.type === 'STREET_COMPLETED') {
      return (event as any).data.street;
    }
    if (event.type === 'CARDS_DEALT') {
      return (event as any).data.street;
    }

    // Default to preflop for initialization events
    return Street.PREFLOP;
  }
}
