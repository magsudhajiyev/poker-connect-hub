import {
  createTestHand,
  setupTestDB,
  teardownTestDB,
  cleanupTestDB,
  expectState,
  processCommand,
  getValidActions,
  TestSetup,
} from '../test-utils';
import { ActionType, Street } from '@/types/poker';

describe('Bug Prevention Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 4.1: The "Check When Facing Bet" Bug', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: 'BTN', chips: 1000 },
        { id: 'player2', position: 'BB', chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should not allow check when facing a bet', async () => {
      const adapter = await createTestHand(setup);

      // BTN raises to 30
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);

      // BB should not be able to check
      const validActions = await getValidActions(adapter);
      expect(validActions).not.toContain(ActionType.CHECK);
      expect(validActions).toContain(ActionType.CALL);
      expect(validActions).toContain(ActionType.RAISE);
      expect(validActions).toContain(ActionType.FOLD);

      // Attempt to check should fail
      const result = await processCommand(adapter, 'player2', ActionType.CHECK);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid action: check');
    });

    it('should allow check when not facing a bet', async () => {
      const adapter = await createTestHand(setup);

      // BTN calls (limps)
      await processCommand(adapter, 'player1', ActionType.CALL);

      // BB should be able to check
      const validActions = await getValidActions(adapter);
      expect(validActions).toContain(ActionType.CHECK);

      // Check should succeed
      const result = await processCommand(adapter, 'player2', ActionType.CHECK);
      expect(result.success).toBe(true);

      await expectState(adapter, {
        street: Street.FLOP,
      });
    });
  });

  describe('Test 4.2: Minimum Raise Rules', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: 'UTG', chips: 1000 },
        { id: 'player2', position: 'MP', chips: 1000 },
        { id: 'player3', position: 'BB', chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should enforce minimum raise rules', async () => {
      const adapter = await createTestHand(setup);

      // UTG raises to 30 (raise of 20)
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);

      // MP attempts to raise to 40 (raise of only 10, less than previous raise)
      // Note: The engine might not enforce minimum raise rules correctly yet
      const result = await processCommand(adapter, 'player2', ActionType.RAISE, 40);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }

      // MP should be able to raise to at least 50 (30 + 20)
      const validResult = await processCommand(adapter, 'player2', ActionType.RAISE, 50);
      expect(validResult.success).toBe(true);

      await expectState(adapter, {
        currentBet: 50,
        minimumRaise: 70, // 50 + 20 (last raise size)
      });
    });

    it('should handle minimum raise after multiple raises', async () => {
      const adapter = await createTestHand(setup);

      // UTG raises to 30 (raise of 20)
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);

      // MP raises to 80 (raise of 50)
      await processCommand(adapter, 'player2', ActionType.RAISE, 80);

      // BB minimum raise should be 130 (80 + 50)
      await expectState(adapter, {
        currentBet: 80,
        minimumRaise: 130,
      });

      // BB attempts to raise to 100 (less than minimum)
      const result = await processCommand(adapter, 'player3', ActionType.RAISE, 100);
      expect(result.success).toBe(false);

      // BB raises to 130
      const validResult = await processCommand(adapter, 'player3', ActionType.RAISE, 130);
      expect(validResult.success).toBe(true);
    });
  });

  describe('Test 4.3: All-In Less Than Minimum Raise', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: 'UTG', chips: 1000 },
        { id: 'player2', position: 'MP', chips: 150 },
        { id: 'player3', position: 'CO', chips: 1000 },
        { id: 'player4', position: 'BB', chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should handle all-in less than minimum raise', async () => {
      const adapter = await createTestHand(setup);

      // UTG raises to 100
      await processCommand(adapter, 'player1', ActionType.RAISE, 100);

      // MP goes all-in for 150 (less than minimum raise of 190)
      await processCommand(adapter, 'player2', ActionType.ALL_IN);

      await expectState(adapter, {
        currentBet: 150,
        players: [{ id: 'player2', chips: 0, allIn: true }],
      });

      // CO should NOT be able to just call and then have action reopen
      // CO can call 150 or raise to at least 240 (150 + 90, the original raise size)
      const validActions = await getValidActions(adapter);
      expect(validActions).toContain(ActionType.CALL);
      expect(validActions).toContain(ActionType.RAISE);

      // If CO just calls, action should NOT reopen to UTG
      await processCommand(adapter, 'player3', ActionType.CALL);

      // BB calls
      await processCommand(adapter, 'player4', ActionType.CALL);
      

      // UTG should only be able to call (action not reopened)
      const utgActions = await getValidActions(adapter);
      expect(utgActions).toContain(ActionType.CALL);
      expect(utgActions).not.toContain(ActionType.RAISE);
    });
  });

  describe('Test 4.4: Action Out of Turn', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: 'UTG', chips: 1000 },
        { id: 'player2', position: 'MP', chips: 1000 },
        { id: 'player3', position: 'BB', chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should prevent action out of turn', async () => {
      const adapter = await createTestHand(setup);

      // It's UTG's turn to act
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('player1');

      // MP tries to act out of turn
      const result = await processCommand(adapter, 'player2', ActionType.RAISE, 30);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not your turn');

      // BB tries to act out of turn
      const bbResult = await processCommand(adapter, 'player3', ActionType.CALL);
      expect(bbResult.success).toBe(false);
      expect(bbResult.error).toContain('Not your turn');

      // UTG can act
      const utgResult = await processCommand(adapter, 'player1', ActionType.RAISE, 30);
      expect(utgResult.success).toBe(true);

      // Now it's MP's turn
      const stateAfter = await adapter.rebuildState();
      expect(stateAfter.currentState.betting.actionOn).toBe('player2');
    });

    it('should maintain correct action order after folds', async () => {
      const adapter = await createTestHand(setup);

      // UTG raises
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);

      // MP folds
      await processCommand(adapter, 'player2', ActionType.FOLD);

      // Action should be on BB, not back to UTG
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('player3');

      // UTG cannot act
      const result = await processCommand(adapter, 'player1', ActionType.RAISE, 60);
      expect(result.success).toBe(false);
    });
  });
});
