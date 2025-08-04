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

describe('Position Rules Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 5.1: Heads-Up Position Rules', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 1000 },
        { id: 'player2', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should follow correct heads-up preflop order (BTN acts first)', async () => {
      const adapter = await createTestHand(setup);

      // Verify BTN acts first preflop
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('player1');

      // BTN raises
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);

      // BB acts next
      const stateAfterRaise = await adapter.rebuildState();
      expect(stateAfterRaise.currentState.betting.actionOn).toBe('player2');

      // BB calls
      await processCommand(adapter, 'player2', ActionType.CALL);

      // Wait for automatic transitions
      await new Promise(resolve => setTimeout(resolve, 200));

      await expectState(adapter, {
        street: Street.FLOP,
      });
    });

    it('should follow correct heads-up postflop order (BB acts first)', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: BTN calls, BB checks
      await processCommand(adapter, 'player1', ActionType.CALL);
      await processCommand(adapter, 'player2', ActionType.CHECK);

      // Flop: BB should act first
      const flopState = await adapter.rebuildState();
      expect(flopState.currentState.street).toBe(Street.FLOP);
      expect(flopState.currentState.betting.actionOn).toBe('player2');

      // BB bets
      await processCommand(adapter, 'player2', ActionType.BET, 20);

      // BTN acts next
      const stateAfterBet = await adapter.rebuildState();
      expect(stateAfterBet.currentState.betting.actionOn).toBe('player1');
    });
  });

  describe('Test 5.2: Multi-Way Position Rules', () => {
    describe('6-player table', () => {
      const setup: TestSetup = {
        players: [
          { id: 'player1', position: Position.UTG, chips: 1000 },
          { id: 'player2', position: Position.MP, chips: 1000 },
          { id: 'player3', position: Position.CO, chips: 1000 },
          { id: 'player4', position: Position.BTN, chips: 1000 },
          { id: 'player5', position: Position.SB, chips: 1000 },
          { id: 'player6', position: Position.BB, chips: 1000 },
        ],
        blinds: { small: 5, big: 10 },
      };

      it('should follow correct preflop order starting from UTG', async () => {
        const adapter = await createTestHand(setup);

        // Order should be: UTG, MP, CO, BTN, SB, BB
        const expectedOrder = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6'];

        for (let i = 0; i < expectedOrder.length - 1; i++) {
          const state = await adapter.rebuildState();
          expect(state.currentState.betting.actionOn).toBe(expectedOrder[i]);

          // Each player calls
          await processCommand(adapter, expectedOrder[i], ActionType.CALL);
        }

        // Last player (BB) checks
        const lastState = await adapter.rebuildState();
        expect(lastState.currentState.betting.actionOn).toBe('player6');
        await processCommand(adapter, 'player6', ActionType.CHECK);

        // Should move to flop
        await expectState(adapter, {
          street: Street.FLOP,
        });
      });

      it('should follow correct postflop order starting from SB', async () => {
        const adapter = await createTestHand(setup);

        // Everyone limps preflop
        await processCommand(adapter, 'player1', ActionType.CALL);
        await processCommand(adapter, 'player2', ActionType.CALL);
        await processCommand(adapter, 'player3', ActionType.CALL);
        await processCommand(adapter, 'player4', ActionType.CALL);
        await processCommand(adapter, 'player5', ActionType.CALL);
        await processCommand(adapter, 'player6', ActionType.CHECK);

        // Flop: SB acts first
        const flopState = await adapter.rebuildState();
        expect(flopState.currentState.street).toBe(Street.FLOP);
        expect(flopState.currentState.betting.actionOn).toBe('player5');

        // Order should be: SB, BB, UTG, MP, CO, BTN
        const postflopOrder = ['player5', 'player6', 'player1', 'player2', 'player3', 'player4'];

        for (const playerId of postflopOrder) {
          const state = await adapter.rebuildState();
          expect(state.currentState.betting.actionOn).toBe(playerId);
          await processCommand(adapter, playerId, ActionType.CHECK);
        }

        // Should move to turn
        await expectState(adapter, {
          street: Street.TURN,
        });
      });
    });

    describe('3-player table with missing positions', () => {
      const setup: TestSetup = {
        players: [
          { id: 'player1', position: Position.BTN, chips: 1000 },
          { id: 'player2', position: Position.SB, chips: 1000 },
          { id: 'player3', position: Position.BB, chips: 1000 },
        ],
        blinds: { small: 5, big: 10 },
      };

      it('should handle 3-player action correctly', async () => {
        const adapter = await createTestHand(setup);

        // Preflop: BTN acts first (no UTG/MP/CO)
        const preflopState = await adapter.rebuildState();
        expect(preflopState.currentState.betting.actionOn).toBe('player1');

        // BTN raises
        await processCommand(adapter, 'player1', ActionType.RAISE, 30);

        // SB acts next
        const sbState = await adapter.rebuildState();
        expect(sbState.currentState.betting.actionOn).toBe('player2');
        await processCommand(adapter, 'player2', ActionType.CALL, 30);

        // BB acts last
        const bbState = await adapter.rebuildState();
        expect(bbState.currentState.betting.actionOn).toBe('player3');
        await processCommand(adapter, 'player3', ActionType.CALL);

        // Postflop: SB acts first
        const postflopState = await adapter.rebuildState();
        expect(postflopState.currentState.street).toBe(Street.FLOP);
        expect(postflopState.currentState.betting.actionOn).toBe('player2');
      });
    });
  });
});
