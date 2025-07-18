// src/poker-engine/core/engine.ts
import { v4 as uuidv4 } from 'uuid';
import {
  PokerEvent,
  HandInitializedEvent,
  BlindsPostedEvent,
  CardsDealtEvent,
  ActionTakenEvent,
  StreetCompletedEvent,
  HandCompletedEvent,
} from './events';
import {
  HandState,
  PlayerState,
  GameConfig,
  Result,
  ValidationResult,
  LegalAction,
  SidePot,
} from './state';
import { PokerRules } from './rules';
import { Street, ActionType } from '@/types/poker';

export class PokerHandEngine {
  private state: HandState;
  private rules: PokerRules;
  private eventHandlers: Map<string, (state: HandState, event: PokerEvent) => HandState>;

  constructor(gameConfig: GameConfig, existingEvents?: PokerEvent[]) {
    this.rules = new PokerRules(gameConfig.gameType);
    this.state = this.initializeState(gameConfig);
    this.eventHandlers = this.setupEventHandlers();

    if (existingEvents) {
      this.replayEvents(existingEvents);
    }
  }

  private initializeState(gameConfig: GameConfig): HandState {
    return {
      gameId: uuidv4(),
      gameConfig,
      street: Street.PREFLOP,
      communityCards: [],
      players: new Map(),
      playerOrder: [],
      betting: {
        currentBet: 0,
        minRaise: gameConfig.blinds.big,
        lastRaiseSize: gameConfig.blinds.big,
        pot: 0,
        sidePots: [],
        actionOn: null,
        numBets: 0,
        lastAggressor: null,
      },
      events: [],
      actionHistory: [],
      isComplete: false,
    };
  }

  private setupEventHandlers() {
    const handlers = new Map<string, (state: HandState, event: PokerEvent) => HandState>();

    handlers.set('HAND_INITIALIZED', this.handleHandInitialized.bind(this));
    handlers.set('BLINDS_POSTED', this.handleBlindsPosted.bind(this));
    handlers.set('CARDS_DEALT', this.handleCardsDealt.bind(this));
    handlers.set('ACTION_TAKEN', this.handleActionTaken.bind(this));
    handlers.set('STREET_COMPLETED', this.handleStreetCompleted.bind(this));
    handlers.set('HAND_COMPLETED', this.handleHandCompleted.bind(this));

    return handlers;
  }

  private replayEvents(events: PokerEvent[]): void {
    for (const event of events) {
      const result = this.applyEvent(event);
      if (!result.success) {
        throw new Error(`Failed to replay event ${event.type}: ${result.error?.message}`);
      }
    }
  }

