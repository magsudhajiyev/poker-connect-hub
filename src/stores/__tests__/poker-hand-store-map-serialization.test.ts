import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '../poker-hand-store';
import { Position, GameType, GameFormat } from '@/types/poker';

describe('Poker Hand Store - Map Serialization', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  it('should handle players as Map when engine state is properly initialized', async () => {
    const { result } = renderHook(() => usePokerHandStore());
    
    const players = [
      { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [100], isHero: false },
      { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [100], isHero: true },
    ];
    
    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 5, big: 10 },
    };
    
    // Mock the event adapter to return a state with players as Map
    const mockEventAdapter = {
      rebuildState: jest.fn().mockResolvedValue({
        currentState: {
          betting: { actionOn: 'utg', pot: 15, currentBet: 10 },
          players: new Map([
            ['utg', { id: 'utg', stackSize: 100, status: 'active', currentBet: 0 }],
            ['sb', { id: 'sb', stackSize: 95, status: 'active', currentBet: 5 }],
          ]),
          playerOrder: ['utg', 'sb'],
        },
        events: [],
      }),
    };
    
    // Set up store with event adapter by directly modifying state
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
      });
    });
    
    // Initialize game
    await act(async () => {
      await result.current.initializeGame(players, gameConfig);
    });
    
    // Verify the active player is set correctly
    const activeSlot = result.current.streets.preflop.actionSlots.find(slot => slot.isActive);
    expect(activeSlot).toBeDefined();
    expect(activeSlot?.playerId).toBe('utg');
  });

  it('should handle players as plain object when serialized from API', async () => {
    const { result } = renderHook(() => usePokerHandStore());
    
    const players = [
      { id: 'co', name: 'Player 1', position: 'co', stackSize: [100], isHero: false },
      { id: 'btn', name: 'Player 2', position: 'btn', stackSize: [100], isHero: true },
    ];
    
    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 5, big: 10 },
    };
    
    // Mock the event adapter to return a state with players as plain object (serialized)
    const mockEventAdapter = {
      rebuildState: jest.fn().mockResolvedValue({
        currentState: {
          betting: { actionOn: 'co', pot: 0, currentBet: 0 },
          players: {
            co: { id: 'co', stackSize: 100, status: 'active', currentBet: 0 },
            btn: { id: 'btn', stackSize: 100, status: 'active', currentBet: 0 },
          },
          playerOrder: ['co', 'btn'],
        },
        events: [],
      }),
    };
    
    // Set up store with event adapter by directly modifying state
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
      });
    });
    
    // Initialize game
    await act(async () => {
      await result.current.initializeGame(players, gameConfig);
    });
    
    // Verify the active player is set correctly even with plain object
    const activeSlot = result.current.streets.preflop.actionSlots.find(slot => slot.isActive);
    expect(activeSlot).toBeDefined();
    expect(activeSlot?.playerId).toBe('co');
  });

  it('should handle missing players gracefully', async () => {
    const { result } = renderHook(() => usePokerHandStore());
    
    const players = [
      { id: 'mp', name: 'Player 1', position: 'mp', stackSize: [100], isHero: false },
      { id: 'co', name: 'Player 2', position: 'co', stackSize: [100], isHero: true },
    ];
    
    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 5, big: 10 },
    };
    
    // Mock the event adapter to return a state with no players
    const mockEventAdapter = {
      rebuildState: jest.fn().mockResolvedValue({
        currentState: {
          betting: { actionOn: null, pot: 0, currentBet: 0 },
          players: null, // No players data
          playerOrder: ['mp', 'co'],
        },
        events: [],
      }),
    };
    
    // Set up store with event adapter by directly modifying state
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
      });
    });
    
    // Initialize game - should not throw
    await act(async () => {
      await result.current.initializeGame(players, gameConfig);
    });
    
    // Verify slots are created with default values
    expect(result.current.streets.preflop.actionSlots.length).toBe(2);
    result.current.streets.preflop.actionSlots.forEach(slot => {
      expect(slot.stackBefore).toBe(100); // Should use fallback value
    });
  });
});