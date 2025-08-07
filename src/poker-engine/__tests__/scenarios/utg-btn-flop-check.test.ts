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

describe('UTG vs BTN - Flop Check Authorization Fix', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Exact user scenario: UTG raises to $20, BTN calls, UTG checks on flop', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player_UTG_123', position: Position.UTG, chips: 100 },
        { id: 'player_BTN_456', position: Position.BTN, chips: 100 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should allow UTG to check on flop after preflop raise-call', async () => {
      const adapter = await createTestHand(setup);

      // Verify initial state
      const initialState = await adapter.rebuildState();
      // Initial state:
      // street: initialState.currentState.street
      // actionOn: initialState.currentState.betting.actionOn
      // pot: initialState.currentState.betting.pot

      expect(initialState.currentState.betting.actionOn).toBe('player_UTG_123');
      expect(initialState.currentState.street).toBe(Street.PREFLOP);

      // Step 1: UTG raises to $20
      // 1. UTG raises to $20
      const raiseResult = await processCommand(adapter, 'player_UTG_123', ActionType.RAISE, 20);
      expect(raiseResult.success).toBe(true);

      // Verify state after UTG raise
      let state = await adapter.rebuildState();
      // After UTG raise:
      // actionOn: state.currentState.betting.actionOn
      // currentBet: state.currentState.betting.currentBet
      // pot: state.currentState.betting.pot
      expect(state.currentState.betting.actionOn).toBe('player_BTN_456');
      expect(state.currentState.betting.currentBet).toBe(20);

      // Step 2: BTN calls $20
      // 2. BTN calls $20
      const callResult = await processCommand(adapter, 'player_BTN_456', ActionType.CALL);
      expect(callResult.success).toBe(true);

      // Wait for automatic street transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Step 3: Verify we're on the flop
      state = await adapter.rebuildState();
      // 3. After street transition to FLOP:
      // street: state.currentState.street
      // actionOn: state.currentState.betting.actionOn
      // currentBet: state.currentState.betting.currentBet
      // pot: state.currentState.betting.pot

      expect(state.currentState.street).toBe(Street.FLOP);
      expect(state.currentState.betting.currentBet).toBe(0); // Reset for new street
      expect(state.currentState.betting.pot).toBe(50); // $20 + $20 + $10 dead blinds

      // CRITICAL: UTG should be first to act on flop
      expect(state.currentState.betting.actionOn).toBe('player_UTG_123');

      // Step 4: Get valid actions for UTG
      const validActions = await adapter.getValidActions();
      // 4. Valid actions for UTG on flop: validActions

      expect(validActions).toContain(ActionType.CHECK);
      expect(validActions).toContain(ActionType.BET);
      expect(validActions).toContain(ActionType.FOLD); // Per user requirement

      // Step 5: UTG checks - this was the failing action
      // 5. UTG attempts to CHECK
      const checkResult = await processCommand(adapter, 'player_UTG_123', ActionType.CHECK);

      // Check result:
      // success: checkResult.success
      // error: checkResult.error

      // THIS MUST PASS - it was the original issue
      expect(checkResult.success).toBe(true);
      expect(checkResult.error).toBeUndefined();

      // Step 6: Verify action moved to BTN
      state = await adapter.rebuildState();
      // 6. After UTG check:
      // actionOn: state.currentState.betting.actionOn
      // currentBet: state.currentState.betting.currentBet

      expect(state.currentState.betting.actionOn).toBe('player_BTN_456');

      // BTN should also be able to check or bet
      const btnActions = await adapter.getValidActions();
      expect(btnActions).toContain(ActionType.CHECK);
      expect(btnActions).toContain(ActionType.BET);
    });

    it('should handle complete flop action sequence', async () => {
      const adapter = await createTestHand(setup);

      // Complete preflop
      await processCommand(adapter, 'player_UTG_123', ActionType.RAISE, 20);
      await processCommand(adapter, 'player_BTN_456', ActionType.CALL);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // UTG checks
      const check1 = await processCommand(adapter, 'player_UTG_123', ActionType.CHECK);
      expect(check1.success).toBe(true);

      // BTN checks
      const check2 = await processCommand(adapter, 'player_BTN_456', ActionType.CHECK);
      expect(check2.success).toBe(true);

      // Should advance to turn
      await expectState(adapter, {
        street: Street.TURN,
      });

      // Verify UTG acts first on turn
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('player_UTG_123');
    });

    it('should handle flop betting after preflop raise-call', async () => {
      const adapter = await createTestHand(setup);

      // Complete preflop
      await processCommand(adapter, 'player_UTG_123', ActionType.RAISE, 20);
      await processCommand(adapter, 'player_BTN_456', ActionType.CALL);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // UTG bets on flop
      const betResult = await processCommand(adapter, 'player_UTG_123', ActionType.BET, 25);
      expect(betResult.success).toBe(true);

      // Verify state
      const state = await adapter.rebuildState();
      expect(state.currentState.betting.actionOn).toBe('player_BTN_456');
      expect(state.currentState.betting.currentBet).toBe(25);

      // BTN should be able to fold, call, or raise
      const btnActions = await adapter.getValidActions();
      expect(btnActions).toContain(ActionType.FOLD);
      expect(btnActions).toContain(ActionType.CALL);
      expect(btnActions).toContain(ActionType.RAISE);
    });
  });

  describe('Player ID patterns', () => {
    it('should handle timestamp-based player IDs correctly', async () => {
      const timestamp = Date.now();
      const setup: TestSetup = {
        players: [
          { id: `player_UTG_${timestamp}`, position: Position.UTG, chips: 100 },
          { id: `player_BTN_${timestamp + 1}`, position: Position.BTN, chips: 100 },
        ],
        blinds: { small: 5, big: 10 },
      };

      const adapter = await createTestHand(setup);

      // In 2-player game: BTN posts SB, dead BB is posted
      // UTG acts first preflop

      // UTG raises to 30
      await processCommand(adapter, `player_UTG_${timestamp}`, ActionType.RAISE, 30);

      // BTN calls
      await processCommand(adapter, `player_BTN_${timestamp + 1}`, ActionType.CALL);

      // Wait for flop transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Verify correct player acts first on flop
      const state = await adapter.rebuildState();
      expect(state.currentState.street).toBe(Street.FLOP);
      expect(state.currentState.betting.actionOn).toBe(`player_UTG_${timestamp}`);

      // UTG should be able to check
      const checkResult = await processCommand(
        adapter,
        `player_UTG_${timestamp}`,
        ActionType.CHECK,
      );
      expect(checkResult.success).toBe(true);
    });
  });
});
