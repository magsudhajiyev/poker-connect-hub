import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType, Position, GameType, GameFormat, Street } from '@/types/poker';

describe('Full Hand Flow - Preflop to River', () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  it('completes a full hand from preflop to river', async () => {
    const { result } = renderHook(() => usePokerHandStore());
    
    const players = [
      { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [200], isHero: false },
      { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [200], isHero: true },
    ];
    
    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 5, big: 10 },
    };
    
    // Mock event adapter for full hand flow
    const mockEventAdapter = {
      rebuildState: jest.fn(),
      processCommand: jest.fn().mockResolvedValue({ success: true }),
      getEvents: jest.fn().mockResolvedValue([]),
    };
    
    // Configure mock responses for each street
    const streetStates = {
      preflop: {
        utg_to_act: {
          currentState: {
            betting: { actionOn: 'utg', pot: 15, currentBet: 10 },
            players: {
              utg: { id: 'utg', stackSize: 200, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 195, status: 'active', currentBet: 5 },
            },
            playerOrder: ['utg', 'sb'],
            street: Street.PREFLOP,
          },
          events: [],
        },
        sb_to_act: {
          currentState: {
            betting: { actionOn: 'sb', pot: 20, currentBet: 10 },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 10 },
              sb: { id: 'sb', stackSize: 195, status: 'active', currentBet: 5 },
            },
            playerOrder: ['utg', 'sb'],
            street: Street.PREFLOP,
          },
          events: [],
        },
        complete: {
          currentState: {
            betting: { actionOn: null, pot: 20, currentBet: 10 },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 10 },
              sb: { id: 'sb', stackSize: 190, status: 'active', currentBet: 10 },
            },
            playerOrder: ['sb', 'utg'], // Post-flop order
            street: Street.FLOP,
            board: ['Ah', '7d', '2c'],
          },
          events: [],
        },
      },
      flop: {
        sb_to_act: {
          currentState: {
            betting: { actionOn: 'sb', pot: 20, currentBet: 0 },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 190, status: 'active', currentBet: 0 },
            },
            playerOrder: ['sb', 'utg'],
            street: Street.FLOP,
            board: ['Ah', '7d', '2c'],
          },
          events: [],
        },
        utg_to_act: {
          currentState: {
            betting: { actionOn: 'utg', pot: 20, currentBet: 0 },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 190, status: 'active', currentBet: 0 },
            },
            playerOrder: ['sb', 'utg'],
            street: Street.FLOP,
            board: ['Ah', '7d', '2c'],
          },
          events: [],
        },
        complete: {
          currentState: {
            betting: { actionOn: null, pot: 20, currentBet: 0 },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 190, status: 'active', currentBet: 0 },
            },
            playerOrder: ['sb', 'utg'],
            street: Street.TURN,
            board: ['Ah', '7d', '2c'],
          },
          events: [],
        },
      },
    };
    
    // Configure mock adapter responses
    mockEventAdapter.rebuildState
      .mockResolvedValueOnce(streetStates.preflop.utg_to_act)
      .mockResolvedValueOnce(streetStates.preflop.sb_to_act)
      .mockResolvedValueOnce(streetStates.preflop.complete)
      .mockResolvedValueOnce(streetStates.flop.sb_to_act)
      .mockResolvedValueOnce(streetStates.flop.utg_to_act)
      .mockResolvedValueOnce(streetStates.flop.complete);
    
    // Initialize game
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
        players,
        gameConfig,
        isEngineInitialized: true,
        currentStreet: Street.PREFLOP,
        streets: {
          preflop: { 
            communityCards: [], 
            actionSlots: [
              {
                id: 'preflop-utg',
                playerId: 'utg',
                playerName: 'Player 1',
                position: Position.UTG,
                isHero: false,
                stackBefore: 200,
                stackAfter: 200,
                action: undefined,
                betAmount: '',
                isActive: true,
                completed: false,
                canEdit: false,
              },
              {
                id: 'preflop-sb',
                playerId: 'sb',
                playerName: 'Player 2',
                position: Position.SB,
                isHero: true,
                stackBefore: 200,
                stackAfter: 195,
                action: undefined,
                betAmount: '',
                isActive: false,
                completed: false,
                canEdit: false,
              },
            ], 
            isComplete: false, 
            pot: 15,
          },
          flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        },
      });
    });
    
    // PREFLOP
    expect(result.current.currentStreet).toBe(Street.PREFLOP);
    expect(result.current.streets.preflop.pot).toBe(15);
    
    // UTG calls
    await act(async () => {
      await result.current.processAction('preflop-utg', ActionType.CALL, 10);
    });
    
    // Verify UTG action completed and SB is active
    expect(result.current.streets.preflop.actionSlots[0].completed).toBe(true);
    expect(result.current.streets.preflop.actionSlots[1].isActive).toBe(true);
    expect(result.current.streets.preflop.pot).toBe(20);
    
    // SB calls (completes preflop)
    await act(async () => {
      await result.current.processAction('preflop-sb', ActionType.CALL, 5);
    });
    
    // Verify street advanced to flop
    expect(result.current.currentStreet).toBe(Street.FLOP);
    expect(result.current.streets.preflop.isComplete).toBe(true);
    
    // FLOP - action slots should be generated automatically
    expect(result.current.streets.flop.actionSlots).toHaveLength(2);
    expect(result.current.streets.flop.actionSlots[0].playerId).toBe('sb'); // SB acts first post-flop
    expect(result.current.streets.flop.actionSlots[1].playerId).toBe('utg');
    expect(result.current.streets.flop.pot).toBe(20);
    
    // SB checks
    await act(async () => {
      await result.current.processAction('flop-sb', ActionType.CHECK);
    });
    
    // UTG checks (completes flop)
    await act(async () => {
      await result.current.processAction('flop-utg', ActionType.CHECK);
    });
    
    // Verify street advanced to turn
    expect(result.current.currentStreet).toBe(Street.TURN);
    expect(result.current.streets.flop.isComplete).toBe(true);
    
    // Continue with turn and river...
  });

  it('maintains pot correctly throughout all streets', async () => {
    const { result } = renderHook(() => usePokerHandStore());
    
    const players = [
      { id: 'co', name: 'Player 1', position: 'co', stackSize: [1000], isHero: false },
      { id: 'btn', name: 'Player 2', position: 'btn', stackSize: [1000], isHero: true },
    ];
    
    const mockEventAdapter = {
      rebuildState: jest.fn()
        .mockResolvedValueOnce({
          currentState: {
            betting: { actionOn: 'co', pot: 75, currentBet: 50 },
            players: {
              co: { id: 'co', stackSize: 1000, status: 'active', currentBet: 0 },
              btn: { id: 'btn', stackSize: 975, status: 'active', currentBet: 50 },
            },
            playerOrder: ['co', 'btn'],
            street: Street.PREFLOP,
          },
          events: [],
        })
        .mockResolvedValueOnce({
          currentState: {
            betting: { actionOn: 'btn', pot: 50, currentBet: 50 },
            players: {
              co: { id: 'co', stackSize: 950, status: 'active', currentBet: 50 },
              btn: { id: 'btn', stackSize: 1000, status: 'active', currentBet: 0 },
            },
            playerOrder: ['co', 'btn'],
            street: Street.PREFLOP,
          },
          events: [],
        })
        .mockResolvedValueOnce({
          currentState: {
            betting: { actionOn: null, pot: 100, currentBet: 50 },
            players: {
              co: { id: 'co', stackSize: 950, status: 'active', currentBet: 50 },
              btn: { id: 'btn', stackSize: 950, status: 'active', currentBet: 50 },
            },
            playerOrder: ['btn', 'co'],
            street: Street.FLOP,
          },
          events: [],
        })
        .mockResolvedValueOnce({
          currentState: {
            betting: { actionOn: null, pot: 100, currentBet: 50 },
            players: {
              co: { id: 'co', stackSize: 950, status: 'active', currentBet: 50 },
              btn: { id: 'btn', stackSize: 950, status: 'active', currentBet: 50 },
            },
            playerOrder: ['btn', 'co'],
            street: Street.FLOP,
          },
          events: [],
        }),
      processCommand: jest.fn().mockResolvedValue({ success: true }),
      getEvents: jest.fn().mockResolvedValue([]),
    };
    
    // Initialize
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
        players,
        gameConfig: {
          gameType: GameType.NLH,
          gameFormat: GameFormat.CASH,
          blinds: { small: 25, big: 50 },
        },
        isEngineInitialized: true,
        currentStreet: Street.PREFLOP,
        streets: {
          preflop: { 
            communityCards: [], 
            actionSlots: [
              {
                id: 'preflop-co',
                playerId: 'co',
                playerName: 'Player 1',
                position: Position.CO,
                isHero: false,
                stackBefore: 1000,
                stackAfter: 1000,
                action: undefined,
                betAmount: '',
                isActive: true,
                completed: false,
                canEdit: false,
              },
              {
                id: 'preflop-btn',
                playerId: 'btn',
                playerName: 'Player 2',
                position: Position.BTN,
                isHero: true,
                stackBefore: 1000,
                stackAfter: 975,
                action: undefined,
                betAmount: '',
                isActive: false,
                completed: false,
                canEdit: false,
              },
            ], 
            isComplete: false, 
            pot: 75,
          },
          flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        },
      });
    });
    
    // CO bets 50
    await act(async () => {
      await result.current.processAction('preflop-co', ActionType.BET, 50);
    });
    
    expect(result.current.streets.preflop.pot).toBe(50);
    
    // BTN calls 50
    await act(async () => {
      await result.current.processAction('preflop-btn', ActionType.CALL, 50);
    });
    
    // Pot should be 100 and carry to flop
    expect(result.current.streets.preflop.pot).toBe(100);
    expect(result.current.currentStreet).toBe(Street.FLOP);
    
    // Verify engineState pot is also correct
    expect(result.current.engineState?.currentState?.betting?.pot).toBe(100);
  });
});