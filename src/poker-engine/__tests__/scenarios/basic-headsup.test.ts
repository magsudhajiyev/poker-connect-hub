import { EventSourcingAdapter } from '../../adapters/EventSourcingAdapter';
import {
  createTestHand,
  setupTestDB,
  teardownTestDB,
  cleanupTestDB,
  expectState,
  getValidActions,
  processCommand,
  TestSetup,
} from '../test-utils';
import { ActionType, Street, Position } from '@/types/poker';

describe('Basic Heads-Up Scenarios', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 1.1: Simple Bet and Fold', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 1000 },
        { id: 'player2', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should handle BTN raise and BB fold', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: BTN raises to 30
      let result = await processCommand(adapter, 'player1', ActionType.RAISE, 30);
      if (!result.success) {
        console.error('Failed to raise:', result.error);
      }
      expect(result.success).toBe(true);

      await expectState(adapter, {
        pot: 40, // BTN: 30 (total), BB: 10 (already posted) = 40
        currentBet: 30,
        players: [
          { id: 'player1', chips: 970 }, // 1000 - 30
        ],
      });

      // BB folds
      result = await processCommand(adapter, 'player2', ActionType.FOLD);
      if (!result.success) {
        console.error('BB fold failed:', result.error);
      }
      expect(result.success).toBe(true);
      
      // Wait for automatic hand completion
      await new Promise(resolve => setTimeout(resolve, 200));

      await expectState(adapter, {
        isHandComplete: true,
        players: [
          { id: 'player1', chips: 1010 }, // Won 40 pot (970 + 40)
          { id: 'player2', chips: 990, folded: true }, // Lost BB
        ],
      });
    });
  });

  describe('Test 1.2: Check Through to Showdown', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 500 },
        { id: 'player2', position: Position.BB, chips: 500 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should handle checking through all streets', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: BTN calls
      await processCommand(adapter, 'player1', ActionType.CALL);
      
      // BB checks
      await processCommand(adapter, 'player2', ActionType.CHECK);

      // After both players have acted, it should move to flop
      await expectState(adapter, {
        pot: 20,
        street: Street.FLOP,
        currentBet: 0,
      });

      // Flop: Both check (BB acts first post-flop in heads-up)
      await processCommand(adapter, 'player2', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.TURN,
      });

      // Turn: Both check
      await processCommand(adapter, 'player2', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.RIVER,
      });

      // River: Both check
      await processCommand(adapter, 'player2', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.CHECK);

      // Note: In real implementation, this would go to showdown
      // For now, the hand should be complete after river action
      await expectState(adapter, {
        isHandComplete: true,
      });
    });
  });

  describe('Test 1.3: Complex Betting Pattern', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 2000 },
        { id: 'player2', position: Position.BB, chips: 2000 },
      ],
      blinds: { small: 10, big: 20 },
    };

    it('should handle bet, raise, re-raise, call pattern', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: BTN raises to 60
      await processCommand(adapter, 'player1', ActionType.RAISE, 60);

      // BB re-raises to 180
      await processCommand(adapter, 'player2', ActionType.RAISE, 180);

      await expectState(adapter, {
        pot: 240, // 60 + 180
        currentBet: 180,
        minimumRaise: 300, // 180 + 120 (previous raise size)
      });

      // BTN re-raises to 500
      await processCommand(adapter, 'player1', ActionType.RAISE, 500);

      await expectState(adapter, {
        pot: 680, // 180 + 500
        currentBet: 500,
        minimumRaise: 820, // 500 + 320 (previous raise size)
      });

      // BB calls
      await processCommand(adapter, 'player2', ActionType.CALL);

      await expectState(adapter, {
        pot: 1000,
        street: Street.FLOP,
        players: [
          { id: 'player1', chips: 1500 },
          { id: 'player2', chips: 1500 },
        ],
      });

      // Flop: BB checks, BTN bets 500
      await processCommand(adapter, 'player2', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.BET, 500);

      await expectState(adapter, {
        pot: 1500,
        currentBet: 500,
      });

      // BB check-raises to 1200
      const validActions = await getValidActions(adapter);
      expect(validActions).toContain(ActionType.RAISE);

      await processCommand(adapter, 'player2', ActionType.RAISE, 1200);

      await expectState(adapter, {
        pot: 2700,
        currentBet: 1200,
      });

      // BTN folds
      await processCommand(adapter, 'player1', ActionType.FOLD);

      await expectState(adapter, {
        isHandComplete: true,
        players: [
          { id: 'player1', chips: 1000, folded: true }, // Lost 1000
          { id: 'player2', chips: 3000 }, // Won 1000
        ],
      });
    });
  });
});
