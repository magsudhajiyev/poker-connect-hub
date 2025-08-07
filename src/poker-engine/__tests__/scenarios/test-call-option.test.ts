import {
  createTestHand,
  setupTestDB,
  teardownTestDB,
  cleanupTestDB,
  TestSetup,
} from '../test-utils';
import { ActionType, Position } from '@/types/poker';

describe('Call Option Bug Investigation', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('UTG bets on flop - next player should have CALL option', () => {
    const setup: TestSetup = {
      players: [
        { id: 'utg-player', position: Position.UTG, chips: 1000 },
        { id: 'mp-player', position: Position.MP, chips: 1000 },
        { id: 'btn-player', position: Position.BTN, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should offer CALL option when UTG bets on flop', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: everyone calls big blind
      await adapter.processCommand('utg-player', ActionType.CALL, 10);
      await adapter.processCommand('mp-player', ActionType.CALL, 10);
      await adapter.processCommand('btn-player', ActionType.CALL, 10);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Get state before UTG acts
      let state = await adapter.rebuildState();

      // UTG bets $30 on flop
      const betResult = await adapter.processCommand('utg-player', ActionType.BET, 30);
      expect(betResult.success).toBe(true);

      // Get state after UTG bets
      state = await adapter.rebuildState();

      // Check MP's legal actions
      const mpLegalActions = await adapter.getValidActions();

      // Get the actual legal action objects from the engine
      const engine = adapter['engine'];
      const legalActionObjects = engine['rules'].calculateLegalActions(
        state.currentState,
        'mp-player',
      );

      // Verify CALL is present
      const callAction = legalActionObjects.find((a) => a.type === ActionType.CALL);
      expect(callAction).toBeDefined();
      expect(callAction?.amount).toBe(30);

      // MP should be able to fold, call, or raise
      expect(mpLegalActions).toContain(ActionType.FOLD);
      expect(mpLegalActions).toContain(ActionType.CALL);
      expect(mpLegalActions).toContain(ActionType.RAISE);
    });

    it('should correctly calculate toCall amount', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: everyone calls
      await adapter.processCommand('utg-player', ActionType.CALL, 10);
      await adapter.processCommand('mp-player', ActionType.CALL, 10);
      await adapter.processCommand('btn-player', ActionType.CALL, 10);

      // Wait for flop
      await new Promise((resolve) => setTimeout(resolve, 150));

      // UTG bets $50
      await adapter.processCommand('utg-player', ActionType.BET, 50);

      // Get state
      const state = await adapter.rebuildState();
      const mpPlayer = state.currentState.players.get('mp-player');

      // Verify betting state
      expect(state.currentState.betting.currentBet).toBe(50);
      expect(mpPlayer?.currentBet).toBe(0); // MP hasn't acted on flop yet

      // Calculate toCall
      const toCall = state.currentState.betting.currentBet - (mpPlayer?.currentBet || 0);
      expect(toCall).toBe(50);

      // Verify MP has enough chips to call
      expect(mpPlayer?.stackSize).toBeGreaterThan(toCall);

      // Get legal actions
      const engine = adapter['engine'];
      const legalActions = engine['rules'].calculateLegalActions(state.currentState, 'mp-player');

      // Find CALL action
      const callAction = legalActions.find((a) => a.type === ActionType.CALL);

      // Assert CALL is available
      expect(callAction).toBeDefined();
      expect(callAction?.amount).toBe(50);
    });
  });
});
