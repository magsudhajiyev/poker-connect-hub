import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '../poker-hand-store';
import { Position, GameType, GameFormat, ActionType } from '@/types/poker';

describe('Poker Hand Store - Process Action with Map Serialization', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  it('should handle processAction when engine state has players as plain object', async () => {
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

    // Mock event adapter that returns state with players as plain object (simulating API serialization)
    const mockEventAdapter = {
      rebuildState: jest
        .fn()
        .mockResolvedValueOnce({
          // Initial state
          currentState: {
            betting: { actionOn: 'utg', pot: 15, currentBet: 10 },
            players: {
              utg: { id: 'utg', stackSize: 100, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 95, status: 'active', currentBet: 5 },
            },
            playerOrder: ['utg', 'sb'],
            street: 'preflop',
          },
          events: [],
        })
        .mockResolvedValueOnce({
          // State after UTG calls
          currentState: {
            betting: { actionOn: 'sb', pot: 20, currentBet: 10 },
            players: {
              utg: { id: 'utg', stackSize: 90, status: 'active', currentBet: 10 },
              sb: { id: 'sb', stackSize: 95, status: 'active', currentBet: 5 },
            },
            playerOrder: ['utg', 'sb'],
            street: 'preflop',
          },
          events: [],
        }),
      processCommand: jest.fn().mockResolvedValue({
        success: true,
        event: { _id: 'event-1', eventType: 'ACTION_TAKEN', sequenceNumber: 2 },
        validActions: [ActionType.FOLD, ActionType.CALL, ActionType.RAISE],
      }),
      getEvents: jest.fn().mockResolvedValue([]),
    };

    // Set up store with event adapter
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
        players,
        gameConfig,
        isEngineInitialized: true,
        currentStreet: 'preflop',
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
                stackBefore: 100,
                stackAfter: 100,
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
                stackBefore: 100,
                stackAfter: 95,
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

    // Process UTG call action
    let success;
    await act(async () => {
      success = await result.current.processAction('preflop-utg', ActionType.CALL, 10);
    });

    // Verify action was processed successfully
    expect(success).toBe(true);
    expect(mockEventAdapter.processCommand).toHaveBeenCalledWith('utg', ActionType.CALL, 10);

    // Verify action slots were updated correctly
    const preflopSlots = result.current.streets.preflop.actionSlots;

    // UTG slot should be completed and inactive
    const utgSlot = preflopSlots.find((s) => s.playerId === 'utg');
    expect(utgSlot).toMatchObject({
      action: ActionType.CALL,
      amount: 10,
      betAmount: '10',
      completed: true,
      isActive: false,
      stackAfter: 90,
    });

    // SB slot should now be active
    const sbSlot = preflopSlots.find((s) => s.playerId === 'sb');
    expect(sbSlot).toMatchObject({
      isActive: true,
      stackAfter: 95,
    });

    // Players array should be updated with new stack sizes
    const utgPlayer = result.current.players.find((p) => p.id === 'utg');
    expect(utgPlayer?.stackSize).toEqual([90]);
  });

  it('should handle processAction when engine state has players as Map', async () => {
    const { result } = renderHook(() => usePokerHandStore());

    const players = [
      { id: 'co', name: 'Player 1', position: 'co', stackSize: [200], isHero: false },
      { id: 'btn', name: 'Player 2', position: 'btn', stackSize: [200], isHero: true },
    ];

    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 1, big: 2 },
    };

    // Mock event adapter that returns state with players as Map
    const mockEventAdapter = {
      rebuildState: jest
        .fn()
        .mockResolvedValueOnce({
          // Initial state
          currentState: {
            betting: { actionOn: 'co', pot: 0, currentBet: 0 },
            players: new Map([
              ['co', { id: 'co', stackSize: 200, status: 'active', currentBet: 0 }],
              ['btn', { id: 'btn', stackSize: 200, status: 'active', currentBet: 0 }],
            ]),
            playerOrder: ['co', 'btn'],
            street: 'preflop',
          },
          events: [],
        })
        .mockResolvedValueOnce({
          // State after CO bets
          currentState: {
            betting: { actionOn: 'btn', pot: 6, currentBet: 6 },
            players: new Map([
              ['co', { id: 'co', stackSize: 194, status: 'active', currentBet: 6 }],
              ['btn', { id: 'btn', stackSize: 200, status: 'active', currentBet: 0 }],
            ]),
            playerOrder: ['co', 'btn'],
            street: 'preflop',
          },
          events: [],
        }),
      processCommand: jest.fn().mockResolvedValue({
        success: true,
        event: { _id: 'event-2', eventType: 'ACTION_TAKEN', sequenceNumber: 3 },
        validActions: [ActionType.FOLD, ActionType.CALL, ActionType.RAISE],
      }),
      getEvents: jest.fn().mockResolvedValue([]),
    };

    // Set up store
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id-2',
        eventAdapter: mockEventAdapter,
        players,
        gameConfig,
        isEngineInitialized: true,
        currentStreet: 'preflop',
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
                stackBefore: 200,
                stackAfter: 200,
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
                stackBefore: 200,
                stackAfter: 200,
                action: undefined,
                betAmount: '',
                isActive: false,
                completed: false,
                canEdit: false,
              },
            ],
            isComplete: false,
            pot: 0,
          },
          flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        },
      });
    });

    // Process CO bet action
    let success;
    await act(async () => {
      success = await result.current.processAction('preflop-co', ActionType.BET, 6);
    });

    // Verify action was processed successfully
    expect(success).toBe(true);
    expect(mockEventAdapter.processCommand).toHaveBeenCalledWith('co', ActionType.BET, 6);

    // Verify slots were updated correctly even with Map data structure
    const coSlot = result.current.streets.preflop.actionSlots.find((s) => s.playerId === 'co');
    expect(coSlot?.stackAfter).toBe(194);

    const btnSlot = result.current.streets.preflop.actionSlots.find((s) => s.playerId === 'btn');
    expect(btnSlot?.isActive).toBe(true);
  });
});
