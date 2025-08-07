import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType, Position, GameType, GameFormat } from '@/types/poker';

describe('Action Flow Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  it('advances to next player after action', async () => {
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

    // Mock event adapter
    const mockEventAdapter = {
      rebuildState: jest
        .fn()
        .mockResolvedValueOnce({
          // Initial state - UTG to act
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
          // After UTG calls - SB to act
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

    // Initialize game with event adapter
    act(() => {
      usePokerHandStore.setState({
        handId: 'test-hand-id',
        eventAdapter: mockEventAdapter,
        players,
        gameConfig,
        isEngineInitialized: true,
        currentStreet: 'preflop',
        engineState: {
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
        },
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

    // Verify initial state - UTG is active
    expect(result.current.isPlayerToAct('utg')).toBe(true);
    expect(result.current.isPlayerToAct('sb')).toBe(false);

    // Process UTG call
    let success;
    await act(async () => {
      success = await result.current.processAction('preflop-utg', ActionType.CALL, 10);
    });

    expect(success).toBe(true);

    // Verify action advanced to SB
    const preflopSlots = result.current.streets.preflop.actionSlots;

    // UTG should be completed and inactive
    const utgSlot = preflopSlots.find((s) => s.playerId === 'utg');
    expect(utgSlot).toMatchObject({
      action: ActionType.CALL,
      completed: true,
      isActive: false,
    });

    // SB should now be active
    const sbSlot = preflopSlots.find((s) => s.playerId === 'sb');
    expect(sbSlot).toMatchObject({
      isActive: true,
      completed: false,
    });

    // Verify through isPlayerToAct
    expect(result.current.isPlayerToAct('utg')).toBe(false);
    expect(result.current.isPlayerToAct('sb')).toBe(true);
  });

  it('updates pot correctly after action', async () => {
    const { result } = renderHook(() => usePokerHandStore());

    const players = [
      { id: 'co', name: 'Player 1', position: 'co', stackSize: [200], isHero: false },
      { id: 'btn', name: 'Player 2', position: 'btn', stackSize: [200], isHero: true },
    ];

    // Mock adapter with pot updates
    const mockEventAdapter = {
      rebuildState: jest
        .fn()
        .mockResolvedValueOnce({
          currentState: {
            betting: { actionOn: 'co', pot: 0, currentBet: 0 },
            players: {
              co: { id: 'co', stackSize: 200, status: 'active', currentBet: 0 },
              btn: { id: 'btn', stackSize: 200, status: 'active', currentBet: 0 },
            },
            playerOrder: ['co', 'btn'],
            street: 'preflop',
          },
          events: [],
        })
        .mockResolvedValueOnce({
          // After CO bets
          currentState: {
            betting: { actionOn: 'btn', pot: 6, currentBet: 6 },
            players: {
              co: { id: 'co', stackSize: 194, status: 'active', currentBet: 6 },
              btn: { id: 'btn', stackSize: 200, status: 'active', currentBet: 0 },
            },
            playerOrder: ['co', 'btn'],
            street: 'preflop',
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
          blinds: { small: 1, big: 2 },
        },
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

    // Process CO bet
    await act(async () => {
      await result.current.processAction('preflop-co', ActionType.BET, 6);
    });

    // Verify pot was updated
    expect(result.current.streets.preflop.pot).toBe(6);
    expect(result.current.engineState?.currentState?.betting?.pot).toBe(6);
  });
});
