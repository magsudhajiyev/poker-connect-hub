import {
  createTestHand,
  setupTestDB,
  teardownTestDB,
  cleanupTestDB,
  processCommand,
  TestSetup,
} from '../test-utils';
import { ActionType, Street, Position } from '@/types/poker';

describe('All Position Combinations - Action Order Verification', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('2-Player Position Combinations', () => {
    const testCases: Array<{
      name: string;
      positions: [Position, Position];
      expectedPreflop: [string, string];
      expectedFlop: [string, string];
    }> = [
      {
        name: 'UTG vs BTN',
        positions: [Position.UTG, Position.BTN],
        expectedPreflop: ['utg', 'btn'], // UTG acts first preflop
        expectedFlop: ['utg', 'btn'], // UTG acts first postflop (earlier position)
      },
      {
        name: 'UTG vs HJ',
        positions: [Position.UTG, Position.HJ],
        expectedPreflop: ['utg', 'hj'],
        expectedFlop: ['utg', 'hj'],
      },
      {
        name: 'MP vs CO',
        positions: [Position.MP, Position.CO],
        expectedPreflop: ['mp', 'co'],
        expectedFlop: ['mp', 'co'],
      },
      {
        name: 'SB vs BB (traditional heads-up)',
        positions: [Position.SB, Position.BB],
        expectedPreflop: ['sb', 'bb'],
        expectedFlop: ['sb', 'bb'], // SB acts first postflop
      },
      {
        name: 'BTN vs BB (traditional heads-up)',
        positions: [Position.BTN, Position.BB],
        expectedPreflop: ['btn', 'bb'], // BTN acts first preflop in heads-up
        expectedFlop: ['bb', 'btn'], // BB acts first postflop in heads-up
      },
      {
        name: 'LJ vs BTN',
        positions: [Position.LJ, Position.BTN],
        expectedPreflop: ['lj', 'btn'],
        expectedFlop: ['lj', 'btn'],
      },
    ];

    testCases.forEach(({ name, positions, expectedPreflop, expectedFlop }) => {
      it(`should handle ${name} correctly`, async () => {
        const setup: TestSetup = {
          players: [
            { id: positions[0].toLowerCase(), position: positions[0], chips: 100 },
            { id: positions[1].toLowerCase(), position: positions[1], chips: 100 },
          ],
          blinds: { small: 5, big: 10 },
        };

        const adapter = await createTestHand(setup);

        // Check preflop order
        let state = await adapter.rebuildState();
        expect(state.currentState.street).toBe(Street.PREFLOP);
        expect(state.currentState.betting.actionOn).toBe(expectedPreflop[0]);

        // First player acts (raise)
        await processCommand(adapter, expectedPreflop[0], ActionType.RAISE, 25);

        // Check second player is next
        state = await adapter.rebuildState();
        expect(state.currentState.betting.actionOn).toBe(expectedPreflop[1]);

        // Second player calls
        await processCommand(adapter, expectedPreflop[1], ActionType.CALL);

        // Wait for street transition
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Check flop order
        state = await adapter.rebuildState();
        expect(state.currentState.street).toBe(Street.FLOP);
        expect(state.currentState.betting.actionOn).toBe(expectedFlop[0]);

        // First player on flop checks
        const checkResult = await processCommand(adapter, expectedFlop[0], ActionType.CHECK);
        expect(checkResult.success).toBe(true);

        // Check second player is next
        state = await adapter.rebuildState();
        expect(state.currentState.betting.actionOn).toBe(expectedFlop[1]);
      });
    });
  });

  describe('3-Player Position Combinations', () => {
    const testCases: Array<{
      name: string;
      positions: [Position, Position, Position];
      expectedPreflop: string[];
      expectedFlop: string[];
    }> = [
      {
        name: 'SB vs MP vs CO',
        positions: [Position.SB, Position.MP, Position.CO],
        expectedPreflop: ['mp', 'co', 'sb'], // MP acts first preflop (earliest non-blind)
        expectedFlop: ['sb', 'mp', 'co'], // SB acts first postflop
      },
      {
        name: 'BB vs UTG vs BTN',
        positions: [Position.BB, Position.UTG, Position.BTN],
        expectedPreflop: ['utg', 'btn', 'bb'], // UTG acts first preflop
        expectedFlop: ['bb', 'utg', 'btn'], // BB acts first postflop
      },
      {
        name: 'UTG vs HJ vs BTN',
        positions: [Position.UTG, Position.HJ, Position.BTN],
        expectedPreflop: ['utg', 'hj', 'btn'],
        expectedFlop: ['utg', 'hj', 'btn'],
      },
    ];

    testCases.forEach(({ name, positions, expectedPreflop, expectedFlop }) => {
      it(`should handle ${name} correctly`, async () => {
        const setup: TestSetup = {
          players: positions.map((pos) => ({
            id: pos.toLowerCase(),
            position: pos,
            chips: 100,
          })),
          blinds: { small: 5, big: 10 },
        };

        const adapter = await createTestHand(setup);

        // Check preflop order
        let state = await adapter.rebuildState();
        expect(state.currentState.street).toBe(Street.PREFLOP);
        expect(state.currentState.betting.actionOn).toBe(expectedPreflop[0]);

        // Process preflop actions
        for (let i = 0; i < expectedPreflop.length - 1; i++) {
          await processCommand(adapter, expectedPreflop[i], ActionType.CALL);
          state = await adapter.rebuildState();
          expect(state.currentState.betting.actionOn).toBe(expectedPreflop[i + 1]);
        }

        // Last player checks (if BB) or calls
        const lastPlayer = expectedPreflop[expectedPreflop.length - 1];
        if (positions.includes(Position.BB) && lastPlayer === 'bb') {
          await processCommand(adapter, lastPlayer, ActionType.CHECK);
        } else {
          await processCommand(adapter, lastPlayer, ActionType.CALL);
        }

        // Wait for street transition
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Check flop order
        state = await adapter.rebuildState();
        expect(state.currentState.street).toBe(Street.FLOP);
        expect(state.currentState.betting.actionOn).toBe(expectedFlop[0]);

        // Process flop checks
        for (let i = 0; i < expectedFlop.length - 1; i++) {
          await processCommand(adapter, expectedFlop[i], ActionType.CHECK);
          state = await adapter.rebuildState();
          expect(state.currentState.betting.actionOn).toBe(expectedFlop[i + 1]);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle 4+ players correctly', async () => {
      const setup: TestSetup = {
        players: [
          { id: 'utg', position: Position.UTG, chips: 100 },
          { id: 'mp', position: Position.MP, chips: 100 },
          { id: 'co', position: Position.CO, chips: 100 },
          { id: 'btn', position: Position.BTN, chips: 100 },
        ],
        blinds: { small: 5, big: 10 },
      };

      const adapter = await createTestHand(setup);

      // Check preflop order: UTG, MP, CO, BTN
      let state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('utg');

      // Complete preflop - all players call the dead big blind
      await processCommand(adapter, 'utg', ActionType.CALL);

      state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('mp');

      await processCommand(adapter, 'mp', ActionType.CALL);

      state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('co');

      await processCommand(adapter, 'co', ActionType.CALL);

      state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('btn');

      await processCommand(adapter, 'btn', ActionType.CALL);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Check flop order: UTG, MP, CO, BTN (standard position order)
      state = await adapter.rebuildState();
      expect(state.currentState.street).toBe(Street.FLOP);
      expect(state.currentState.betting.actionOn).toBe('utg');
    });

    it('should handle folded players correctly', async () => {
      const setup: TestSetup = {
        players: [
          { id: 'utg', position: Position.UTG, chips: 100 },
          { id: 'btn', position: Position.BTN, chips: 100 },
          { id: 'bb', position: Position.BB, chips: 100 },
        ],
        blinds: { small: 5, big: 10 },
      };

      const adapter = await createTestHand(setup);

      // UTG folds
      await processCommand(adapter, 'utg', ActionType.FOLD);

      // BTN raises
      await processCommand(adapter, 'btn', ActionType.RAISE, 30);

      // BB calls
      await processCommand(adapter, 'bb', ActionType.CALL);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Only BTN and BB remain, BB acts first on flop
      const state = await adapter.rebuildState();
      expect(state.currentState.street).toBe(Street.FLOP);
      expect(state.currentState.betting.actionOn).toBe('bb');
    });
  });
});
