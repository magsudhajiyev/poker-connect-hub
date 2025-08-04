import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '../poker-hand-store';
import { Position, GameType, GameFormat, Street, ActionType } from '@/types/poker';

// Mock the EventSourcingAdapter module to avoid MongoDB imports
jest.mock('@/poker-engine/adapters/EventSourcingAdapter', () => ({
  EventSourcingAdapter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Poker Hand Store - Event Sourcing Integration', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.error to suppress expected errors in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset store before each test
    const { result } = renderHook(() => usePokerHandStore());
    act(() => {
      result.current.reset();
    });
    
    // Clear mocks
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('initializeGame with event sourcing', () => {
    it('should handle undefined engineState when initializing with event sourcing', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: 'utg', name: 'UTG Player', position: Position.UTG, stackSize: [1000], isHero: true },
        { id: 'sb', name: 'SB Player', position: Position.SB, stackSize: [1000] },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 5, big: 10 },
      };

      // Mock all API calls that createHandWithEventSourcing will make
      (fetch as jest.Mock)
        // save-engine API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            success: true, 
            hand: {
              id: 'test-hand-id'
            }
          }),
        })
        // getEvents API call from initializeWithEventSourcing
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: undefined,
          }),
        })
        // rebuildState API call from initializeWithEventSourcing
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: undefined,
          }),
        });

      // Mock EventSourcingAdapter to return undefined state
      const mockRebuildState = jest.fn().mockResolvedValue({
        currentState: undefined,
        events: [],
        isComplete: false,
      });
      
      const { EventSourcingAdapter } = require('@/poker-engine/adapters/EventSourcingAdapter');
      (EventSourcingAdapter as jest.Mock).mockImplementation(() => ({
        rebuildState: mockRebuildState,
      }));

      // First create the hand with event sourcing
      await act(async () => {
        const handId = await result.current.createHandWithEventSourcing(players, gameConfig);
        expect(handId).toBe('test-hand-id');
      });

      // Mock the events API response that will be called by initializeWithEventSourcing
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: undefined,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: undefined,
          }),
        });

      // Now manually set the adapter to trigger event sourcing path in initializeGame
      act(() => {
        result.current.eventAdapter = {
          rebuildState: mockRebuildState,
          processCommand: jest.fn(),
          getEvents: jest.fn().mockResolvedValue([]),
          getValidActions: jest.fn().mockResolvedValue([]),
          replayToSequence: jest.fn(),
        };
        result.current.handId = 'test-hand-id';
      });

      // Now try to initialize the game - this should not throw
      await act(async () => {
        await expect(result.current.initializeGame(players, gameConfig)).resolves.not.toThrow();
      });

      // Verify the store state
      expect(result.current.isEngineInitialized).toBe(true);
      expect(result.current.players).toHaveLength(2);
    });

    it('should handle missing betting property in engineState', async () => {
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

      // Mock all API calls
      (fetch as jest.Mock)
        // save-engine API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            success: true, 
            hand: {
              id: 'test-hand-id-2'
            }
          }),
        })
        // getEvents API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: { players: new Map() },
          }),
        })
        // rebuildState API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: { players: new Map() },
          }),
        });

      // Mock EventSourcingAdapter to return state without betting
      const mockRebuildState = jest.fn().mockResolvedValue({
        currentState: {
          players: new Map(),
          // missing betting property
        },
        events: [],
        isComplete: false,
      });
      
      const { EventSourcingAdapter } = require('@/poker-engine/adapters/EventSourcingAdapter');
      (EventSourcingAdapter as jest.Mock).mockImplementation(() => ({
        rebuildState: mockRebuildState,
      }));

      // Create hand
      await act(async () => {
        await result.current.createHandWithEventSourcing(players, gameConfig);
      });

      // Mock the events API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: { players: new Map() },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: { players: new Map() },
          }),
        });

      // Manually set the adapter
      act(() => {
        result.current.eventAdapter = {
          rebuildState: mockRebuildState,
          processCommand: jest.fn(),
          getEvents: jest.fn().mockResolvedValue([]),
          getValidActions: jest.fn().mockResolvedValue([]),
          replayToSequence: jest.fn(),
        };
        result.current.handId = 'test-hand-id-2';
      });
      
      // Initialize game
      await act(async () => {
        await expect(result.current.initializeGame(players, gameConfig)).resolves.not.toThrow();
      });

      // Check that action slots were created with no active player
      const preflopSlots = result.current.streets.preflop.actionSlots;
      expect(preflopSlots).toHaveLength(2);
      expect(preflopSlots.every(slot => !slot.isActive)).toBe(true);
    });

    it('should properly set active player when engineState is valid', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: 'utg', name: 'UTG Player', position: Position.UTG, stackSize: [1000] },
        { id: 'sb', name: 'SB Player', position: Position.SB, stackSize: [1000], isHero: true },
      ];
      
      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 5, big: 10 },
      };

      // Mock all API calls
      (fetch as jest.Mock)
        // save-engine API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            success: true, 
            hand: {
              id: 'test-hand-id-3'
            }
          }),
        })
        // getEvents API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: {
              betting: {
                actionOn: 'utg',
                pot: 15,
                currentBet: 10,
              },
              players: new Map([
                ['utg', { id: 'utg', stackSize: 1000 }],
                ['sb', { id: 'sb', stackSize: 995 }],
              ]),
            },
          }),
        })
        // rebuildState API call  
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: {
              betting: {
                actionOn: 'utg',
                pot: 15,
                currentBet: 10,
              },
              players: new Map([
                ['utg', { id: 'utg', stackSize: 1000 }],
                ['sb', { id: 'sb', stackSize: 995 }],
              ]),
            },
          }),
        });

      // Mock EventSourcingAdapter to return valid state
      const mockRebuildState = jest.fn().mockResolvedValue({
        currentState: {
          betting: {
            actionOn: 'utg',
            pot: 15,
            currentBet: 10,
          },
          players: new Map([
            ['utg', { id: 'utg', stackSize: 1000 }],
            ['sb', { id: 'sb', stackSize: 995 }],
          ]),
        },
        events: [],
        isComplete: false,
      });
      
      const { EventSourcingAdapter } = require('@/poker-engine/adapters/EventSourcingAdapter');
      (EventSourcingAdapter as jest.Mock).mockImplementation(() => ({
        rebuildState: mockRebuildState,
      }));

      // Create hand
      await act(async () => {
        await result.current.createHandWithEventSourcing(players, gameConfig);
      });

      // Mock the events API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: {
              betting: {
                actionOn: 'utg',
                pot: 15,
                currentBet: 10,
              },
              players: new Map([
                ['utg', { id: 'utg', stackSize: 1000 }],
                ['sb', { id: 'sb', stackSize: 995 }],
              ]),
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            events: [],
            currentState: {
              betting: {
                actionOn: 'utg',
                pot: 15,
                currentBet: 10,
              },
              players: new Map([
                ['utg', { id: 'utg', stackSize: 1000 }],
                ['sb', { id: 'sb', stackSize: 995 }],
              ]),
            },
          }),
        });

      // Manually set the adapter
      act(() => {
        result.current.eventAdapter = {
          rebuildState: mockRebuildState,
          processCommand: jest.fn(),
          getEvents: jest.fn().mockResolvedValue([]),
          getValidActions: jest.fn().mockResolvedValue([]),
          replayToSequence: jest.fn(),
        };
        result.current.handId = 'test-hand-id-3';
      });
      
      // Initialize game
      await act(async () => {
        await result.current.initializeGame(players, gameConfig);
      });

      // Verify the active player is set correctly
      const preflopSlots = result.current.streets.preflop.actionSlots;
      const utgSlot = preflopSlots.find(s => s.playerId === 'utg');
      const sbSlot = preflopSlots.find(s => s.playerId === 'sb');
      
      expect(utgSlot?.isActive).toBe(true);
      expect(sbSlot?.isActive).toBe(false);
      expect(result.current.streets.preflop.pot).toBe(15);
    });
  });
});