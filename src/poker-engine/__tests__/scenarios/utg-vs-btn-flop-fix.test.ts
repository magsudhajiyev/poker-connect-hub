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

describe('UTG vs BTN Flop Action Fix', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Scenario: UTG raises to $20, BTN calls, then UTG tries to check on flop', () => {
    const setup: TestSetup = {
      players: [
        { id: 'utg-player', position: Position.UTG, chips: 100 },
        { id: 'btn-player', position: Position.BTN, chips: 100 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should allow UTG to check on flop after preflop action', async () => {
      const adapter = await createTestHand(setup);

      // Initial state check
      const initialState = await adapter.rebuildState();
      expect(initialState.currentState.betting.actionOn).toBe('utg-player');
      expect(initialState.currentState.street).toBe(Street.PREFLOP);

      // Preflop: UTG raises to $20
      await processCommand(adapter, 'utg-player', ActionType.RAISE, 20);

      // Verify BTN is next to act
      let state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('btn-player');
      expect(state.currentState.betting.currentBet).toBe(20);

      // BTN calls $20
      await processCommand(adapter, 'btn-player', ActionType.CALL);

      // Wait for street transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Verify we're on the flop
      await expectState(adapter, {
        street: Street.FLOP,
        currentBet: 0, // Reset for new street
      });

      // Critical test: UTG should be first to act on flop
      state = await adapter.rebuildState();
      // Flop state:
      // street: state.currentState.street
      // actionOn: state.currentState.betting.actionOn
      // pot: state.currentState.betting.pot

      expect(state.currentState.betting.actionOn).toBe('utg-player');

      // Get valid actions for UTG - should include CHECK and BET
      const legalActions = await adapter.getValidActions();
      expect(legalActions).toContain(ActionType.CHECK);
      expect(legalActions).toContain(ActionType.BET);

      // UTG checks - this was the failing scenario
      const checkResult = await processCommand(adapter, 'utg-player', ActionType.CHECK);
      expect(checkResult.success).toBe(true);

      // Verify action moved to BTN
      state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('btn-player');

      // BTN should be able to check or bet
      const btnLegalActions = await adapter.getValidActions();
      expect(btnLegalActions).toContain(ActionType.CHECK);
      expect(btnLegalActions).toContain(ActionType.BET);

      // BTN checks to complete the street
      await processCommand(adapter, 'btn-player', ActionType.CHECK);

      // Should advance to turn
      await expectState(adapter, {
        street: Street.TURN,
      });
    });

    it('should handle UTG betting on flop after preflop action', async () => {
      const adapter = await createTestHand(setup);

      // Complete preflop
      await processCommand(adapter, 'utg-player', ActionType.RAISE, 20);
      await processCommand(adapter, 'btn-player', ActionType.CALL);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // UTG bets on flop
      const betResult = await processCommand(adapter, 'utg-player', ActionType.BET, 15);
      expect(betResult.success).toBe(true);

      // Verify action moved to BTN
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('btn-player');
      expect(state.currentState.betting.currentBet).toBe(15);

      // BTN should be able to fold, call, or raise
      const legalActions = await adapter.getValidActions();
      expect(legalActions).toContain(ActionType.FOLD);
      expect(legalActions).toContain(ActionType.CALL);
      expect(legalActions).toContain(ActionType.RAISE);
    });

    it('should properly track pot and stacks throughout the hand', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: UTG raises to $20, BTN calls
      await processCommand(adapter, 'utg-player', ActionType.RAISE, 20);
      await processCommand(adapter, 'btn-player', ActionType.CALL);

      // Check pot after preflop
      await expectState(adapter, {
        street: Street.FLOP,
        pot: 50, // UTG (20) + BTN (20) + dead blinds adjustment (10)
      });

      // Check stacks
      let state = await adapter.rebuildState();
      const utgPlayer = state.currentState.players.get('utg-player');
      const btnPlayer = state.currentState.players.get('btn-player');

      expect(utgPlayer?.stackSize).toBe(80); // 100 - 20
      expect(btnPlayer?.stackSize).toBe(80); // 100 - 20

      // UTG bets $30 on flop
      await processCommand(adapter, 'utg-player', ActionType.BET, 30);

      // BTN calls
      await processCommand(adapter, 'btn-player', ActionType.CALL);

      // Check final pot
      await expectState(adapter, {
        street: Street.TURN,
        pot: 110, // 50 + 30 + 30
      });

      // Check final stacks
      state = await adapter.rebuildState();
      const finalUtgPlayer = state.currentState.players.get('utg-player');
      const finalBtnPlayer = state.currentState.players.get('btn-player');

      expect(finalUtgPlayer?.stackSize).toBe(50); // 80 - 30
      expect(finalBtnPlayer?.stackSize).toBe(50); // 80 - 30
    });
  });
});
