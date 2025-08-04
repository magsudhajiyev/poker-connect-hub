import {
  createTestHand,
  setupTestDB,
  teardownTestDB,
  cleanupTestDB,
  expectState,
  processCommand,
  TestSetup,
} from '../test-utils';
import { ActionType, Street } from '@/types/poker';

describe.skip('Complex Multi-Way Scenarios', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 7.1: 5-Way Pot with Multiple All-Ins', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: 'UTG', chips: 5000 },
        { id: 'player2', position: 'MP', chips: 800 },
        { id: 'player3', position: 'CO', chips: 2000 },
        { id: 'player4', position: 'BTN', chips: 1500 },
        { id: 'player5', position: 'BB', chips: 3000 },
      ],
      blinds: { small: 25, big: 50 },
    };

    it('should handle complex multi-way action with all-ins', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP
      // UTG raises to 200
      await processCommand(adapter, 'player1', ActionType.RAISE, 200);

      // MP goes all-in for 800
      await processCommand(adapter, 'player2', ActionType.ALL_IN);

      // CO calls 800
      await processCommand(adapter, 'player3', ActionType.CALL, 800);

      // BTN goes all-in for 1500
      await processCommand(adapter, 'player4', ActionType.ALL_IN);

      // BB calls 1500
      await processCommand(adapter, 'player5', ActionType.CALL, 1500);

      // Back to UTG who calls 1500
      await processCommand(adapter, 'player1', ActionType.CALL);

      const preflopState = await adapter.rebuildState();

      // Verify multiple side pots
      expect(preflopState.currentState.betting.sidePots.length).toBeGreaterThan(1);

      // Main pot should include all players
      const mainPot = preflopState.currentState.betting.sidePots[0];
      expect(mainPot.eligiblePlayers).toHaveLength(5);
      // The main pot is based on the smallest all-in (MP with 800)

      // First side pot excludes MP (shortest stack)
      if (preflopState.currentState.betting.sidePots.length > 1) {
        const sidePot1 = preflopState.currentState.betting.sidePots[1];
        expect(sidePot1.eligiblePlayers).not.toContain('player2');
        expect(sidePot1.eligiblePlayers).toHaveLength(4);
      }

      // FLOP - only players with chips can act
      await expectState(adapter, {
        street: Street.FLOP,
      });

      const activePlayers = Array.from(preflopState.currentState.players.values()).filter(
        (p) => p.status === 'active' && p.stackSize > 0,
      );

      // Only UTG, CO, and BB have chips remaining
      expect(activePlayers.map((p) => p.id).sort()).toEqual(
        ['player1', 'player3', 'player5'].sort(),
      );

      // BB acts first (earliest position with chips)
      await processCommand(adapter, 'player5', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.BET, 1000);
      await processCommand(adapter, 'player3', ActionType.ALL_IN); // 500 remaining
      await processCommand(adapter, 'player5', ActionType.FOLD);
      await processCommand(adapter, 'player1', ActionType.CALL); // Calls CO's all-in

      // Should create another side pot
      const flopState = await adapter.rebuildState();
      expect(flopState.currentState.betting.sidePots.length).toBeGreaterThan(2);
    });
  });

  describe('Test 7.2: Complex Betting with Incomplete Raises', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: 'UTG', chips: 10000 },
        { id: 'player2', position: 'UTG+1', chips: 10000 },
        { id: 'player3', position: 'MP', chips: 10000 },
        { id: 'player4', position: 'CO', chips: 10000 },
        { id: 'player5', position: 'BTN', chips: 1200 },
        { id: 'player6', position: 'BB', chips: 10000 },
      ],
      blinds: { small: 50, big: 100 },
    };

    it('should handle complex raise sequences with all-in', async () => {
      const adapter = await createTestHand(setup);

      // UTG raises to 300
      await processCommand(adapter, 'player1', ActionType.RAISE, 300);

      // UTG+1 raises to 800
      await processCommand(adapter, 'player2', ActionType.RAISE, 800);

      // MP calls 800
      await processCommand(adapter, 'player3', ActionType.CALL, 800);

      // CO raises to 2000
      await processCommand(adapter, 'player4', ActionType.RAISE, 2000);

      // BTN goes all-in for 1200 (less than current bet)
      await processCommand(adapter, 'player5', ActionType.ALL_IN);

      await expectState(adapter, {
        currentBet: 2000, // CO's bet remains the current bet
        players: [{ id: 'player5', chips: 0, allIn: true }],
      });

      // BB calls 2000
      await processCommand(adapter, 'player6', ActionType.CALL, 2000);

      // Action reopens to UTG because of CO's raise (not BTN's all-in)
      await processCommand(adapter, 'player1', ActionType.CALL); // Calls 2000
      await processCommand(adapter, 'player2', ActionType.CALL); // Calls 2000
      await processCommand(adapter, 'player3', ActionType.CALL); // Calls 2000

      const state = await adapter.rebuildState();

      // Verify pot structure
      const totalInPot = 2000 * 5 + 1200; // 5 players at 2000, 1 player at 1200
      const sidePots = state.currentState.betting.sidePots;
      const totalSidePotAmount = sidePots.reduce((sum, pot) => sum + pot.amount, 0);

      expect(totalSidePotAmount).toBe(totalInPot);

      // Main pot includes all 6 players up to BTN's stack
      expect(sidePots[0].eligiblePlayers).toHaveLength(6);
      expect(sidePots[0].amount).toBe(1200 * 6); // 7200

      // Side pot excludes BTN
      if (sidePots.length > 1) {
        expect(sidePots[1].eligiblePlayers).not.toContain('player5');
        expect(sidePots[1].eligiblePlayers).toHaveLength(5);
      }
    });

    it('should handle action closure correctly', async () => {
      const setup2: TestSetup = {
        players: [
          { id: 'player1', position: 'UTG', chips: 1000 },
          { id: 'player2', position: 'MP', chips: 1000 },
          { id: 'player3', position: 'CO', chips: 300 },
          { id: 'player4', position: 'BB', chips: 1000 },
        ],
        blinds: { small: 10, big: 20 },
      };

      const adapter = await createTestHand(setup2);

      // UTG raises to 100
      await processCommand(adapter, 'player1', ActionType.RAISE, 100);

      // MP calls
      await processCommand(adapter, 'player2', ActionType.CALL, 100);

      // CO goes all-in for 300
      await processCommand(adapter, 'player3', ActionType.ALL_IN);

      // BB raises to 600
      await processCommand(adapter, 'player4', ActionType.RAISE, 600);

      // Action reopens to UTG because BB raised beyond CO's all-in
      const validActions = await adapter.getValidActions();
      expect(validActions).toContain(ActionType.CALL);
      expect(validActions).toContain(ActionType.RAISE);
      expect(validActions).toContain(ActionType.FOLD);

      // UTG and MP must act again
      await processCommand(adapter, 'player1', ActionType.CALL); // Calls 600
      await processCommand(adapter, 'player2', ActionType.FOLD);

      // Verify final pot structure
      await expectState(adapter, {
        street: Street.FLOP,
        pots: [
          { amount: 920, eligiblePlayers: ['player1', 'player3', 'player4'] }, // Main pot
          { amount: 600, eligiblePlayers: ['player1', 'player4'] }, // Side pot
        ],
      });
    });
  });
});
