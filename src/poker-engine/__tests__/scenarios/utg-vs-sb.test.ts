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

describe('UTG vs SB Partial Hand Scenarios', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Preflop Action', () => {
    const setup: TestSetup = {
      players: [
        { id: 'utg', position: Position.UTG, chips: 1000 },
        { id: 'sb', position: Position.SB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should allow UTG to fold, call, or raise preflop', async () => {
      const adapter = await createTestHand(setup);

      // Check initial state
      const initialState = await adapter.rebuildState();

      // UTG should be first to act
      expect(initialState.currentState.betting.actionOn).toBe('utg');

      // Get legal actions for UTG
      const legalActions = await adapter.getValidActions();

      // UTG should be able to fold, call (10), or raise
      expect(legalActions).toContain(ActionType.FOLD);
      expect(legalActions).toContain(ActionType.CALL);
      expect(legalActions).toContain(ActionType.RAISE);
    });

    it('should handle UTG call and SB action correctly', async () => {
      const adapter = await createTestHand(setup);

      // UTG calls big blind
      await processCommand(adapter, 'utg', ActionType.CALL);

      await expectState(adapter, {
        pot: 25, // Dead SB (5) + Dead BB (10) + UTG call (10)
        currentBet: 10,
      });

      // SB should now act
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('sb');

      // SB already posted 5, needs 5 more to call
      const sbLegalActions = await adapter.getValidActions();
      expect(sbLegalActions).toContain(ActionType.CALL);

      // SB calls
      await processCommand(adapter, 'sb', ActionType.CALL);

      // Wait for automatic street transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should move to flop
      await expectState(adapter, {
        street: Street.FLOP,
        pot: 35, // Dead SB (5) + Dead BB (10) + UTG call (10) + SB call (10)
        currentBet: 0, // Reset for new street
      });
    });
  });

  describe('Flop Action', () => {
    const setup: TestSetup = {
      players: [
        { id: 'utg', position: Position.UTG, chips: 1000 },
        { id: 'sb', position: Position.SB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should advance action from SB to UTG on flop', async () => {
      const adapter = await createTestHand(setup);

      // Complete preflop: UTG calls, SB calls
      await processCommand(adapter, 'utg', ActionType.CALL);
      await processCommand(adapter, 'sb', ActionType.CALL);

      // Wait for automatic street transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Verify we're on flop
      await expectState(adapter, {
        street: Street.FLOP,
      });

      // SB acts first on flop
      let state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('sb');

      // SB checks
      await processCommand(adapter, 'sb', ActionType.CHECK);

      // Action should move to UTG
      state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('utg');

      // UTG should be able to check or bet
      const utgLegalActions = await adapter.getValidActions();
      expect(utgLegalActions).toContain(ActionType.CHECK);
      expect(utgLegalActions).toContain(ActionType.BET);

      // UTG checks - should complete the street
      await processCommand(adapter, 'utg', ActionType.CHECK);

      // Should move to turn
      await expectState(adapter, {
        street: Street.TURN,
      });
    });

    it('should handle betting correctly on flop', async () => {
      const adapter = await createTestHand(setup);

      // Complete preflop
      await processCommand(adapter, 'utg', ActionType.CALL);
      await processCommand(adapter, 'sb', ActionType.CALL);

      // SB bets on flop
      await processCommand(adapter, 'sb', ActionType.BET, 20);

      // Action should move to UTG
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('utg');
      expect(state.currentState.betting.currentBet).toBe(20);

      // UTG should be able to fold, call, or raise
      const utgLegalActions = await adapter.getValidActions();
      expect(utgLegalActions).toContain(ActionType.FOLD);
      expect(utgLegalActions).toContain(ActionType.CALL);
      expect(utgLegalActions).toContain(ActionType.RAISE);
    });
  });

  describe('Full Hand Flow', () => {
    it('should complete a full hand from preflop to river', async () => {
      const setup: TestSetup = {
        players: [
          { id: 'utg', position: Position.UTG, chips: 1000 },
          { id: 'sb', position: Position.SB, chips: 1000 },
        ],
        blinds: { small: 5, big: 10 },
      };

      const adapter = await createTestHand(setup);

      // Preflop: UTG raises, SB calls
      await processCommand(adapter, 'utg', ActionType.RAISE, 30);
      await processCommand(adapter, 'sb', ActionType.CALL, 30);

      await expectState(adapter, {
        street: Street.FLOP,
        pot: 75, // Initial 15 (dead blinds) + UTG (30) + SB (30)
      });

      // Flop: SB checks, UTG bets, SB calls
      await processCommand(adapter, 'sb', ActionType.CHECK);
      await processCommand(adapter, 'utg', ActionType.BET, 40);
      await processCommand(adapter, 'sb', ActionType.CALL);

      await expectState(adapter, {
        street: Street.TURN,
        pot: 155, // Previous 75 + UTG bet (40) + SB call (40)
      });

      // Turn: SB checks, UTG checks
      await processCommand(adapter, 'sb', ActionType.CHECK);
      await processCommand(adapter, 'utg', ActionType.CHECK);

      await expectState(adapter, {
        street: Street.RIVER,
        pot: 155, // No change from turn (both checked)
      });

      // River: SB bets, UTG calls
      await processCommand(adapter, 'sb', ActionType.BET, 100);
      await processCommand(adapter, 'utg', ActionType.CALL);

      // Hand should be complete
      await expectState(adapter, {
        isHandComplete: true,
        pot: 0, // Pot should be 0 after awarding to winner
      });
    });
  });
});
