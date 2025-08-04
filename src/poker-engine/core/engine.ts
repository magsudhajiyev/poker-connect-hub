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
  // Add event listener array
  private eventListeners: ((event: PokerEvent) => void | Promise<void>)[] = [];
  private isReplaying: boolean = false;

  constructor(gameConfig: GameConfig, existingEvents?: PokerEvent[]) {
    this.rules = new PokerRules(gameConfig.gameType);
    this.state = this.initializeState(gameConfig);
    this.eventHandlers = this.setupEventHandlers();

    if (existingEvents) {
      this.replayEvents(existingEvents);
    }
  }

  // Add method to register event listeners
  public onEvent(listener: (event: PokerEvent) => void | Promise<void>): void {
    this.eventListeners.push(listener);
  }

  // Remove listener
  public offEvent(listener: (event: PokerEvent) => void | Promise<void>): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  // Emit event to all listeners
  private async emitEvent(event: PokerEvent): Promise<void> {
    for (const listener of this.eventListeners) {
      try {
        await listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
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
    this.isReplaying = true;
    for (const event of events) {
      const result = this.applyEvent(event);
      if (!result.success) {
        throw new Error(`Failed to replay event ${event.type}: ${result.error?.message}`);
      }
    }
    this.isReplaying = false;
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

      // Emit event to listeners synchronously
      // Note: emitEvent is async but we don't await it to avoid blocking
      this.emitEvent(event);

      // Check for automatic transitions only if not replaying
      if (!this.isReplaying) {
        // For testing environment, run transitions synchronously to ensure proper ordering
        if (process.env.NODE_ENV === 'test') {
          this.checkAutomaticTransitions();
        } else {
          // In production, use setTimeout to avoid blocking
          setTimeout(() => {
            this.checkAutomaticTransitions();
          }, 0);
        }
      }

      return { success: true, data: this.state };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // Alias for applyEvent to match EventSourcingAdapter expectations
  public processEvent(event: PokerEvent): Result<HandState> {
    return this.applyEvent(event);
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
    const newState = {
      ...state,
      players: new Map(),
      events: [...state.events],
      actionHistory: [...state.actionHistory],
    };
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
    const newState = {
      ...state,
      players: new Map(Array.from(state.players.entries()).map(([id, p]) => [id, { ...p }])),
      betting: { ...state.betting },
      events: [...state.events],
      actionHistory: [...state.actionHistory],
    };

    
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

    // Add dead blinds to the pot
    if (blindsEvent.data.deadSmallBlind) {
      newState.betting.pot += blindsEvent.data.deadSmallBlind;
    }
    if (blindsEvent.data.deadBigBlind) {
      newState.betting.pot += blindsEvent.data.deadBigBlind;
      // If there's a dead big blind, set it as the current bet
      const hasBigBlindPlayer = blindsEvent.data.posts.some(p => p.type === 'big');
      if (!hasBigBlindPlayer) {
        newState.betting.currentBet = state.gameConfig.blinds.big;
      }
    }


    return newState;
  }

  private handleCardsDealt(state: HandState, event: PokerEvent): HandState {
    const cardsEvent = event as CardsDealtEvent;
    const newState = {
      ...state,
      players: new Map(Array.from(state.players.entries()).map(([id, p]) => [id, { ...p }])),
      betting: { ...state.betting },
      events: [...state.events],
      actionHistory: [...state.actionHistory],
      communityCards: [...state.communityCards],
    };

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
    // Deep clone the state to avoid mutations
    const newState = {
      ...state,
      players: new Map(Array.from(state.players.entries()).map(([id, p]) => [id, { ...p }])),
      betting: { ...state.betting, sidePots: [...state.betting.sidePots] },
      events: [...state.events],
      actionHistory: [...state.actionHistory],
    };
    const { playerId, action, amount } = actionEvent.data;
    const player = newState.players.get(playerId);

    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }
    
    // Validate the action before processing
    const validation = this.validateAction(playerId, action, amount);
    if (!validation.isValid) {
      throw new Error(validation.error);
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
        newState.betting.minRaise = newState.betting.currentBet + newState.betting.lastRaiseSize;
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
          const raiseAmount = player.currentBet - previousBet;
          newState.betting.currentBet = player.currentBet;
          
          // Only reopen action if the all-in is a complete raise
          if (raiseAmount >= newState.betting.lastRaiseSize) {
            newState.betting.lastRaiseSize = raiseAmount;
            newState.betting.minRaise = newState.betting.currentBet + newState.betting.lastRaiseSize;
            newState.betting.lastAggressor = playerId;
            newState.betting.numBets++;

            // Reset hasActed for other active players
            newState.players.forEach((p, id) => {
              if (id !== playerId && p.status === 'active') {
                p.hasActed = false;
              }
            });
          }
        }

        // Don't calculate side pots immediately - wait for betting round completion
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
    // Deep clone the state
    const newState = {
      ...state,
      players: new Map(Array.from(state.players.entries()).map(([id, p]) => [id, { ...p }])),
      betting: { ...state.betting, sidePots: [...state.betting.sidePots] },
      events: [...state.events],
      actionHistory: [...state.actionHistory],
    };

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
    newState.betting.lastRaiseSize = newState.gameConfig.blinds.big;
    newState.betting.minRaise = newState.gameConfig.blinds.big;
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
      

      // Determine first player to act after resetting hasActed
      // This ensures proper player order is followed
      const firstActivePlayer = newState.playerOrder
        .map(id => ({ id, player: newState.players.get(id)! }))
        .find(({ player }) => player && player.status === 'active');
      
      
      newState.betting.actionOn = firstActivePlayer ? firstActivePlayer.id : null;
    } else {
      // Hand is complete
      newState.isComplete = true;
    }


    return newState;
  }

  private handleHandCompleted(state: HandState, event: PokerEvent): HandState {
    const completedEvent = event as HandCompletedEvent;
    const newState = {
      ...state,
      players: new Map(Array.from(state.players.entries()).map(([id, p]) => [id, { ...p }])),
      betting: { ...state.betting, sidePots: [...state.betting.sidePots] },
      events: [...state.events],
      actionHistory: [...state.actionHistory],
    };

    newState.isComplete = true;
    newState.winners = completedEvent.data.winners.map((w) => ({
      ...w,
      potType: 'main' as const,
    }));

    // Award pots to winners
    completedEvent.data.winners.forEach((winner) => {
      const player = newState.players.get(winner.playerId);
      if (player) {
        player.stackSize += winner.amount;
      }
    });

    // Clear the pot after awarding (it should already be 0 if side pots were calculated)
    newState.betting.pot = 0;
    newState.betting.sidePots = [];

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
    const players = Array.from(state.players.entries())
      .filter(([_, p]) => p.totalInvested > 0)
      .map(([id, p]) => ({
        playerId: id,
        invested: p.totalInvested,
        isEligible: p.status !== 'folded',
        isAllIn: p.status === 'allIn',
      }));

    if (players.length === 0) {
return;
}

    // Get unique investment amounts from all-in players
    const allInAmounts = players
      .filter(p => p.isAllIn)
      .map(p => p.invested)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);

    const sidePots: SidePot[] = [];
    let previousLevel = 0;

    // Create side pots for each all-in level
    for (const level of allInAmounts) {
      const contribution = level - previousLevel;
      const contributors = players.filter(p => p.invested >= level);
      const eligibleContributors = contributors.filter(p => p.isEligible);
      
      
      if (contribution > 0 && contributors.length > 0) {
        sidePots.push({
          id: `pot-${sidePots.length}`,
          amount: contribution * contributors.length,
          eligiblePlayers: eligibleContributors.map(p => p.playerId),
          created: {
            street: state.street,
            allInPlayer: players.find(p => p.isAllIn && p.invested === level)?.playerId || '',
          },
        });
      }
      
      previousLevel = level;
    }

    // Create final pot for remaining chips
    const maxAllIn = allInAmounts.length > 0 ? allInAmounts[allInAmounts.length - 1] : 0;
    const playersWithMore = players.filter(p => p.invested > maxAllIn && p.isEligible);
    
    if (playersWithMore.length > 0) {
      const remainingTotal = players
        .filter(p => p.invested > maxAllIn)
        .reduce((sum, p) => sum + (p.invested - maxAllIn), 0);
      
      if (remainingTotal > 0) {
        sidePots.push({
          id: `pot-${sidePots.length}`,
          amount: remainingTotal,
          eligiblePlayers: playersWithMore.map(p => p.playerId),
          created: {
            street: state.street,
            allInPlayer: '',
          },
        });
      }
    }

    // If no all-in players, just keep the main pot
    if (allInAmounts.length === 0) {
      const totalPot = players.reduce((sum, p) => sum + p.invested, 0);
      const eligiblePlayers = players.filter(p => p.isEligible);
      
      if (totalPot > 0 && eligiblePlayers.length > 0) {
        sidePots.push({
          id: 'pot-0',
          amount: totalPot,
          eligiblePlayers: eligiblePlayers.map(p => p.playerId),
          created: {
            street: state.street,
            allInPlayer: '',
          },
        });
      }
    }

    state.betting.sidePots = sidePots;
  }

  private advanceAction(state: HandState): void {
    state.betting.actionOn = this.rules.determineNextPlayer(state);
  }

  private checkAutomaticTransitions(): void {
    // Don't run automatic transitions if hand is already complete
    if (this.state.isComplete) {
      return;
    }
    
    const activePlayers = Array.from(this.state.players.values())
      .filter((p) => p.status !== 'folded');

    // Check if only one player remains (everyone else folded)
    if (activePlayers.length === 1) {
      // Award pot to the remaining player
      const winner = activePlayers[0];
      const totalPot = this.state.betting.pot + 
        this.state.betting.sidePots.reduce((sum, pot) => sum + pot.amount, 0);
      
      // Complete the hand
      const event: HandCompletedEvent = {
        id: uuidv4(),
        type: 'HAND_COMPLETED',
        timestamp: new Date(),
        version: 1,
        data: {
          winners: [{
            playerId: winner.id,
            amount: totalPot,
            handStrength: 'Won by default',
          }],
          showdown: false,
          finalPot: totalPot,
        },
      };

      this.applyEvent(event);
    } else if (this.rules.isBettingRoundComplete(this.state)) {
      // Check if hand should complete (all players all-in or at river)
      const activeNonAllIn = activePlayers.filter((p) => p.status === 'active');
      const shouldCompleteHand = 
        (activeNonAllIn.length === 0 && this.state.street === Street.RIVER) ||
        (this.state.street === Street.RIVER && this.rules.isBettingRoundComplete(this.state));

      if (shouldCompleteHand) {
        // Complete the hand - determine winners
        const totalPot = this.state.betting.pot + 
          this.state.betting.sidePots.reduce((sum, pot) => sum + pot.amount, 0);
        
        // For now, award to first active player (in real implementation, would evaluate hands)
        const event: HandCompletedEvent = {
          id: uuidv4(),
          type: 'HAND_COMPLETED',
          timestamp: new Date(),
          version: 1,
          data: {
            winners: [{
              playerId: activePlayers[0].id,
              amount: totalPot,
              handStrength: 'Best hand',
            }],
            showdown: true,
            finalPot: totalPot,
          },
        };

        this.applyEvent(event);
      } else {
        // Calculate side pots before completing the street
        const hasAllInPlayers = Array.from(this.state.players.values()).some((p) => p.status === 'allIn');
        if (hasAllInPlayers) {
          this.calculateSidePots(this.state);
        }
        
        // Automatically complete the street
        const nextStreet = this.getNextStreet(this.state.street);
        const activePlayerIds = activePlayers.map((p) => p.id);

        const event: StreetCompletedEvent = {
          id: uuidv4(),
          type: 'STREET_COMPLETED',
          timestamp: new Date(),
          version: 1,
          data: {
            street: this.state.street,
            pot: this.state.betting.pot,
            activePlayers: activePlayerIds,
            nextStreet,
          },
        };

        this.applyEvent(event);
      }
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
      return { isValid: false, error: 'Not your turn' };
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