  public applyEvent(event: PokerEvent): Result<HandState> {
    // Validate event
    const validation = this.validateEvent(event);
    if (!validation.isValid) {
      return { success: false, error: new Error(validation.error || 'Invalid event') };
    }

    // Apply event
    const handler = this.eventHandlers.get(event.type);
    if (!handler) {
      return { success: false, error: new Error(`Unknown event type: ${event.type}`) };
    }

    try {
      this.state = handler(this.state, event);
      this.state.events.push(event);

      // Check for automatic transitions
      this.checkAutomaticTransitions();

      return { success: true, data: this.state };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private validateEvent(event: PokerEvent): ValidationResult {
    // Basic validation - can be extended
    if (!event.id || !event.type || !event.timestamp) {
      return { isValid: false, error: 'Missing required event fields' };
    }

    return { isValid: true };
  }

  private handleHandInitialized(state: HandState, event: PokerEvent): HandState {
    const handEvent = event as HandInitializedEvent;
    const newState = { ...state };
    const { data } = handEvent;

    // Initialize players
    newState.players = new Map();
    data.players.forEach((p) => {
      newState.players.set(p.id, {
        id: p.id,
        name: p.name,
        position: p.position,
        seatNumber: p.seatNumber,
        stackSize: p.stackSize,
        status: 'active',
        holeCards: [],
        currentBet: 0,
        totalInvested: 0,
        hasActed: false,
        isHero: p.isHero,
      });
    });

    // Set player order based on positions
    newState.playerOrder = this.rules.calculatePlayerOrder(data.players, Street.PREFLOP);

    // Set first player to act
    newState.betting.actionOn = newState.playerOrder[0] || null;

    return newState;
  }

  private handleBlindsPosted(state: HandState, event: PokerEvent): HandState {
    const blindsEvent = event as BlindsPostedEvent;
    const newState = { ...state };

    blindsEvent.data.posts.forEach((post) => {
      const player = newState.players.get(post.playerId);
      if (player) {
        player.stackSize -= post.amount;
        player.currentBet += post.amount;
        player.totalInvested += post.amount;
        newState.betting.pot += post.amount;

        if (post.type === 'big') {
          newState.betting.currentBet = post.amount;
        }
      }
    });

    return newState;
  }

  private handleCardsDealt(state: HandState, event: PokerEvent): HandState {
    const cardsEvent = event as CardsDealtEvent;
    const newState = { ...state };

    cardsEvent.data.cards.forEach((cardData) => {
      if (cardData.playerId) {
        // Hole cards
        const player = newState.players.get(cardData.playerId);
        if (player) {
          player.holeCards = cardData.cards;
        }
      } else {
        // Community cards
        newState.communityCards.push(...cardData.cards);
      }
    });

    return newState;
  }

  private handleActionTaken(state: HandState, event: PokerEvent): HandState {
    const actionEvent = event as ActionTakenEvent;
    const newState = { ...state };
    const { playerId, action, amount } = actionEvent.data;
    const player = newState.players.get(playerId);

    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    // Update player state based on action
    switch (action) {
      case ActionType.FOLD:
        player.status = 'folded';
        break;

      case ActionType.CHECK:
        // No chips to add
        break;

      case ActionType.CALL: {
        const toCall = newState.betting.currentBet - player.currentBet;
        const actualCallAmount = Math.min(toCall, player.stackSize);
        this.addChipsToPot(newState, playerId, actualCallAmount);
        break;
      }

      case ActionType.BET:
      case ActionType.RAISE: {
        const raiseToAmount = amount; // Amount is the total bet amount, not just the raise
        const chipsToAdd = raiseToAmount - player.currentBet;
        this.addChipsToPot(newState, playerId, chipsToAdd);

        const previousBet = state.betting.currentBet;
        newState.betting.currentBet = player.currentBet;
        newState.betting.lastRaiseSize = player.currentBet - previousBet;
        newState.betting.lastAggressor = playerId;
        newState.betting.numBets++;

        // Reset hasActed for other active players
        newState.players.forEach((p, id) => {
          if (id !== playerId && p.status === 'active') {
            p.hasActed = false;
          }
        });
        break;
      }

      case ActionType.ALL_IN: {
        const allInAmount = player.stackSize;
        this.addChipsToPot(newState, playerId, allInAmount);
        player.status = 'allIn';

        // Update currentBet if this all-in is greater than current bet
        if (player.currentBet > newState.betting.currentBet) {
          const previousBet = newState.betting.currentBet;
          newState.betting.currentBet = player.currentBet;
          newState.betting.lastRaiseSize = player.currentBet - previousBet;
          newState.betting.lastAggressor = playerId;
          newState.betting.numBets++;

          // Reset hasActed for other active players
          newState.players.forEach((p, id) => {
            if (id !== playerId && p.status === 'active') {
              p.hasActed = false;
            }
          });
        }

        // Calculate side pots if there are players with different stack sizes who could still act
        const activePlayers = Array.from(newState.players.values()).filter(
          (p) => p.status === 'active' || p.status === 'allIn',
        );

        if (activePlayers.length > 1) {
          const hasVariableStacks = activePlayers.some(
            (p) => p.totalInvested !== player.totalInvested,
          );

          if (hasVariableStacks) {
            this.calculateSidePots(newState);
          }
        }
        break;
      }
    }

    // Mark player as acted
    player.hasActed = true;

    // Add to action history
    newState.actionHistory.push({
      playerId,
      playerName: player.name,
      position: player.position,
      action,
      amount,
      street: state.street,
      timestamp: event.timestamp,
      potAfter: newState.betting.pot,
      stackAfter: player.stackSize,
    });

    // Move to next player
    this.advanceAction(newState);

    return newState;
  }

  private handleStreetCompleted(state: HandState, event: PokerEvent): HandState {
    const streetEvent = event as StreetCompletedEvent;
    const newState = { ...state };

    // Calculate side pots before moving to next street
    const hasAllInPlayers = Array.from(newState.players.values()).some((p) => p.status === 'allIn');
    if (hasAllInPlayers) {
      this.calculateSidePots(newState);
    }

    // Reset betting for new street
    newState.players.forEach((player) => {
      player.currentBet = 0;
      player.hasActed = false;
    });

    newState.betting.currentBet = 0;
    newState.betting.numBets = 0;
    newState.betting.lastAggressor = null;
    newState.betting.actionOn = null; // Reset action to force determineNextPlayer to find first active

    // Update street
    if (streetEvent.data.nextStreet) {
      newState.street = streetEvent.data.nextStreet;

      // Update player order for post-flop - include all players (even all-in)
      // The determineNextPlayer will skip all-in players
      const allPlayers = Array.from(newState.players.entries()).map(([id, p]) => ({
        id,
        position: p.position,
      }));

      newState.playerOrder = this.rules.calculatePlayerOrder(
        allPlayers,
        streetEvent.data.nextStreet,
      );

      // Set first player to act (skip all-in players)
      newState.betting.actionOn = this.rules.determineNextPlayer(newState);
    } else {
      // Hand is complete
      newState.isComplete = true;
    }

    return newState;
  }

  private handleHandCompleted(state: HandState, event: PokerEvent): HandState {
    const completedEvent = event as HandCompletedEvent;
    const newState = { ...state };

    newState.isComplete = true;
    newState.winners = completedEvent.data.winners.map((w) => ({
      ...w,
      potType: 'main' as const,
    }));

    return newState;
  }

  private addChipsToPot(state: HandState, playerId: string, amount: number): void {
    const player = state.players.get(playerId)!;

    // Deduct from stack
    player.stackSize -= amount;
    player.currentBet += amount;
    player.totalInvested += amount;

    // Add to pot
    state.betting.pot += amount;
  }

  private calculateSidePots(state: HandState): void {
    // Get all players who have invested chips
    const investments = Array.from(state.players.entries())
      .filter(([_, p]) => p.totalInvested > 0)
      .map(([id, p]) => ({
        playerId: id,
        amount: p.totalInvested,
        isEligible: p.status !== 'folded',
      }))
      .sort((a, b) => a.amount - b.amount);

    const sidePots: SidePot[] = [];
    let processedAmount = 0;

    for (let i = 0; i < investments.length; i++) {
      const current = investments[i];
      const potAmount = current.amount - processedAmount;

      if (potAmount > 0) {
        const eligiblePlayers = investments
          .filter((inv) => inv.isEligible && inv.amount >= current.amount)
          .map((inv) => inv.playerId);

        // Count contributors (including folded players who contributed to this pot level)
        const contributors = investments.filter((inv) => inv.amount >= current.amount).length;
        const potSize = potAmount * contributors;

        sidePots.push({
          id: `pot-${i}`,
          amount: potSize,
          eligiblePlayers,
          created: {
            street: state.street,
            allInPlayer: current.playerId,
          },
        });

        processedAmount = current.amount;
      }
    }

    state.betting.sidePots = sidePots;
  }

  private advanceAction(state: HandState): void {
    state.betting.actionOn = this.rules.determineNextPlayer(state);
  }

  private checkAutomaticTransitions(): void {
    if (this.rules.isBettingRoundComplete(this.state)) {
      // Automatically complete the street
      const nextStreet = this.getNextStreet(this.state.street);
      const activePlayers = Array.from(this.state.players.values())
        .filter((p) => p.status !== 'folded')
        .map((p) => p.id);

      const event: StreetCompletedEvent = {
        id: uuidv4(),
        type: 'STREET_COMPLETED',
        timestamp: new Date(),
        version: 1,
        data: {
          street: this.state.street,
          pot: this.state.betting.pot,
          activePlayers,
          nextStreet,
        },
      };

      this.applyEvent(event);
    }
  }

  private getNextStreet(currentStreet: Street): Street | undefined {
    const streetOrder: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
    const currentIndex = streetOrder.indexOf(currentStreet);

    if (currentIndex < streetOrder.length - 1) {
      return streetOrder[currentIndex + 1];
    }

    return undefined;
  }

  // Validation methods
  public validateAction(playerId: string, action: ActionType, amount?: number): ValidationResult {
    const player = this.state.players.get(playerId);
    if (!player) {
      return { isValid: false, error: 'Player not found' };
    }

    if (this.state.betting.actionOn !== playerId) {
      return { isValid: false, error: 'Not your turn to act' };
    }

    const legalActions = this.rules.calculateLegalActions(this.state, playerId);
    const isLegal = legalActions.some((a) => a.type === action);

    if (!isLegal) {
      return { isValid: false, error: `Action ${action} is not legal` };
    }

    // Validate amounts for betting actions
    if ([ActionType.BET, ActionType.RAISE].includes(action) && amount !== undefined) {
      const legalAction = legalActions.find((a) => a.type === action);
      if (legalAction && 'minAmount' in legalAction && 'maxAmount' in legalAction) {
        if (amount < legalAction.minAmount! || amount > legalAction.maxAmount!) {
          return {
            isValid: false,
            error: `Amount must be between ${legalAction.minAmount} and ${legalAction.maxAmount}`,
          };
        }
      }
    }

    return { isValid: true };
  }

  // Query methods
  public getCurrentState(): HandState {
    return this.state;
  }

  public getLegalActions(playerId: string): LegalAction[] {
    return this.rules.calculateLegalActions(this.state, playerId);
  }

  public getCurrentPlayer(): PlayerState | null {
    if (!this.state.betting.actionOn) {
      return null;
    }
    return this.state.players.get(this.state.betting.actionOn) || null;
  }

  public isBettingRoundComplete(): boolean {
    return this.rules.isBettingRoundComplete(this.state);
  }
}
