import { renderHook, act } from '@testing-library/react';
import { usePokerHandStore } from '../poker-hand-store';
import { ActionType, Position, Street } from '@/types/poker';
import { Player } from '@/types/shareHand';

// Mock the HandBuilderService
jest.mock('@/poker-engine/services/builder', () => {
  return {
    HandBuilderService: jest.fn().mockImplementation(() => ({
      initializeHand: jest.fn().mockReturnValue({ isValid: true }),
      postBlinds: jest.fn().mockReturnValue({ isValid: true }),
      getCurrentState: jest.fn().mockReturnValue({
        currentState: {
          betting: { 
            actionOn: 'utg',
            pot: 15,
            currentBet: 10
          },
          street: Street.PREFLOP,
          players: new Map([
            ['utg', { id: 'utg', status: 'active', stackSize: 990, hasActed: false }],
            ['sb', { id: 'sb', status: 'active', stackSize: 995, hasActed: false }],
          ]),
        },
        events: [],
        isComplete: false,
      }),
      getLegalActions: jest.fn().mockReturnValue([]),
      processAction: jest.fn().mockReturnValue({ isValid: true }),
    })),
  };
});

describe('Poker Hand Store UI Flow', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => usePokerHandStore.getState());
    act(() => {
      result.current.reset();
    });
  });

  describe('Action Slot Updates', () => {
    const testPlayers: Player[] = [
      {
        id: 'utg',
        name: 'UTG Player',
        position: Position.UTG,
        stackSize: [1000],
        isHero: false,
      },
      {
        id: 'sb',
        name: 'SB Player',
        position: Position.SB,
        stackSize: [1000],
        isHero: false,
      },
    ];

    it('should correctly update action slots when no event adapter is present', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      await act(async () => {
        // Initialize game
        await result.current.initializeGame(testPlayers, {
          gameType: 'nlhe',
          gameFormat: 'cash',
          blinds: { small: 5, big: 10 },
        });
      });

      // Check initial action slots
      const preflopSlots = result.current.streets[Street.PREFLOP].actionSlots;
      expect(preflopSlots).toHaveLength(2);
      
      const utgSlot = preflopSlots.find(s => s.playerId === 'utg');
      const sbSlot = preflopSlots.find(s => s.playerId === 'sb');
      
      expect(utgSlot?.isActive).toBe(true);
      expect(sbSlot?.isActive).toBe(false);
    });

    it('should track isPlayerToAct correctly', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      await act(async () => {
        // Initialize game
        await result.current.initializeGame(testPlayers, {
          gameType: 'nlhe',
          gameFormat: 'cash',
          blinds: { small: 5, big: 10 },
        });
      });

      // Check isPlayerToAct function
      expect(result.current.isPlayerToAct('utg')).toBe(true);
      expect(result.current.isPlayerToAct('sb')).toBe(false);

      // Manually update engine state to simulate SB's turn
      act(() => {
        const mockEngine = (result.current.engine as any);
        if (mockEngine) {
          mockEngine.getCurrentState.mockReturnValue({
            currentState: {
              betting: { 
                actionOn: 'sb',
                pot: 25,
                currentBet: 10
              },
              street: Street.PREFLOP,
              players: new Map([
                ['utg', { id: 'utg', status: 'active', stackSize: 990, hasActed: true }],
                ['sb', { id: 'sb', status: 'active', stackSize: 995, hasActed: false }],
              ]),
            },
            events: [],
            isComplete: false,
          });
          
          // Update engine state in store
          result.current.engineState = mockEngine.getCurrentState();
        }
      });

      // Force a re-render by calling isPlayerToAct again
      expect(result.current.isPlayerToAct('utg')).toBe(false);
      expect(result.current.isPlayerToAct('sb')).toBe(true);
    });
  });
});