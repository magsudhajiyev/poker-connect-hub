import {
  createTestHand,
  setupTestDB,
  teardownTestDB,
  cleanupTestDB,
  expectState,
  processCommand,
  TestSetup,
} from '../test-utils';
import { ActionType, Street, Position } from '@/types/poker';

describe('Flop Checking Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Basic Flop Checking', () => {
    const setup: TestSetup = {
      players: [
        { id: 'utg', position: Position.UTG, chips: 1000 },
        { id: 'bb', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should allow player to check on flop after preflop completes', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP: UTG calls, BB checks to complete the round
      await processCommand(adapter, 'utg', ActionType.CALL, 10);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      // Wait for automatic street transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Verify we are now on flop
      await expectState(adapter, {
        street: Street.FLOP,
        pot: 25, // Dead SB (5) + UTG call (10) + BB check (10) = 25
        currentBet: 0, // Reset for new street
      });

      // Get current state to determine who acts first on flop
      const flopState = await adapter.rebuildState();
      const firstToAct = flopState.currentState.betting.actionOn;

      // BB should act first postflop in heads-up
      expect(firstToAct).toBe('bb');

      // BB should be able to check on the flop
      const validActions = await adapter.getValidActions();
      expect(validActions).toContain(ActionType.CHECK);

      // Execute the check
      const checkResult = await processCommand(adapter, 'bb', ActionType.CHECK);
      expect(checkResult.success).toBe(true);

      // Verify state after check
      await expectState(adapter, {
        street: Street.FLOP,
        currentBet: 0,
        pot: 25,
      });

      // Now UTG should be to act
      const afterCheckState = await adapter.rebuildState();
      expect(afterCheckState.currentState.betting.actionOn).toBe('utg');
    });

    it('should handle sequential checks on flop', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP: Complete the betting round
      await processCommand(adapter, 'utg', ActionType.CALL, 10);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.FLOP,
      });

      // Both players check
      await processCommand(adapter, 'bb', ActionType.CHECK);
      await processCommand(adapter, 'utg', ActionType.CHECK);

      // Should advance to turn
      await expectState(adapter, {
        street: Street.TURN,
        pot: 25, // Same pot as flop
        currentBet: 0,
      });

      // BB should act first on turn as well
      const turnState = await adapter.rebuildState();
      expect(turnState.currentState.betting.actionOn).toBe('bb');
    });

    it('should allow check-bet-call sequence on flop', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP
      await processCommand(adapter, 'utg', ActionType.CALL, 10);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.FLOP,
      });

      // BB checks
      await processCommand(adapter, 'bb', ActionType.CHECK);

      // UTG bets
      await processCommand(adapter, 'utg', ActionType.BET, 15);

      await expectState(adapter, {
        street: Street.FLOP,
        currentBet: 15,
        pot: 40, // 25 + 15
      });

      // BB calls
      await processCommand(adapter, 'bb', ActionType.CALL, 15);

      // Should advance to turn
      await expectState(adapter, {
        street: Street.TURN,
        pot: 55, // 25 + 15 + 15
        currentBet: 0, // Reset for new street
      });
    });
  });

  describe('Multi-Player Flop Checking', () => {
    const multiPlayerSetup: TestSetup = {
      players: [
        { id: 'utg', position: Position.UTG, chips: 1000 },
        { id: 'mp', position: Position.MP, chips: 1000 },
        { id: 'bb', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should handle all players checking on flop', async () => {
      const adapter = await createTestHand(multiPlayerSetup);

      // PREFLOP: All call
      await processCommand(adapter, 'utg', ActionType.CALL, 10);
      await processCommand(adapter, 'mp', ActionType.CALL, 10);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.FLOP,
        pot: 35, // Dead SB (5) + 3 players x 10
      });

      // All players check
      await processCommand(adapter, 'bb', ActionType.CHECK); // BB acts first postflop
      await processCommand(adapter, 'utg', ActionType.CHECK);
      await processCommand(adapter, 'mp', ActionType.CHECK);

      // Should advance to turn
      await expectState(adapter, {
        street: Street.TURN,
        pot: 35,
        currentBet: 0,
      });
    });

    it('should handle check-check-bet-fold-call sequence', async () => {
      const adapter = await createTestHand(multiPlayerSetup);

      // PREFLOP
      await processCommand(adapter, 'utg', ActionType.CALL, 10);
      await processCommand(adapter, 'mp', ActionType.CALL, 10);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.FLOP,
        pot: 35,
      });

      // BB checks
      await processCommand(adapter, 'bb', ActionType.CHECK);

      // UTG checks
      await processCommand(adapter, 'utg', ActionType.CHECK);

      // MP bets
      await processCommand(adapter, 'mp', ActionType.BET, 25);

      // Action returns to BB
      const afterBetState = await adapter.rebuildState();
      expect(afterBetState.currentState.betting.actionOn).toBe('bb');

      // BB folds
      await processCommand(adapter, 'bb', ActionType.FOLD);

      // UTG calls
      await processCommand(adapter, 'utg', ActionType.CALL, 25);

      // Should advance to turn with 2 players
      await expectState(adapter, {
        street: Street.TURN,
        pot: 85, // 35 + 25 + 25
        currentBet: 0,
        players: [{ id: 'bb', folded: true }],
      });

      // UTG should act first on turn (first active player)
      const turnState = await adapter.rebuildState();
      expect(turnState.currentState.betting.actionOn).toBe('utg');
    });
  });

  describe('Street Transition Edge Cases', () => {
    const headsUpSetup: TestSetup = {
      players: [
        { id: 'btn', position: Position.BTN, chips: 500 },
        { id: 'bb', position: Position.BB, chips: 500 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should properly handle check on flop after preflop raise-call', async () => {
      const adapter = await createTestHand(headsUpSetup);

      // PREFLOP: BTN raises, BB calls
      await processCommand(adapter, 'btn', ActionType.RAISE, 30);
      await processCommand(adapter, 'bb', ActionType.CALL);

      await expectState(adapter, {
        street: Street.FLOP,
        pot: 60, // 30 + 30
        currentBet: 0,
      });

      // BB should act first and should be able to check
      const flopState = await adapter.rebuildState();
      expect(flopState.currentState.betting.actionOn).toBe('bb');

      const validActions = await adapter.getValidActions();
      expect(validActions).toContain(ActionType.CHECK);

      // BB checks
      await processCommand(adapter, 'bb', ActionType.CHECK);

      // BTN should now be to act
      const afterCheckState = await adapter.rebuildState();
      expect(afterCheckState.currentState.betting.actionOn).toBe('btn');
    });

    it('should handle flop check after all-in and call on preflop', async () => {
      // Modified test setup to ensure both players go all-in
      const allInSetup: TestSetup = {
        players: [
          { id: 'btn', position: Position.BTN, chips: 500 },
          { id: 'bb', position: Position.BB, chips: 500 },
        ],
        blinds: { small: 5, big: 10 },
      };

      const adapter = await createTestHand(allInSetup);

      // PREFLOP: BTN goes all-in for 500 (after posting 5, goes all-in for 495 more)
      await processCommand(adapter, 'btn', ActionType.ALL_IN);

      // BB should also go all-in to match (since BB has 490 left after posting 10, but needs to call 490)
      // This should trigger an all-in call
      await processCommand(adapter, 'bb', ActionType.ALL_IN);

      // Wait for automatic street transition with retry logic
      let retryCount = 0;
      const maxRetries = 10;
      let currentState = await adapter.rebuildState();

      while (currentState.currentState.street !== Street.FLOP && retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        currentState = await adapter.rebuildState();
        retryCount++;
      }

      // Both players should be all-in
      await expectState(adapter, {
        players: [
          { id: 'btn', allIn: true, chips: 0 },
          { id: 'bb', allIn: true, chips: 0 },
        ],
      });

      // In an all-in scenario, no action should be required
      const finalState = await adapter.rebuildState();
      expect(finalState.currentState.betting.actionOn).toBeNull();
    });
  });

  describe('Action Slot Generation on Street Advance', () => {
    const setup: TestSetup = {
      players: [
        { id: 'co', position: Position.CO, chips: 1000 },
        { id: 'btn', position: Position.BTN, chips: 1000 },
        { id: 'bb', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should generate correct player order on flop', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP: All call
      await processCommand(adapter, 'co', ActionType.CALL, 10);
      await processCommand(adapter, 'btn', ActionType.CALL, 10);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.FLOP,
      });

      // Check player order - BB should act first postflop
      const flopState = await adapter.rebuildState();
      expect(flopState.currentState.betting.actionOn).toBe('bb');

      // Verify player order is correct for postflop
      const playerOrder = flopState.currentState.playerOrder;
      expect(playerOrder[0]).toBe('bb'); // BB first
      expect(playerOrder).toContain('co');
      expect(playerOrder).toContain('btn');
    });

    it('should maintain correct action flow when player folds', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP
      await processCommand(adapter, 'co', ActionType.CALL, 10);
      await processCommand(adapter, 'btn', ActionType.FOLD);
      await processCommand(adapter, 'bb', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.FLOP,
        players: [{ id: 'btn', folded: true }],
      });

      // Only BB and CO should be active
      const flopState = await adapter.rebuildState();
      expect(flopState.currentState.betting.actionOn).toBe('bb');

      // After BB acts, CO should be next
      await processCommand(adapter, 'bb', ActionType.CHECK);

      const afterBBState = await adapter.rebuildState();
      expect(afterBBState.currentState.betting.actionOn).toBe('co');
    });
  });
});
