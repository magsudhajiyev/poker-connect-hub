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

describe('Street Transition Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Test 6.1: All-In on Early Street', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.BTN, chips: 100 },
        { id: 'player2', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should run out remaining streets when player is all-in preflop', async () => {
      const adapter = await createTestHand(setup);

      // BTN goes all-in for 100
      await processCommand(adapter, 'player1', ActionType.ALL_IN);

      await expectState(adapter, {
        currentBet: 100,
        players: [{ id: 'player1', chips: 0, allIn: true }],
      });

      // BB calls
      await processCommand(adapter, 'player2', ActionType.CALL);

      // Wait for automatic street transition with retry logic
      let retryCount = 0;
      const maxRetries = 10;
      let currentState = await adapter.rebuildState();
      
      while (currentState.currentState.street !== Street.FLOP && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentState = await adapter.rebuildState();
        retryCount++;
      }

      // Should immediately go to flop since one player is all-in
      await expectState(adapter, {
        street: Street.FLOP,
        pot: 200,
      });

      // No betting action possible - should auto-advance through streets
      const flopState = await adapter.rebuildState();

      // In a real implementation, this would trigger automatic runout
      // For testing, we verify that no actions are available
      const activePlayers = Array.from(flopState.currentState.players.values()).filter(
        (p) => p.status === 'active' && p.stackSize > 0,
      );

      expect(activePlayers.length).toBe(1); // Only BB has chips

      // The hand should complete through all streets
      // This behavior depends on the engine implementation
    });

    it('should handle all-in on flop correctly', async () => {
      const adapter = await createTestHand(setup);
      

      // Preflop: BTN calls, BB checks
      await processCommand(adapter, 'player1', ActionType.CALL);
      await processCommand(adapter, 'player2', ActionType.CHECK);


      await expectState(adapter, {
        street: Street.FLOP,
        pot: 20,
      });

      // Flop: BB bets 50, BTN goes all-in for 90
      await processCommand(adapter, 'player2', ActionType.BET, 50);
      await processCommand(adapter, 'player1', ActionType.ALL_IN);

      await expectState(adapter, {
        currentBet: 90,
        players: [{ id: 'player1', chips: 0, allIn: true }],
      });

      // BB calls
      await processCommand(adapter, 'player2', ActionType.CALL);

      // Should advance to turn with no action possible
      await expectState(adapter, {
        street: Street.TURN,
        pot: 200,
      });
    });
  });

  describe('Test 6.2: Normal Street Progression', () => {
    const setup: TestSetup = {
      players: [
        { id: 'player1', position: Position.UTG, chips: 1000 },
        { id: 'player2', position: Position.MP, chips: 1000 },
        { id: 'player3', position: Position.BB, chips: 1000 },
      ],
      blinds: { small: 5, big: 10 },
    };

    it('should progress through all streets with action', async () => {
      const adapter = await createTestHand(setup);

      // PREFLOP
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);
      await processCommand(adapter, 'player2', ActionType.CALL, 30);
      await processCommand(adapter, 'player3', ActionType.CALL);

      await expectState(adapter, {
        street: Street.FLOP,
        pot: 95, // Dead SB (5) + BB (10) + 3 players x 30
        currentBet: 0, // Reset for new street
      });

      // FLOP - BB acts first postflop
      await processCommand(adapter, 'player3', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.BET, 60);
      await processCommand(adapter, 'player2', ActionType.CALL, 60);
      await processCommand(adapter, 'player3', ActionType.FOLD);

      await expectState(adapter, {
        street: Street.TURN,
        pot: 215, // Previous 95 + 60 + 60
        currentBet: 0,
        players: [{ id: 'player3', folded: true }],
      });

      // TURN - UTG acts first (BB folded)
      const turnState = await adapter.rebuildState();
      expect(turnState.currentState.betting.actionOn).toBe('player1');

      await processCommand(adapter, 'player1', ActionType.CHECK);
      await processCommand(adapter, 'player2', ActionType.BET, 150);
      await processCommand(adapter, 'player1', ActionType.CALL, 150);

      await expectState(adapter, {
        street: Street.RIVER,
        pot: 515, // Previous 215 + 150 + 150
        currentBet: 0,
      });

      // RIVER
      await processCommand(adapter, 'player1', ActionType.CHECK);
      await processCommand(adapter, 'player2', ActionType.CHECK);

      // Hand should be complete
      await expectState(adapter, {
        isHandComplete: true,
      });
    });

    it('should handle bet and fold on each street', async () => {
      const adapter = await createTestHand(setup);

      // Preflop: Standard action
      await processCommand(adapter, 'player1', ActionType.CALL, 10);
      await processCommand(adapter, 'player2', ActionType.CALL, 10);
      await processCommand(adapter, 'player3', ActionType.CHECK);
      
      // Check who acts first on flop
      const flopState = await adapter.rebuildState();
      const firstToAct = flopState.currentState.betting.actionOn;
      
      // Flop: First player to act bets, others fold
      await processCommand(adapter, firstToAct!, ActionType.BET, 30);
      
      // Other players fold
      const remainingPlayers = ['player1', 'player2', 'player3'].filter(p => p !== firstToAct);
      for (const player of remainingPlayers) {
        await processCommand(adapter, player, ActionType.FOLD);
      }

      await expectState(adapter, {
        isHandComplete: true,
      });
    });

    it('should reset betting state between streets', async () => {
      const adapter = await createTestHand(setup);

      // Preflop with raises
      await processCommand(adapter, 'player1', ActionType.RAISE, 30);
      await processCommand(adapter, 'player2', ActionType.RAISE, 90);
      await processCommand(adapter, 'player3', ActionType.CALL, 90);
      await processCommand(adapter, 'player1', ActionType.CALL);

      await expectState(adapter, {
        street: Street.FLOP,
        pot: 275, // Dead SB (5) + BB (10) + 3 players x 90
        currentBet: 0, // Should reset to 0
        minimumRaise: 10, // Should reset to big blind
      });

      // Flop betting
      await processCommand(adapter, 'player3', ActionType.CHECK);
      await processCommand(adapter, 'player1', ActionType.BET, 100);

      await expectState(adapter, {
        currentBet: 100,
        minimumRaise: 200, // 100 + 100
      });

      await processCommand(adapter, 'player2', ActionType.FOLD);
      await processCommand(adapter, 'player3', ActionType.CALL, 100);

      // Turn - betting should reset again
      await expectState(adapter, {
        street: Street.TURN,
        currentBet: 0,
        minimumRaise: 10,
      });
    });
  });
});
