// src/poker-engine/services/builder.ts
import { v4 as uuidv4 } from 'uuid';
import { PokerHandEngine } from '../core/engine';
import {
  PokerEvent,
  HandInitializedEvent,
  BlindsPostedEvent,
  CardsDealtEvent,
  ActionTakenEvent,
  StreetCompletedEvent,
} from '../core/events';
import { HandState, GameConfig, ValidationResult, LegalAction } from '../core/state';
import { Position, Street, ActionType } from '@/types/poker';

export interface BuilderState {
  gameConfig: GameConfig;
  events: PokerEvent[];
  currentState: HandState;
  isComplete: boolean;
}

export class HandBuilderService {
  private engine: PokerHandEngine;
  private events: PokerEvent[] = [];
  private gameConfig: GameConfig;

  constructor(gameConfig: GameConfig) {
    this.gameConfig = gameConfig;
    this.engine = new PokerHandEngine(gameConfig);
  }

  // Initialize hand with players
  initializeHand(
    players: Array<{
      id: string;
      name: string;
      position: Position;
      stackSize: number;
      isHero: boolean;
    }>,
  ): ValidationResult {
    if (players.length < 2) {
      return { isValid: false, error: 'At least 2 players required' };
    }

    // Find button position - for partial hands, we may not have a button
    const buttonPlayer = players.find((p) => p.position === Position.BTN);
    const buttonPosition = buttonPlayer ? Position.BTN : players[0].position; // Use first player's position if no button

    const event: HandInitializedEvent = {
      id: uuidv4(),
      type: 'HAND_INITIALIZED',
      timestamp: new Date(),
      version: 1,
      data: {
        gameId: uuidv4(),
        gameType: this.gameConfig.gameType,
        gameFormat: this.gameConfig.gameFormat,
        blinds: this.gameConfig.blinds,
        players: players.map((p, index) => ({
          ...p,
          seatNumber: index + 1,
        })),
        buttonPosition: buttonPosition as Position,
      },
    };

    const result = this.engine.applyEvent(event);
    if (result.success) {
      this.events.push(event);
      return { isValid: true };
    }

    return { isValid: false, error: result.error?.message };
  }

  // Post blinds and antes
  postBlinds(): ValidationResult {
    const state = this.engine.getCurrentState();
    const posts: Array<{ playerId: string; type: 'small' | 'big' | 'ante'; amount: number }> = [];

    // Find SB and BB players
    const sbPlayer = Array.from(state.players.values()).find((p) => p.position === Position.SB);
    const bbPlayer = Array.from(state.players.values()).find((p) => p.position === Position.BB);

    // Always include blind amounts in the pot, even if SB/BB aren't in the hand
    // This represents dead blinds
    let deadSmallBlind = this.gameConfig.blinds.small;
    let deadBigBlind = this.gameConfig.blinds.big;

    if (sbPlayer) {
      posts.push({
        playerId: sbPlayer.id,
        type: 'small',
        amount: Math.min(this.gameConfig.blinds.small, sbPlayer.stackSize),
      });
      deadSmallBlind = 0; // SB is covered by player
    }

    if (bbPlayer) {
      posts.push({
        playerId: bbPlayer.id,
        type: 'big',
        amount: Math.min(this.gameConfig.blinds.big, bbPlayer.stackSize),
      });
      deadBigBlind = 0; // BB is covered by player
    }

    // Post antes if applicable
    if (this.gameConfig.blinds.ante) {
      state.players.forEach((player) => {
        if (player.status === 'active') {
          posts.push({
            playerId: player.id,
            type: 'ante',
            amount: Math.min(this.gameConfig.blinds.ante!, player.stackSize),
          });
        }
      });
    }

    // Add dead blinds to the event data
    
    const event: BlindsPostedEvent = {
      id: uuidv4(),
      type: 'BLINDS_POSTED',
      timestamp: new Date(),
      version: 1,
      data: { 
        posts,
        deadSmallBlind,
        deadBigBlind,
      },
    };
    
    

    const result = this.engine.applyEvent(event);
    if (result.success) {
      this.events.push(event);
      return { isValid: true };
    }

    return { isValid: false, error: result.error?.message };
  }

  // Deal cards to players
  dealCards(playerId: string | null, cards: string[], street: Street): ValidationResult {
    const cardsData = playerId ? [{ playerId, cards }] : [{ cards }]; // Community cards

    const event: CardsDealtEvent = {
      id: uuidv4(),
      type: 'CARDS_DEALT',
      timestamp: new Date(),
      version: 1,
      data: {
        street,
        cards: cardsData,
      },
    };

    const result = this.engine.applyEvent(event);
    if (result.success) {
      this.events.push(event);
      return { isValid: true };
    }

    return { isValid: false, error: result.error?.message };
  }

  // Process player action
  processAction(playerId: string, action: ActionType, amount?: number): ValidationResult {
    // Validate action first
    const validation = this.engine.validateAction(playerId, action, amount);
    if (!validation.isValid) {
      return validation;
    }

    const state = this.engine.getCurrentState();
    const potBefore = state.betting.pot;

    // Create action event
    const event: ActionTakenEvent = {
      id: uuidv4(),
      type: 'ACTION_TAKEN',
      timestamp: new Date(),
      version: 1,
      data: {
        playerId,
        action,
        amount: amount || 0,
        isAllIn: action === ActionType.ALL_IN,
        street: state.street,
        potBefore,
        potAfter: 0, // Will be calculated by engine
      },
    };

    const result = this.engine.applyEvent(event);
    if (result.success) {
      this.events.push(event);

      // Check if street is complete
      const newState = this.engine.getCurrentState();
      if (this.engine.isBettingRoundComplete()) {
        this.completeStreet(newState.street);
      }

      return { isValid: true };
    }

    return { isValid: false, error: result.error?.message };
  }

  // Complete current street
  private completeStreet(street: Street): void {
    const state = this.engine.getCurrentState();
    const activePlayers = Array.from(state.players.values())
      .filter((p) => p.status !== 'folded')
      .map((p) => p.id);

    const nextStreet = this.getNextStreet(street);

    const event: StreetCompletedEvent = {
      id: uuidv4(),
      type: 'STREET_COMPLETED',
      timestamp: new Date(),
      version: 1,
      data: {
        street,
        pot: state.betting.pot,
        activePlayers,
        nextStreet,
      },
    };

    this.engine.applyEvent(event);
    this.events.push(event);
  }

  // Get current state
  getCurrentState(): BuilderState {
    const state = this.engine.getCurrentState();
    return {
      gameConfig: this.gameConfig,
      events: this.events,
      currentState: state,
      isComplete: state.isComplete,
    };
  }

  // Get events for saving
  getEvents(): PokerEvent[] {
    return [...this.events];
  }

  // Get legal actions for current player
  getLegalActions(): LegalAction[] {
    const state = this.engine.getCurrentState();
    if (!state.betting.actionOn) {
      return [];
    }

    return this.engine.getLegalActions(state.betting.actionOn);
  }

  private getNextStreet(currentStreet: Street): Street | undefined {
    const streetOrder: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
    const currentIndex = streetOrder.indexOf(currentStreet);

    if (currentIndex < streetOrder.length - 1) {
      return streetOrder[currentIndex + 1];
    }

    return undefined;
  }
}
