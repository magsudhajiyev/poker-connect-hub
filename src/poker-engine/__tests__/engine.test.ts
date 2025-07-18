// src/poker-engine/__tests__/engine.test.ts
import { PokerHandEngine } from '../core/engine';
import { GameConfig } from '../core/state';
import { HandInitializedEvent, BlindsPostedEvent, ActionTakenEvent } from '../core/events';
import { v4 as uuidv4 } from 'uuid';
import { Street, GameType, GameFormat, ActionType } from '@/types/poker';

describe('PokerHandEngine', () => {
  let engine: PokerHandEngine;
  let gameConfig: GameConfig;

  beforeEach(() => {
    gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 1, big: 2 },
    };
    engine = new PokerHandEngine(gameConfig);
  });

  describe('Hand Initialization', () => {
    it('should initialize hand with correct players', () => {
      const result = engine.applyEvent({
        id: '1',
        type: 'HAND_INITIALIZED',
        timestamp: new Date(),
        version: 1,
        data: {
          gameId: 'test-game',
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 1, big: 2 },
          players: [
            {
              id: 'p1',
              name: 'Player 1',
              position: 'btn',
              stackSize: 100,
              seatNumber: 1,
              isHero: true,
            },
            {
              id: 'p2',
              name: 'Player 2',
              position: 'sb',
              stackSize: 150,
              seatNumber: 2,
              isHero: false,
            },
            {
              id: 'p3',
              name: 'Player 3',
              position: 'bb',
              stackSize: 200,
              seatNumber: 3,
              isHero: false,
            },
          ],
          buttonPosition: 'btn',
        },
      } as HandInitializedEvent);

      expect(result.success).toBe(true);
      const state = engine.getCurrentState();
      expect(state.players.size).toBe(3);
      expect(state.players.get('p1')?.stackSize).toBe(100);
    });
  });

  describe('Betting Actions', () => {
    beforeEach(() => {
      // Initialize a standard hand
      engine.applyEvent({
        id: uuidv4(),
        type: 'HAND_INITIALIZED',
        timestamp: new Date(),
        version: 1,
        data: {
          gameId: 'test-game',
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 1, big: 2 },
          players: [
            {
              id: 'p1',
              name: 'Player 1',
              position: 'btn',
              stackSize: 100,
              seatNumber: 1,
              isHero: true,
            },
            {
              id: 'p2',
              name: 'Player 2',
              position: 'sb',
              stackSize: 150,
              seatNumber: 2,
              isHero: false,
            },
            {
              id: 'p3',
              name: 'Player 3',
              position: 'bb',
              stackSize: 200,
              seatNumber: 3,
              isHero: false,
            },
          ],
          buttonPosition: 'btn',
        },
      } as HandInitializedEvent);

      engine.applyEvent({
        id: uuidv4(),
        type: 'BLINDS_POSTED',
        timestamp: new Date(),
        version: 1,
        data: {
          posts: [
            { playerId: 'p2', type: 'small', amount: 1 },
            { playerId: 'p3', type: 'big', amount: 2 },
          ],
        },
      } as BlindsPostedEvent);
    });

    it('should handle fold action correctly', () => {
      const currentPlayer = engine.getCurrentPlayer();
      expect(currentPlayer).toBeDefined();

      const validation = engine.validateAction(currentPlayer!.id, ActionType.FOLD);
      expect(validation.isValid).toBe(true);

      const result = engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: currentPlayer!.id,
          action: 'fold',
          amount: 0,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 3,
          potAfter: 3,
        },
      } as ActionTakenEvent);

      expect(result.success).toBe(true);
      const state = engine.getCurrentState();
      expect(state.players.get(currentPlayer!.id)?.status).toBe('folded');
    });

    it('should handle raise action with validation', () => {
      const currentPlayer = engine.getCurrentPlayer();
      expect(currentPlayer).toBeDefined();

      const legalActions = engine.getLegalActions(currentPlayer!.id);
      const raiseAction = legalActions.find((a) => a.type === 'raise');

      expect(raiseAction).toBeDefined();
      expect(raiseAction?.minAmount).toBeGreaterThan(0);

      // Try invalid raise amount
      const invalidResult = engine.validateAction(currentPlayer!.id, ActionType.RAISE, 1);
      expect(invalidResult.isValid).toBe(false);

      // Valid raise
      const validResult = engine.validateAction(currentPlayer!.id, ActionType.RAISE, 6);
      expect(validResult.isValid).toBe(true);
    });

    it('should handle call action correctly', () => {
      // First player (BTN) should act first preflop
      const currentPlayer = engine.getCurrentPlayer();
      expect(currentPlayer?.id).toBe('p1');
      expect(currentPlayer?.position).toBe('btn');

      // BTN should be able to call the big blind
      const legalActions = engine.getLegalActions(currentPlayer!.id);
      const callAction = legalActions.find((a) => a.type === ActionType.CALL);

      expect(callAction).toBeDefined();
      expect(callAction?.amount).toBe(2); // Should call BB amount

      // Validate call action
      const validation = engine.validateAction(currentPlayer!.id, ActionType.CALL);
      expect(validation.isValid).toBe(true);

      // Apply call action
      const result = engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: currentPlayer!.id,
          action: ActionType.CALL,
          amount: 2,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 3,
          potAfter: 5,
        },
      } as ActionTakenEvent);

      expect(result.success).toBe(true);

      // Check state after call
      const state = engine.getCurrentState();
      const p1 = state.players.get('p1');
      expect(p1?.currentBet).toBe(2);
      expect(p1?.stackSize).toBe(98); // 100 - 2
      expect(p1?.hasActed).toBe(true);

      // Next player should be SB
      const nextPlayer = engine.getCurrentPlayer();
      expect(nextPlayer?.id).toBe('p2');
      expect(nextPlayer?.position).toBe('sb');
    });

    it('should handle multiple calls and advance betting round', () => {
      // BTN calls
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'p1',
          action: ActionType.CALL,
          amount: 2,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 3,
          potAfter: 5,
        },
      } as ActionTakenEvent);

      // SB completes (calls 1 more)
      const sbPlayer = engine.getCurrentPlayer();
      expect(sbPlayer?.id).toBe('p2');

      const sbLegalActions = engine.getLegalActions(sbPlayer!.id);
      const sbCallAction = sbLegalActions.find((a) => a.type === ActionType.CALL);
      expect(sbCallAction?.amount).toBe(1); // SB already posted 1, needs 1 more

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'p2',
          action: ActionType.CALL,
          amount: 1,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 5,
          potAfter: 6,
        },
      } as ActionTakenEvent);

      // BB should have option to check or raise
      const bbPlayer = engine.getCurrentPlayer();
      expect(bbPlayer?.id).toBe('p3');

      const bbLegalActions = engine.getLegalActions(bbPlayer!.id);
      const checkAction = bbLegalActions.find((a) => a.type === ActionType.CHECK);
      const raiseAction = bbLegalActions.find((a) => a.type === ActionType.RAISE);

      expect(checkAction).toBeDefined(); // BB can check
      expect(raiseAction).toBeDefined(); // BB can raise

      // BB checks
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'p3',
          action: ActionType.CHECK,
          amount: 0,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 6,
          potAfter: 6,
        },
      } as ActionTakenEvent);

      // After BB checks, the street should automatically advance to FLOP
      const state = engine.getCurrentState();

      // The street should have advanced to FLOP
      expect(state.street).toBe(Street.FLOP);

      // All betting values should be reset for the new street
      const playersDebug = Array.from(state.players.entries()).map(([id, p]) => ({
        id,
        hasActed: p.hasActed,
        currentBet: p.currentBet,
        status: p.status,
      }));

      expect(playersDebug).toEqual([
        { id: 'p1', hasActed: false, currentBet: 0, status: 'active' },
        { id: 'p2', hasActed: false, currentBet: 0, status: 'active' },
        { id: 'p3', hasActed: false, currentBet: 0, status: 'active' },
      ]);

      // The pot should contain all the bets
      expect(state.betting.pot).toBe(6);

      // Action should be on SB (p2) post-flop
      expect(state.betting.actionOn).toBe('p2');
    });

    it('should create side pots on all-in', () => {
      const currentPlayer = engine.getCurrentPlayer();
      expect(currentPlayer).toBeDefined();

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: currentPlayer!.id,
          action: 'all-in',
          amount: currentPlayer!.stackSize,
          isAllIn: true,
          street: Street.PREFLOP,
          potBefore: 3,
          potAfter: 3 + currentPlayer!.stackSize,
        },
      } as ActionTakenEvent);

      const state = engine.getCurrentState();
      expect(state.betting.sidePots.length).toBeGreaterThan(0);
      expect(state.players.get(currentPlayer!.id)?.status).toBe('allIn');
    });
  });

  describe('BB Facing Raise Scenarios', () => {
    beforeEach(() => {
      // Initialize with UTG (20 chips), CO (100 chips), BB (100 chips) with 5/10 blinds
      engine = new PokerHandEngine({
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 5, big: 10 },
      });

      engine.applyEvent({
        id: uuidv4(),
        type: 'HAND_INITIALIZED',
        timestamp: new Date(),
        version: 1,
        data: {
          gameId: 'test-game',
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 5, big: 10 },
          players: [
            {
              id: 'utg',
              name: 'UTG Player',
              position: 'utg',
              stackSize: 20,
              seatNumber: 1,
              isHero: false,
            },
            {
              id: 'co',
              name: 'CO Player',
              position: 'co',
              stackSize: 100,
              seatNumber: 2,
              isHero: false,
            },
            {
              id: 'bb',
              name: 'BB Player',
              position: 'bb',
              stackSize: 100,
              seatNumber: 3,
              isHero: true,
            },
          ],
          buttonPosition: 'btn',
        },
      } as HandInitializedEvent);

      // Post blinds
      engine.applyEvent({
        id: uuidv4(),
        type: 'BLINDS_POSTED',
        timestamp: new Date(),
        version: 1,
        data: {
          posts: [{ playerId: 'bb', type: 'big', amount: 10 }],
        },
      } as BlindsPostedEvent);
    });

    it('BB should NOT be able to check when facing a raise', () => {
      // UTG limps (calls 10)
      const utgPlayer = engine.getCurrentPlayer();
      expect(utgPlayer?.id).toBe('utg');

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.CALL,
          amount: 10,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 10,
          potAfter: 20,
        },
      } as ActionTakenEvent);

      // CO raises to 30
      const coPlayer = engine.getCurrentPlayer();
      expect(coPlayer?.id).toBe('co');

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.RAISE,
          amount: 30,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 20,
          potAfter: 50,
        },
      } as ActionTakenEvent);

      // BB should be to act
      const bbPlayer = engine.getCurrentPlayer();
      expect(bbPlayer?.id).toBe('bb');

      // Get BB's legal actions
      const bbLegalActions = engine.getLegalActions('bb');
      const actionTypes = bbLegalActions.map((a) => a.type);

      // BB should NOT have CHECK option
      expect(actionTypes).not.toContain(ActionType.CHECK);

      // BB should have FOLD, CALL, RAISE, and ALL_IN
      expect(actionTypes).toContain(ActionType.FOLD);
      expect(actionTypes).toContain(ActionType.CALL);
      expect(actionTypes).toContain(ActionType.RAISE);
      expect(actionTypes).toContain(ActionType.ALL_IN);

      // BB needs to call 20 more (30 - 10 already posted)
      const callAction = bbLegalActions.find((a) => a.type === ActionType.CALL);
      expect(callAction?.amount).toBe(20);
    });

    it('BB can check when everyone limps', () => {
      // UTG limps (calls 10)
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.CALL,
          amount: 10,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 10,
          potAfter: 20,
        },
      } as ActionTakenEvent);

      // CO also limps (calls 10)
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.CALL,
          amount: 10,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 20,
          potAfter: 30,
        },
      } as ActionTakenEvent);

      // BB should be able to check
      const bbLegalActions = engine.getLegalActions('bb');
      const actionTypes = bbLegalActions.map((a) => a.type);

      // BB should have CHECK option
      expect(actionTypes).toContain(ActionType.CHECK);
      expect(actionTypes).toContain(ActionType.RAISE);
      expect(actionTypes).toContain(ActionType.ALL_IN);

      // BB should NOT have CALL or FOLD when no one raised
      expect(actionTypes).not.toContain(ActionType.CALL);
      expect(actionTypes).not.toContain(ActionType.FOLD);
    });

    it('should handle UTG shove, CO call, BB raise scenario', () => {
      // UTG goes all-in (20 chips)
      const utgActions = engine.getLegalActions('utg');
      const utgAllIn = utgActions.find((a) => a.type === ActionType.ALL_IN);
      expect(utgAllIn?.amount).toBe(20);

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.ALL_IN,
          amount: 20,
          isAllIn: true,
          street: Street.PREFLOP,
          potBefore: 10,
          potAfter: 30,
        },
      } as ActionTakenEvent);

      // CO should be able to call, raise, or fold
      const coActions = engine.getLegalActions('co');
      const coActionTypes = coActions.map((a) => a.type);

      expect(coActionTypes).toContain(ActionType.FOLD);
      expect(coActionTypes).toContain(ActionType.CALL);
      expect(coActionTypes).toContain(ActionType.RAISE);
      expect(coActionTypes).toContain(ActionType.ALL_IN);

      // CO calls the 20
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.CALL,
          amount: 20,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 30,
          potAfter: 50,
        },
      } as ActionTakenEvent);

      // BB should be able to call, raise, or fold
      const bbActions = engine.getLegalActions('bb');
      const bbActionTypes = bbActions.map((a) => a.type);

      expect(bbActionTypes).toContain(ActionType.FOLD);
      expect(bbActionTypes).toContain(ActionType.CALL);
      expect(bbActionTypes).toContain(ActionType.RAISE);
      expect(bbActionTypes).toContain(ActionType.ALL_IN);
      expect(bbActionTypes).not.toContain(ActionType.CHECK);

      // BB needs to call 10 more (20 - 10 already posted)
      const bbCallAction = bbActions.find((a) => a.type === ActionType.CALL);
      expect(bbCallAction?.amount).toBe(10);
    });

    it('should handle complex multi-way pot with re-raises', () => {
      // UTG calls 10
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.CALL,
          amount: 10,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 10,
          potAfter: 20,
        },
      } as ActionTakenEvent);

      // CO raises to 30
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.RAISE,
          amount: 30,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 20,
          potAfter: 50,
        },
      } as ActionTakenEvent);

      // BB re-raises to 60
      const bbActions = engine.getLegalActions('bb');
      const bbRaiseAction = bbActions.find((a) => a.type === ActionType.RAISE);
      expect(bbRaiseAction).toBeDefined();
      expect(bbRaiseAction?.minAmount).toBeGreaterThanOrEqual(50); // Min raise should be at least 50 (30 + 20 raise size)

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'bb',
          action: ActionType.RAISE,
          amount: 60,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 50,
          potAfter: 110,
        },
      } as ActionTakenEvent);

      // UTG should face 50 to call (60 - 10 already in)
      const utgActions2 = engine.getLegalActions('utg');
      const utgCallAction = utgActions2.find((a) => a.type === ActionType.CALL);

      // UTG only has 10 left, so should only be able to go all-in
      expect(utgCallAction).toBeUndefined();
      const utgAllInAction = utgActions2.find((a) => a.type === ActionType.ALL_IN);
      expect(utgAllInAction?.amount).toBe(10);
      expect(utgAllInAction?.isPartialCall).toBe(true);

      // UTG folds
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.FOLD,
          amount: 0,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 110,
          potAfter: 110,
        },
      } as ActionTakenEvent);

      // CO needs to call 30 more (60 - 30 already in)
      const coActions2 = engine.getLegalActions('co');
      const coCallAction = coActions2.find((a) => a.type === ActionType.CALL);
      expect(coCallAction?.amount).toBe(30);

      // CO can also re-raise or go all-in
      expect(coActions2.map((a) => a.type)).toContain(ActionType.RAISE);
      expect(coActions2.map((a) => a.type)).toContain(ActionType.ALL_IN);
    });
  });

  describe('Multi-Street Scenarios', () => {
    beforeEach(() => {
      // Initialize with same setup: UTG (20), CO (100), BB (100) with 5/10 blinds
      engine = new PokerHandEngine({
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 5, big: 10 },
      });

      engine.applyEvent({
        id: uuidv4(),
        type: 'HAND_INITIALIZED',
        timestamp: new Date(),
        version: 1,
        data: {
          gameId: 'test-game',
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 5, big: 10 },
          players: [
            {
              id: 'utg',
              name: 'UTG Player',
              position: 'utg',
              stackSize: 20,
              seatNumber: 1,
              isHero: false,
            },
            {
              id: 'co',
              name: 'CO Player',
              position: 'co',
              stackSize: 100,
              seatNumber: 2,
              isHero: false,
            },
            {
              id: 'bb',
              name: 'BB Player',
              position: 'bb',
              stackSize: 100,
              seatNumber: 3,
              isHero: true,
            },
          ],
          buttonPosition: 'btn',
        },
      } as HandInitializedEvent);

      engine.applyEvent({
        id: uuidv4(),
        type: 'BLINDS_POSTED',
        timestamp: new Date(),
        version: 1,
        data: {
          posts: [{ playerId: 'bb', type: 'big', amount: 10 }],
        },
      } as BlindsPostedEvent);
    });

    it('should correctly handle action flow from preflop through river', () => {
      // Preflop: UTG shoves 20, CO calls, BB calls
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.ALL_IN,
          amount: 20,
          isAllIn: true,
          street: Street.PREFLOP,
          potBefore: 10,
          potAfter: 30,
        },
      } as ActionTakenEvent);

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.CALL,
          amount: 20,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 30,
          potAfter: 50,
        },
      } as ActionTakenEvent);

      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'bb',
          action: ActionType.CALL,
          amount: 10, // Only needs 10 more
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 50,
          potAfter: 60,
        },
      } as ActionTakenEvent);

      // Manually advance to flop (in real app this would be automatic)
      engine.applyEvent({
        id: uuidv4(),
        type: 'STREET_COMPLETED',
        timestamp: new Date(),
        version: 1,
        data: {
          street: Street.PREFLOP,
          pot: 60,
          activePlayers: ['utg', 'co', 'bb'],
          nextStreet: Street.FLOP,
        },
      });

      // On flop, UTG is all-in, so action should be between BB and CO
      const flopState = engine.getCurrentState();
      expect(flopState.street).toBe(Street.FLOP);

      // BB should act first on flop (as they are in earlier position)
      const currentPlayer = engine.getCurrentPlayer();
      expect(currentPlayer?.id).toBe('bb');

      // BB should be able to check or bet (not call since no one has bet)
      const bbFlopActions = engine.getLegalActions('bb');
      const bbFlopActionTypes = bbFlopActions.map((a) => a.type);

      expect(bbFlopActionTypes).toContain(ActionType.CHECK);
      expect(bbFlopActionTypes).toContain(ActionType.BET);
      expect(bbFlopActionTypes).not.toContain(ActionType.CALL);
      expect(bbFlopActionTypes).not.toContain(ActionType.FOLD);

      // BB checks
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'bb',
          action: ActionType.CHECK,
          amount: 0,
          isAllIn: false,
          street: Street.FLOP,
          potBefore: 60,
          potAfter: 60,
        },
      } as ActionTakenEvent);

      // CO should also be able to check or bet
      const coFlopActions = engine.getLegalActions('co');
      const coFlopActionTypes = coFlopActions.map((a) => a.type);

      expect(coFlopActionTypes).toContain(ActionType.CHECK);
      expect(coFlopActionTypes).toContain(ActionType.BET);

      // CO bets 30
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.BET,
          amount: 30,
          isAllIn: false,
          street: Street.FLOP,
          potBefore: 60,
          potAfter: 90,
        },
      } as ActionTakenEvent);

      // Now BB faces a bet and should have fold, call, raise options
      const bbFlopActions2 = engine.getLegalActions('bb');
      const bbFlopActionTypes2 = bbFlopActions2.map((a) => a.type);

      expect(bbFlopActionTypes2).toContain(ActionType.FOLD);
      expect(bbFlopActionTypes2).toContain(ActionType.CALL);
      expect(bbFlopActionTypes2).toContain(ActionType.RAISE);
      expect(bbFlopActionTypes2).not.toContain(ActionType.CHECK);
    });

    it('should handle side pots correctly when UTG is all-in', () => {
      // UTG all-in 20
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'utg',
          action: ActionType.ALL_IN,
          amount: 20,
          isAllIn: true,
          street: Street.PREFLOP,
          potBefore: 10,
          potAfter: 30,
        },
      } as ActionTakenEvent);

      // CO raises to 50
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'co',
          action: ActionType.RAISE,
          amount: 50,
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 30,
          potAfter: 80,
        },
      } as ActionTakenEvent);

      // BB calls 50
      engine.applyEvent({
        id: uuidv4(),
        type: 'ACTION_TAKEN',
        timestamp: new Date(),
        version: 1,
        data: {
          playerId: 'bb',
          action: ActionType.CALL,
          amount: 40, // 50 - 10 already posted
          isAllIn: false,
          street: Street.PREFLOP,
          potBefore: 80,
          potAfter: 120,
        },
      } as ActionTakenEvent);

      const state = engine.getCurrentState();

      // Should have created side pots
      expect(state.betting.sidePots.length).toBeGreaterThan(0);

      // Main pot should be 60 (20 from each player)
      const mainPot = state.betting.sidePots[0];
      expect(mainPot.amount).toBe(60);
      expect(mainPot.eligiblePlayers).toContain('utg');
      expect(mainPot.eligiblePlayers).toContain('co');
      expect(mainPot.eligiblePlayers).toContain('bb');

      // Side pot should be 60 (30 each from CO and BB)
      if (state.betting.sidePots.length > 1) {
        const sidePot = state.betting.sidePots[1];
        expect(sidePot.amount).toBe(60);
        expect(sidePot.eligiblePlayers).not.toContain('utg');
        expect(sidePot.eligiblePlayers).toContain('co');
        expect(sidePot.eligiblePlayers).toContain('bb');
      }
    });
  });

  describe('Street Progression', () => {
    it('should advance streets correctly', () => {
      // Setup and complete preflop betting
      engine.applyEvent({
        id: uuidv4(),
        type: 'HAND_INITIALIZED',
        timestamp: new Date(),
        version: 1,
        data: {
          gameId: 'test-game',
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 1, big: 2 },
          players: [
            {
              id: 'p1',
              name: 'Player 1',
              position: 'sb',
              stackSize: 100,
              seatNumber: 1,
              isHero: true,
            },
            {
              id: 'p2',
              name: 'Player 2',
              position: 'bb',
              stackSize: 150,
              seatNumber: 2,
              isHero: false,
            },
          ],
          buttonPosition: 'btn',
        },
      } as HandInitializedEvent);

      engine.applyEvent({
        id: uuidv4(),
        type: 'STREET_COMPLETED',
        timestamp: new Date(),
        version: 1,
        data: {
          street: Street.PREFLOP,
          pot: 10,
          activePlayers: ['p1', 'p2'],
          nextStreet: Street.FLOP,
        },
      });

      const state = engine.getCurrentState();
      expect(state.street).toBe(Street.FLOP);
      expect(state.betting.currentBet).toBe(0);

      // Verify player order changed for post-flop
      expect(state.playerOrder[0]).toBe('p1'); // SB acts first post-flop
    });
  });
});
