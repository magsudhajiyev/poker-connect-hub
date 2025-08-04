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

describe('Three-Way Pot Scenarios', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 2.1: Three-Way Basic Action', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 1500 },
        { id: 'player2', position: Position.SB, chips: 1500 },
        { id: 'player3', position: Position.BB, chips: 1500 },
      ],
      blinds: { small: 10, big: 20 },
    };

    it('should handle three-way action correctly', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: BTN raises to 60
      await processCommand(adapter, 'player1', ActionType.RAISE, 60);

      // SB calls 60
      await processCommand(adapter, 'player2', ActionType.CALL, 60);

      // Wait for all events to be processed
      await new Promise(resolve => setTimeout(resolve, 50));

      await expectState(adapter, {
        pot: 140, // Initial blinds (10+20) + BTN 60 + SB 50 (since SB already has 10 in)
        players: [
          { id: 'player2', chips: 1440 }, // 1500 - 60
        ],
      });

      // BB calls 60
      await processCommand(adapter, 'player3', ActionType.CALL);

      // Wait for automatic street transition
      await new Promise(resolve => setTimeout(resolve, 100));

      await expectState(adapter, {
        pot: 180,
        street: Street.FLOP,
      });

      // Flop: SB checks, BB checks, BTN bets 100
      await processCommand(adapter, 'player2', ActionType.CHECK);
      await processCommand(adapter, 'player3', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.BET, 100);

      // SB folds
      await processCommand(adapter, 'player2', ActionType.FOLD);

      await expectState(adapter, {
        players: [{ id: 'player2', folded: true }],
      });

      // BB calls
      await processCommand(adapter, 'player3', ActionType.CALL);

      await expectState(adapter, {
        pot: 380,
        street: Street.TURN,
      });

      // Verify only 2 players remain active
      const state = await adapter.rebuildState();
      const activePlayers = Array.from(state.currentState.players.values()).filter(
        (p) => p.status !== 'folded',
      );
      expect(activePlayers.length).toBe(2);
    });
  });

  describe('Test 2.2: Three-Way with Different Stack Sizes', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.CO, chips: 5000 },
        { id: 'player2', position: Position.BTN, chips: 2000 },
        { id: 'player3', position: Position.BB, chips: 800 },
      ],
      blinds: { small: 25, big: 50 },
    };

    it('should handle action with varying stack sizes', async () => {
      const adapter = await createTestHand(setup);

      // CO raises to 150
      await processCommand(adapter, 'player1', ActionType.RAISE, 150);

      // BTN calls
      await processCommand(adapter, 'player2', ActionType.CALL, 150);

      // BB goes all-in for 800
      await processCommand(adapter, 'player3', ActionType.ALL_IN);

      await expectState(adapter, {
        currentBet: 800,
        players: [{ id: 'player3', chips: 0, allIn: true }],
      });

      // CO calls 800
      await processCommand(adapter, 'player1', ActionType.CALL);

      // BTN folds
      await processCommand(adapter, 'player2', ActionType.FOLD);

      await expectState(adapter, {
        pot: 1775, // Dead SB (25) + BB (50) + CO (800) + BTN (150) + BB all-in (750 more)
        street: Street.FLOP,
      });

      // Verify BB is all-in and can't act further
      const state = await adapter.rebuildState();
      const bbPlayer = state.currentState.players.get('player3');
      expect(bbPlayer?.status).toBe('allIn');
    });
  });
});
