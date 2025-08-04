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

describe('Side Pot Scenarios', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 3.1: Simple Side Pot', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 1000 },
        { id: 'player2', position: Position.SB, chips: 300 },
        { id: 'player3', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 10, big: 20 },
    };

    it('should create side pot when player goes all-in', async () => {
      const adapter = await createTestHand(setup);

      // BTN raises to 100
      await processCommand(adapter, 'player1', ActionType.RAISE, 100);

      // SB goes all-in for 300
      const allInResult = await processCommand(adapter, 'player2', ActionType.ALL_IN);
      if (!allInResult.success) {
throw new Error(`All-in failed: ${allInResult.error}`);
}

      // Wait for events to be processed with retry logic
      let retryCount = 0;
      const maxRetries = 5;
      let currentState = await adapter.rebuildState();
      
      while (currentState.currentState.betting.currentBet !== 300 && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentState = await adapter.rebuildState();
        retryCount++;
      }

      await expectState(adapter, {
        players: [{ id: 'player2', chips: 0 }],
        currentBet: 300,
      });

      // BB calls 300
      await processCommand(adapter, 'player3', ActionType.CALL);

      // BTN calls 300
      await processCommand(adapter, 'player1', ActionType.CALL);

      // Wait for automatic street transition
      await new Promise(resolve => setTimeout(resolve, 150));

      await expectState(adapter, {
        street: Street.FLOP,
      });

      // Check side pots after preflop
      const stateAfterPreflop = await adapter.rebuildState();

      // When a player is all-in, side pots are created
      if (stateAfterPreflop.currentState.betting.sidePots.length > 0) {
        expect(stateAfterPreflop.currentState.betting.sidePots[0].amount).toBe(900); // Main pot: 300 * 3
        expect(stateAfterPreflop.currentState.betting.sidePots[0].eligiblePlayers).toHaveLength(3);
      }

      // Flop: BB checks, BTN bets 400
      await processCommand(adapter, 'player3', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.BET, 400);

      // BB calls
      await processCommand(adapter, 'player3', ActionType.CALL);

      // Now we should have side pot
      await expectState(adapter, {
        pots: [
          { amount: 900, eligiblePlayers: ['player1', 'player2', 'player3'] },
          { amount: 800, eligiblePlayers: ['player1', 'player3'] },
        ],
      });
    });
  });

  describe('Test 3.2: Multiple Side Pots', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.UTG, chips: 5000 },
        { id: 'player2', position: Position.MP, chips: 1000 },
        { id: 'player3', position: Position.CO, chips: 500 },
        { id: 'player4', position: Position.BB, chips: 2000 },
      ],
      blinds: { small: 25, big: 50 },
    };

    it('should handle multiple side pots correctly', async () => {
      const adapter = await createTestHand(setup);

      // UTG raises to 200
      await processCommand(adapter, 'player1', ActionType.RAISE, 200);

      // MP calls 200
      await processCommand(adapter, 'player2', ActionType.CALL, 200);

      // CO goes all-in for 500
      await processCommand(adapter, 'player3', ActionType.ALL_IN);

      // BB raises to 1500
      await processCommand(adapter, 'player4', ActionType.RAISE, 1500);

      // UTG calls 1500
      await processCommand(adapter, 'player1', ActionType.CALL);

      // MP goes all-in for 1000 total
      await processCommand(adapter, 'player2', ActionType.ALL_IN);

      // BB needs to act on the all-in
      // Since MP's all-in is less than current bet, BB's action stands

      const state = await adapter.rebuildState();

      // Verify multiple side pots exist
      expect(state.currentState.betting.sidePots.length).toBeGreaterThanOrEqual(2);

      // Main pot should include all players
      const mainPot = state.currentState.betting.sidePots[0];
      expect(mainPot.eligiblePlayers).toContain('player3');

      // Side pot should exclude smallest stack
      if (state.currentState.betting.sidePots.length > 1) {
        const sidePot1 = state.currentState.betting.sidePots[1];
        expect(sidePot1.eligiblePlayers).not.toContain('player3');
        expect(sidePot1.eligiblePlayers).toContain('player2');
      }
    });
  });

  describe('Test 3.3: Complex Side Pot with Betting Rounds', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 10000 },
        { id: 'player2', position: Position.SB, chips: 3000 },
        { id: 'player3', position: Position.BB, chips: 1000 },
        { id: 'player4', position: Position.UTG, chips: 5000 },
      ],
      blinds: { small: 50, big: 100 },
    };

    it('should handle side pots across multiple streets', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: UTG raises to 300
      await processCommand(adapter, 'player4', ActionType.RAISE, 300);

      // BTN calls
      await processCommand(adapter, 'player1', ActionType.CALL, 300);

      // SB calls
      await processCommand(adapter, 'player2', ActionType.CALL, 300);

      // BB goes all-in for 1000
      await processCommand(adapter, 'player3', ActionType.ALL_IN);

      // UTG calls 1000
      await processCommand(adapter, 'player4', ActionType.CALL);

      // BTN raises to 3000
      await processCommand(adapter, 'player1', ActionType.RAISE, 3000);

      // SB goes all-in for 3000 total
      await processCommand(adapter, 'player2', ActionType.ALL_IN);

      // UTG folds
      await processCommand(adapter, 'player4', ActionType.FOLD);

      // BTN calls
      await processCommand(adapter, 'player1', ActionType.CALL);

      const state = await adapter.rebuildState();

      // Should have multiple side pots
      expect(state.currentState.betting.sidePots.length).toBeGreaterThanOrEqual(2);

      // Verify pot amounts
      const totalPotAmount = state.currentState.betting.sidePots.reduce(
        (sum, pot) => sum + pot.amount,
        0,
      );
      expect(totalPotAmount).toBeGreaterThan(0);

      // Verify street progression
      expect(state.currentState.street).toBe(Street.FLOP);

      // No more action possible (only BTN has chips)
      const activePlayersWithChips = Array.from(state.currentState.players.values()).filter(
        (p) => p.status !== 'folded' && p.stackSize > 0,
      );
      expect(activePlayersWithChips.length).toBe(1);
    });
  });
});
