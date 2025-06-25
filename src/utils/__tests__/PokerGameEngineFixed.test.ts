import { describe, it, expect, beforeEach } from 'vitest';
import { PokerGameEngineFixed } from '../PokerGameEngineFixed';
import { PokerPlayer } from '@/types/poker';

describe('PokerGameEngineFixed - Critical Bug Fixes', () => {
  let engine: PokerGameEngineFixed;
  let testPlayers: PokerPlayer[];

  beforeEach(() => {
    testPlayers = [
      {
        id: 'player-1',
        name: 'Player 1',
        stack: 1000,
        position: 'BTN',
        betAmount: 0,
        hasCards: true,
        hasFolded: false,
        isAllIn: false,
        lastAction: undefined,
      },
      {
        id: 'player-2',
        name: 'Player 2',
        stack: 1000,
        position: 'SB',
        betAmount: 0,
        hasCards: true,
        hasFolded: false,
        isAllIn: false,
        lastAction: undefined,
      },
      {
        id: 'player-3',
        name: 'Player 3',
        stack: 1000,
        position: 'BB',
        betAmount: 0,
        hasCards: true,
        hasFolded: false,
        isAllIn: false,
        lastAction: undefined,
      },
    ];
  });

  describe('Fixed: Minimum Raise Calculation', () => {
    it('should track last raise size and enforce proper minimum raises', () => {
      engine = new PokerGameEngineFixed(testPlayers, 50, 100);
      
      // After posting blinds: SB=50, BB=100, pot=150
      const gameState = engine.getGameState();
      expect(gameState.pot).toBe(150);
      expect(gameState.currentBet).toBe(100);
      expect(gameState.lastRaiseSize).toBe(100); // BB is initial raise size
      
      // BTN raises to 300 (raise of 200)
      engine.processAction(testPlayers[0], { type: 'raise', amount: 300 });
      expect(engine.getGameState().lastRaiseSize).toBe(200);
      expect(engine.getGameState().currentBet).toBe(300);
      
      // SB tries to raise to 400 (raise of only 100) - should fail
      expect(() => {
        engine.processAction(testPlayers[1], { type: 'raise', amount: 400 });
      }).toThrow('Minimum raise is 500');
      
      // SB raises to 500 (raise of 200) - should succeed
      engine.processAction(testPlayers[1], { type: 'raise', amount: 500 });
      expect(engine.getGameState().lastRaiseSize).toBe(200);
      expect(engine.getGameState().currentBet).toBe(500);
    });

    it('should reset minimum raise to big blind on new street', () => {
      engine = new PokerGameEngineFixed(testPlayers, 50, 100);
      
      // Complete preflop action
      engine.processAction(testPlayers[0], { type: 'call' }); // BTN calls 100
      engine.processAction(testPlayers[1], { type: 'call' }); // SB calls 50 more
      engine.processAction(testPlayers[2], { type: 'check' }); // BB checks
      
      // Advance to flop
      engine.advanceToFlop(['As', 'Ks', 'Qs']);
      
      // Check that raise size reset to big blind
      expect(engine.getGameState().lastRaiseSize).toBe(100);
      expect(engine.getGameState().currentBet).toBe(0);
      
      // SB bets 100
      engine.processAction(testPlayers[1], { type: 'raise', amount: 100 });
      
      // BB can raise to 200 minimum (100 + 100)
      expect(() => {
        engine.processAction(testPlayers[2], { type: 'raise', amount: 150 });
      }).toThrow('Minimum raise is 200');
    });
  });

  describe('Fixed: Side Pot Calculations', () => {
    it('should calculate side pots correctly with one all-in player', () => {
      const customPlayers = [
        { ...testPlayers[0], stack: 1000 }, // BTN
        { ...testPlayers[1], stack: 200 },  // SB (will go all-in)
        { ...testPlayers[2], stack: 1000 }, // BB
      ];
      
      engine = new PokerGameEngineFixed(customPlayers, 50, 100);
      
      // After blinds: SB has 150, BB has 900
      // BTN raises to 300
      engine.processAction(customPlayers[0], { type: 'raise', amount: 300 });
      
      // SB goes all-in for remaining 150 (total 200)
      engine.processAction(customPlayers[1], { type: 'allin' });
      
      // BB calls 300
      engine.processAction(customPlayers[2], { type: 'call' });
      
      // BTN checks (everyone has acted)
      engine.processAction(customPlayers[0], { type: 'check' });
      
      // Calculate side pots
      engine.calculateSidePots();
      const sidePots = engine.getGameState().sidePots;
      
      expect(sidePots).toHaveLength(2);
      
      // Main pot: 200 * 3 = 600 (all players eligible)
      expect(sidePots[0]).toEqual({
        amount: 600,
        eligiblePlayers: ['player-1', 'player-2', 'player-3'],
      });
      
      // Side pot: (300-200) * 2 = 200 (only BTN and BB eligible)
      expect(sidePots[1]).toEqual({
        amount: 200,
        eligiblePlayers: ['player-1', 'player-3'],
      });
    });

    it('should handle multiple all-ins correctly', () => {
      const customPlayers = [
        { ...testPlayers[0], stack: 500 },  // BTN
        { ...testPlayers[1], stack: 200 },  // SB
        { ...testPlayers[2], stack: 1000 }, // BB
      ];
      
      engine = new PokerGameEngineFixed(customPlayers, 50, 100);
      
      // BB raises to 300
      engine.processAction(customPlayers[2], { type: 'raise', amount: 300 });
      
      // BTN goes all-in for 500
      engine.processAction(customPlayers[0], { type: 'allin' });
      
      // SB goes all-in for 150 (total 200)
      engine.processAction(customPlayers[1], { type: 'allin' });
      
      // BB calls 500
      engine.processAction(customPlayers[2], { type: 'call' });
      
      engine.calculateSidePots();
      const sidePots = engine.getGameState().sidePots;
      
      expect(sidePots).toHaveLength(3);
      
      // First pot: 200 * 3 = 600
      expect(sidePots[0].amount).toBe(600);
      expect(sidePots[0].eligiblePlayers).toContain('player-2'); // SB eligible
      
      // Second pot: (500-200) * 2 = 600
      expect(sidePots[1].amount).toBe(600);
      expect(sidePots[1].eligiblePlayers).not.toContain('player-2'); // SB not eligible
      expect(sidePots[1].eligiblePlayers).toContain('player-1'); // BTN eligible
    });
  });

  describe('Fixed: Action Order on New Streets', () => {
    it('should start with SB on flop, turn, and river', () => {
      engine = new PokerGameEngineFixed(testPlayers, 50, 100);
      
      // Complete preflop
      engine.processAction(testPlayers[0], { type: 'call' }); // BTN
      engine.processAction(testPlayers[1], { type: 'call' }); // SB
      engine.processAction(testPlayers[2], { type: 'check' }); // BB
      
      // Advance to flop
      engine.advanceToFlop(['As', 'Ks', 'Qs']);
      
      // SB should act first
      expect(engine.getGameState().currentPlayerIndex).toBe(1); // SB index
      
      // Complete flop action
      engine.processAction(testPlayers[1], { type: 'check' }); // SB
      engine.processAction(testPlayers[2], { type: 'check' }); // BB
      engine.processAction(testPlayers[0], { type: 'check' }); // BTN
      
      // Advance to turn
      engine.advanceToTurn('Js');
      
      // SB should act first again
      expect(engine.getGameState().currentPlayerIndex).toBe(1);
    });

    it('should skip folded/all-in players when determining first to act', () => {
      engine = new PokerGameEngineFixed(testPlayers, 50, 100);
      
      // SB folds preflop
      engine.processAction(testPlayers[0], { type: 'call' }); // BTN
      engine.processAction(testPlayers[1], { type: 'fold' }); // SB folds
      engine.processAction(testPlayers[2], { type: 'check' }); // BB
      
      // Advance to flop
      engine.advanceToFlop(['As', 'Ks', 'Qs']);
      
      // BB should act first (since SB folded)
      expect(engine.getGameState().currentPlayerIndex).toBe(2); // BB index
    });
  });

  describe('Fixed: All-in Handling', () => {
    it('should handle all-in raises correctly', () => {
      const customPlayers = [
        { ...testPlayers[0], stack: 150 }, // BTN with short stack
        { ...testPlayers[1], stack: 1000 },
        { ...testPlayers[2], stack: 1000 },
      ];
      
      engine = new PokerGameEngineFixed(customPlayers, 50, 100);
      
      // BTN goes all-in for 150 (raise to 150)
      engine.processAction(customPlayers[0], { type: 'allin' });
      
      expect(engine.getGameState().currentBet).toBe(150);
      expect(engine.getGameState().lastRaiseSize).toBe(50); // 150 - 100 = 50
      
      // SB can raise but minimum is 200 (150 + 50)
      expect(() => {
        engine.processAction(customPlayers[1], { type: 'raise', amount: 175 });
      }).toThrow('Minimum raise is 200');
    });
  });

  describe('Race Condition Prevention', () => {
    it('should validate player turn before processing action', () => {
      engine = new PokerGameEngineFixed(testPlayers, 50, 100);
      
      // BTN is first to act, but BB tries to act
      expect(() => {
        engine.processAction(testPlayers[2], { type: 'raise', amount: 200 });
      }).toThrow('Not player\'s turn to act');
    });

    it('should prevent actions from folded players', () => {
      engine = new PokerGameEngineFixed(testPlayers, 50, 100);
      
      // BTN folds
      engine.processAction(testPlayers[0], { type: 'fold' });
      
      // Try to act with folded player
      engine.currentPlayerIndex = 0; // Force index (simulating race condition)
      expect(() => {
        engine.processAction(testPlayers[0], { type: 'call' });
      }).toThrow('Player cannot act (folded or all-in)');
    });
  });
});