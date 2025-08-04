import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '../poker-hand-store';
import { Position, GameType, GameFormat, Street, ActionType } from '@/types/poker';

describe('Poker Hand Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => usePokerHandStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Game Initialization', () => {
    it('should initialize a standard heads-up game (BTN vs BB)', () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: '1', name: 'Player 1', position: Position.BTN, stackSize: [100], isHero: true },
        { id: '2', name: 'Player 2', position: Position.BB, stackSize: [100] },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      };

      act(() => {
        result.current.initializeGame(players, gameConfig);
      });

      expect(result.current.isEngineInitialized).toBe(true);
      expect(result.current.players).toHaveLength(2);
      expect(result.current.currentStreet).toBe(Street.PREFLOP);
    });

    it('should initialize a partial hand scenario (UTG vs SB)', () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: '1', name: 'UTG Player', position: Position.UTG, stackSize: [100], isHero: true },
        { id: '2', name: 'SB Player', position: Position.SB, stackSize: [100] },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      };

      act(() => {
        result.current.initializeGame(players, gameConfig);
      });

      expect(result.current.isEngineInitialized).toBe(true);
      expect(result.current.players).toHaveLength(2);
      expect(result.current.currentStreet).toBe(Street.PREFLOP);
      
      // Verify UTG is first to act preflop
      const currentPlayer = result.current.getCurrentPlayer();
      expect(currentPlayer?.id).toBe('1'); // UTG should act first
    });

    it('should initialize a multi-way partial hand (MP vs CO vs SB)', () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: '1', name: 'MP Player', position: Position.MP, stackSize: [100] },
        { id: '2', name: 'CO Player', position: Position.CO, stackSize: [100] },
        { id: '3', name: 'SB Player', position: Position.SB, stackSize: [100], isHero: true },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      };

      act(() => {
        result.current.initializeGame(players, gameConfig);
      });

      expect(result.current.isEngineInitialized).toBe(true);
      expect(result.current.players).toHaveLength(3);
      
      // MP should act first preflop (earliest position)
      const currentPlayer = result.current.getCurrentPlayer();
      expect(currentPlayer?.id).toBe('1');
    });
  });

  describe('Action Processing', () => {
    it('should process actions correctly in UTG vs SB scenario', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: 'utg', name: 'UTG Player', position: Position.UTG, stackSize: [100] },
        { id: 'sb', name: 'SB Player', position: Position.SB, stackSize: [100] },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      };

      act(() => {
        result.current.initializeGame(players, gameConfig);
      });

      // Get initial action slot
      const preflopSlots = result.current.streets.preflop.actionSlots;
      expect(preflopSlots).toHaveLength(2);
      
      const utgSlot = preflopSlots.find(s => s.playerId === 'utg');
      expect(utgSlot?.isActive).toBe(true);

      // UTG makes an action (check what's legal first)
      const legalActions = result.current.getLegalActions();
      const canRaise = legalActions.some(a => a.type === ActionType.RAISE);
      
      await act(async () => {
        if (utgSlot) {
          if (canRaise) {
            await result.current.processAction(utgSlot.id, ActionType.RAISE, 6);
          } else {
            // If can't raise, just check or bet
            const checkAction = legalActions.find(a => a.type === ActionType.CHECK);
            const betAction = legalActions.find(a => a.type === ActionType.BET);
            if (checkAction) {
              await result.current.processAction(utgSlot.id, ActionType.CHECK);
            } else if (betAction) {
              await result.current.processAction(utgSlot.id, ActionType.BET, betAction.minAmount);
            }
          }
        }
      });

      // Now SB should be active
      const updatedSlots = result.current.streets.preflop.actionSlots;
      const sbSlot = updatedSlots.find(s => s.playerId === 'sb');
      expect(sbSlot?.isActive).toBe(true);
    });

    it('should handle street transitions correctly', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: '1', name: 'Player 1', position: Position.BTN, stackSize: [100] },
        { id: '2', name: 'Player 2', position: Position.BB, stackSize: [100] },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      };

      act(() => {
        result.current.initializeGame(players, gameConfig);
      });

      // Complete preflop action
      const btnSlot = result.current.streets.preflop.actionSlots.find(s => s.playerId === '1');

      // BTN calls
      await act(async () => {
        if (btnSlot) {
          await result.current.processAction(btnSlot.id, ActionType.CALL);
        }
      });

      // BB checks
      await act(async () => {
        const currentSlot = result.current.getCurrentActionSlot();
        if (currentSlot) {
          await result.current.processAction(currentSlot.id, ActionType.CHECK);
        }
      });

      // Should move to flop
      expect(result.current.currentStreet).toBe(Street.FLOP);
      
      // BB should act first on flop
      const flopCurrentPlayer = result.current.getCurrentPlayer();
      expect(flopCurrentPlayer?.id).toBe('2');
    });
  });

  describe('Legal Actions', () => {
    it('should provide correct legal actions for each position', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: 'utg', name: 'UTG', position: Position.UTG, stackSize: [100] },
        { id: 'sb', name: 'SB', position: Position.SB, stackSize: [100] },
      ];
      
      await act(async () => {
        await result.current.initializeGame(players, {
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 1, big: 2 },
        });
      });

      const legalActions = result.current.getLegalActions();
      
      // In partial hand with SB posting blind, UTG faces a bet
      // However, if no blinds are posted (dead blinds), UTG may check
      // Let's just verify we have some legal actions
      expect(legalActions.length).toBeGreaterThan(0);
      
      // UTG faces dead BB so has to at least call
      const actionTypes = legalActions.map(a => a.type);
      expect(actionTypes).toContain(ActionType.CALL);
      expect(actionTypes).toContain(ActionType.FOLD);
    });
  });

  describe('Form Data Synchronization', () => {
    it('should update form data when actions are processed', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: '1', name: 'Player 1', position: Position.CO, stackSize: [100] },
        { id: '2', name: 'Player 2', position: Position.BB, stackSize: [100] },
      ];
      
      act(() => {
        result.current.initializeGame(players, {
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 1, big: 2 },
        });
      });

      const coSlot = result.current.streets.preflop.actionSlots.find(s => s.playerId === '1');
      
      // CO raises
      await act(async () => {
        if (coSlot) {
          await result.current.processAction(coSlot.id, ActionType.RAISE, 6);
        }
      });

      // Check form data is updated - it includes all action slots, not just completed ones
      const completedActions = result.current.formData.preflopActions.filter(a => a.completed);
      expect(completedActions).toHaveLength(1);
      expect(completedActions[0]).toMatchObject({
        playerId: '1',
        action: ActionType.RAISE,
        betAmount: '6',
        completed: true,
      });
    });
  });
});