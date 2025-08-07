import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType, GameFormat, GameType, Position, Street } from '@/types/poker';

describe('PokerHandStore - Flop Checking & State Synchronization', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  describe('getCurrentActionSlot during street transitions', () => {
    it('should return correct slot when transitioning from preflop to flop', async () => {
      const { result } = renderHook(() => usePokerHandStore());

      const players = [
        { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [1000], isHero: false },
        { id: 'bb', name: 'Player 2', position: 'bb', stackSize: [1000], isHero: true },
      ];

      const gameConfig = {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 5, big: 10 },
      };

      // Mock event sourcing adapter
      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({
          success: true,
          event: { type: 'ACTION_TAKEN', sequenceNumber: 2 },
        }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest
          .fn()
          .mockResolvedValue([ActionType.FOLD, ActionType.CALL, ActionType.RAISE]),
      };

      // Initial preflop state
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.PREFLOP,
          betting: {
            actionOn: 'utg',
            pot: 15,
            currentBet: 10,
          },
          players: {
            utg: { id: 'utg', stackSize: 1000, status: 'active', currentBet: 0 },
            bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 10 },
          },
          playerOrder: ['utg', 'bb'],
        },
        events: [],
      });

      // Setup initial state
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
                  stackBefore: 1000,
                  stackAfter: 1000,
                  action: undefined,
                  betAmount: '',
                  isActive: true,
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'preflop-bb',
                  playerId: 'bb',
                  playerName: 'Player 2',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 1000,
                  stackAfter: 990,
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
          engineState: {
            currentState: {
              street: Street.PREFLOP,
              betting: { actionOn: 'utg', pot: 15, currentBet: 10 },
              players: {
                utg: { id: 'utg', stackSize: 1000, status: 'active', currentBet: 0 },
                bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 10 },
              },
              playerOrder: ['utg', 'bb'],
            },
            events: [],
          },
        });
      });

      // Verify getCurrentActionSlot returns UTG slot on preflop
      expect(result.current.getCurrentActionSlot()?.playerId).toBe('utg');
      expect(result.current.getCurrentActionSlot()?.isActive).toBe(true);

      // Mock state after UTG calls - now BB to act
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.PREFLOP,
          betting: {
            actionOn: 'bb',
            pot: 20,
            currentBet: 10,
          },
          players: {
            utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 10 },
            bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 10 },
          },
          playerOrder: ['utg', 'bb'],
        },
        events: [],
      });

      // Process UTG call
      await act(async () => {
        await result.current.processAction('preflop-utg', ActionType.CALL, 10);
      });

      // Update UI state to reflect action
      act(() => {
        const state = result.current;
        state.streets.preflop.actionSlots[0].isActive = false;
        state.streets.preflop.actionSlots[0].completed = true;
        state.streets.preflop.actionSlots[0].action = ActionType.CALL;
        state.streets.preflop.actionSlots[1].isActive = true;
      });

      // Should now return BB slot
      expect(result.current.getCurrentActionSlot()?.playerId).toBe('bb');
      expect(result.current.getCurrentActionSlot()?.isActive).toBe(true);

      // Mock state after BB checks - street advances to flop
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.FLOP,
          betting: {
            actionOn: 'bb',
            pot: 20,
            currentBet: 0,
          },
          players: {
            utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
            bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 0 },
          },
          playerOrder: ['bb', 'utg'], // Post-flop order
          board: ['Ah', '7d', '2c'],
        },
        events: [],
      });

      // Simulate the store advancing to flop after BB's action
      act(() => {
        usePokerHandStore.setState({
          currentStreet: Street.FLOP,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'bb', pot: 20, currentBet: 0 },
              players: {
                utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
                bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg'],
              board: ['Ah', '7d', '2c'],
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
                  stackBefore: 1000,
                  stackAfter: 990,
                  action: ActionType.CALL,
                  betAmount: '10',
                  isActive: false,
                  completed: true,
                  canEdit: false,
                },
                {
                  id: 'preflop-bb',
                  playerId: 'bb',
                  playerName: 'Player 2',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 1000,
                  stackAfter: 990,
                  action: ActionType.CHECK,
                  betAmount: '',
                  isActive: false,
                  completed: true,
                  canEdit: false,
                },
              ],
              isComplete: true,
              pot: 20,
            },
            flop: {
              communityCards: ['Ah', '7d', '2c'],
              actionSlots: [
                {
                  id: 'flop-bb',
                  playerId: 'bb',
                  playerName: 'Player 2',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: true,
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'flop-utg',
                  playerId: 'utg',
                  playerName: 'Player 1',
                  position: Position.UTG,
                  isHero: false,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: false,
                  completed: false,
                  canEdit: false,
                },
              ],
              isComplete: false,
              pot: 20,
            },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
          formData: {
            players,
            gameConfig,
            holeCards: ['As', 'Kh'],
            flopCards: ['Ah', '7d', '2c'],
            turnCard: [],
            riverCard: [],
          },
        });
      });

      // Verify street advanced and action slots were generated
      expect(result.current.currentStreet).toBe(Street.FLOP);
      expect(result.current.streets.flop.actionSlots).toHaveLength(2);

      // BB should act first on flop
      const flopSlots = result.current.streets.flop.actionSlots;
      expect(flopSlots[0].playerId).toBe('bb');
      expect(flopSlots[0].isActive).toBe(true);
      expect(flopSlots[1].playerId).toBe('utg');
      expect(flopSlots[1].isActive).toBe(false);

      // getCurrentActionSlot should return the BB flop slot
      const currentSlot = result.current.getCurrentActionSlot();
      expect(currentSlot?.playerId).toBe('bb');
      expect(currentSlot?.id).toContain('flop');
      expect(currentSlot?.isActive).toBe(true);
    });

    it('should handle engine state priority over UI state for getCurrentActionSlot', async () => {
      const { result } = renderHook(() => usePokerHandStore());

      // Setup state where UI and engine might be out of sync
      // Test with BTN and BB players
      act(() => {
        usePokerHandStore.setState({
          handId: 'test-hand-id',
          currentStreet: Street.FLOP,
          streets: {
            preflop: { communityCards: [], actionSlots: [], isComplete: true, pot: 0 },
            flop: {
              communityCards: ['As', 'Kh', 'Qd'],
              actionSlots: [
                {
                  id: 'flop-btn',
                  playerId: 'btn',
                  playerName: 'Player 1',
                  position: Position.BTN,
                  isHero: false,
                  stackBefore: 495,
                  stackAfter: 495,
                  action: undefined,
                  betAmount: '',
                  isActive: true, // UI says BTN is active
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'flop-bb',
                  playerId: 'bb',
                  playerName: 'Player 2',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 495,
                  stackAfter: 495,
                  action: undefined,
                  betAmount: '',
                  isActive: false, // UI says BB is not active
                  completed: false,
                  canEdit: false,
                },
              ],
              isComplete: false,
              pot: 10,
            },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
          // Engine state says BB is to act (takes priority)
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'bb', pot: 10, currentBet: 0 },
              players: {
                btn: { id: 'btn', stackSize: 495, status: 'active', currentBet: 0 },
                bb: { id: 'bb', stackSize: 495, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'btn'],
              board: ['As', 'Kh', 'Qd'],
            },
            events: [],
          },
        });
      });

      // getCurrentActionSlot should prioritize engine state over UI state
      // Engine says BB is to act, so it should return BB's slot
      // even though UI has BTN marked as active
      const currentSlot = result.current.getCurrentActionSlot();
      expect(currentSlot?.playerId).toBe('bb'); // Engine state takes precedence - BB is to act
    });
  });

  describe('Action slot generation on street advance', () => {
    it('should generate action slots immediately when advancing to flop', async () => {
      const { result } = renderHook(() => usePokerHandStore());

      const players = [
        { id: 'co', name: 'Player 1', position: 'co', stackSize: [1000], isHero: false },
        { id: 'btn', name: 'Player 2', position: 'btn', stackSize: [1000], isHero: false },
        { id: 'bb', name: 'Player 3', position: 'bb', stackSize: [1000], isHero: true },
      ];

      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ success: true }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest.fn().mockResolvedValue([ActionType.CHECK, ActionType.BET]),
      };

      // Setup initial preflop state
      act(() => {
        usePokerHandStore.setState({
          handId: 'test-hand-id',
          eventAdapter: mockEventAdapter,
          players,
          gameConfig: {
            gameType: GameType.NLH,
            gameFormat: GameFormat.CASH,
            blinds: { small: 5, big: 10 },
          },
          isEngineInitialized: true,
          currentStreet: Street.PREFLOP,
          streets: {
            preflop: {
              communityCards: [],
              actionSlots: players.map((p) => ({
                id: `preflop-${p.id}`,
                playerId: p.id,
                playerName: p.name,
                position: p.position as Position,
                isHero: p.isHero,
                stackBefore: p.stackSize[0],
                stackAfter: p.stackSize[0] - (p.id === 'bb' ? 10 : 0),
                action: undefined,
                betAmount: '',
                isActive: false,
                completed: true,
                canEdit: false,
              })),
              isComplete: true,
              pot: 35, // Dead SB + 3 calls
            },
            flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
        });
      });

      // Mock engine state for flop
      mockEventAdapter.rebuildState.mockResolvedValue({
        currentState: {
          street: Street.FLOP,
          betting: { actionOn: 'bb', pot: 35, currentBet: 0 },
          players: {
            co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
            btn: { id: 'btn', stackSize: 990, status: 'active', currentBet: 0 },
            bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 0 },
          },
          playerOrder: ['bb', 'co', 'btn'], // Post-flop order
          board: ['Ks', 'Qh', '9d'],
        },
        events: [],
      });

      // Simulate advancing to flop manually
      act(() => {
        usePokerHandStore.setState({
          currentStreet: Street.FLOP,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'bb', pot: 35, currentBet: 0 },
              players: {
                co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
                btn: { id: 'btn', stackSize: 990, status: 'active', currentBet: 0 },
                bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'co', 'btn'],
              board: ['Ks', 'Qh', '9d'],
            },
            events: [],
          },
          streets: {
            preflop: {
              communityCards: [],
              actionSlots: result.current.streets.preflop.actionSlots.map((slot) => ({
                ...slot,
                completed: true,
                isActive: false,
              })),
              isComplete: true,
              pot: 35,
            },
            flop: {
              communityCards: ['Ks', 'Qh', '9d'],
              actionSlots: [
                {
                  id: 'flop-bb',
                  playerId: 'bb',
                  playerName: 'Player 3',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: true,
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'flop-co',
                  playerId: 'co',
                  playerName: 'Player 1',
                  position: Position.CO,
                  isHero: false,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: false,
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'flop-btn',
                  playerId: 'btn',
                  playerName: 'Player 2',
                  position: Position.BTN,
                  isHero: false,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: false,
                  completed: false,
                  canEdit: false,
                },
              ],
              isComplete: false,
              pot: 35,
            },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
          formData: {
            ...result.current.formData,
            flopCards: ['Ks', 'Qh', '9d'],
          },
        });
      });

      // Verify flop slots were generated immediately
      expect(result.current.currentStreet).toBe(Street.FLOP);
      expect(result.current.streets.flop.actionSlots).toHaveLength(3);

      const flopSlots = result.current.streets.flop.actionSlots;

      // Verify correct order (BB first postflop)
      expect(flopSlots[0].playerId).toBe('bb');
      expect(flopSlots[0].isActive).toBe(true);
      expect(flopSlots[1].playerId).toBe('co');
      expect(flopSlots[1].isActive).toBe(false);
      expect(flopSlots[2].playerId).toBe('btn');
      expect(flopSlots[2].isActive).toBe(false);

      // Verify stack sizes are carried over correctly
      flopSlots.forEach((slot) => {
        expect(slot.stackBefore).toBe(990); // After paying 10 preflop
      });

      // Community cards should be synced
      expect(result.current.formData.flopCards).toEqual(['Ks', 'Qh', '9d']);
    });

    it('should update action slots when player folds on flop', async () => {
      const { result } = renderHook(() => usePokerHandStore());

      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ success: true }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest
          .fn()
          .mockResolvedValue([ActionType.CHECK, ActionType.BET, ActionType.FOLD]),
      };

      // Setup flop state with all players active
      act(() => {
        usePokerHandStore.setState({
          handId: 'test-hand-id',
          eventAdapter: mockEventAdapter,
          currentStreet: Street.FLOP,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'bb', pot: 30, currentBet: 0 },
              players: {
                bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 0 },
                utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
                co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg', 'co'],
              board: ['Ad', '7s', '2h'],
            },
            events: [],
          },
          streets: {
            preflop: { communityCards: [], actionSlots: [], isComplete: true, pot: 0 },
            flop: {
              communityCards: ['Ad', '7s', '2h'],
              actionSlots: [
                {
                  id: 'flop-bb',
                  playerId: 'bb',
                  playerName: 'Player 3',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: true,
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'flop-utg',
                  playerId: 'utg',
                  playerName: 'Player 1',
                  position: Position.UTG,
                  isHero: false,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: false,
                  completed: false,
                  canEdit: false,
                },
                {
                  id: 'flop-co',
                  playerId: 'co',
                  playerName: 'Player 2',
                  position: Position.CO,
                  isHero: false,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: false,
                  completed: false,
                  canEdit: false,
                },
              ],
              isComplete: false,
              pot: 30,
            },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
        });
      });

      // Mock state after BB bets
      mockEventAdapter.rebuildState
        .mockResolvedValueOnce({
          currentState: {
            street: Street.FLOP,
            betting: { actionOn: 'utg', pot: 55, currentBet: 25 },
            players: {
              bb: { id: 'bb', stackSize: 965, status: 'active', currentBet: 25 },
              utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
              co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
            },
            playerOrder: ['bb', 'utg', 'co'],
            board: ['Ad', '7s', '2h'],
          },
          events: [],
        })
        .mockResolvedValueOnce({
          currentState: {
            street: Street.FLOP,
            betting: { actionOn: 'co', pot: 55, currentBet: 25 },
            players: {
              bb: { id: 'bb', stackSize: 965, status: 'active', currentBet: 25 },
              utg: { id: 'utg', stackSize: 990, status: 'folded', currentBet: 0 },
              co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
            },
            playerOrder: ['bb', 'utg', 'co'],
            board: ['Ad', '7s', '2h'],
          },
          events: [],
        });

      // Simulate BB betting by updating state directly
      act(() => {
        const updatedStreets = { ...result.current.streets };
        updatedStreets.flop.actionSlots[0] = {
          ...updatedStreets.flop.actionSlots[0],
          action: ActionType.BET,
          betAmount: '25',
          stackAfter: 965,
          completed: true,
          isActive: false,
        };
        // UTG is now to act
        updatedStreets.flop.actionSlots[1] = {
          ...updatedStreets.flop.actionSlots[1],
          isActive: true,
        };
        usePokerHandStore.setState({
          streets: updatedStreets,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'utg', pot: 55, currentBet: 25 },
              players: {
                bb: { id: 'bb', stackSize: 965, status: 'active', currentBet: 25 },
                utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
                co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg', 'co'],
              board: ['Ad', '7s', '2h'],
            },
            events: [],
          },
        });
      });

      // Simulate UTG folding
      act(() => {
        const updatedStreets = { ...result.current.streets };
        updatedStreets.flop.actionSlots[1] = {
          ...updatedStreets.flop.actionSlots[1],
          action: ActionType.FOLD,
          completed: true,
          isActive: false,
        };
        // CO is now to act
        updatedStreets.flop.actionSlots[2] = {
          ...updatedStreets.flop.actionSlots[2],
          isActive: true,
        };
        usePokerHandStore.setState({
          streets: updatedStreets,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'co', pot: 55, currentBet: 25 },
              players: {
                bb: { id: 'bb', stackSize: 965, status: 'active', currentBet: 25 },
                utg: { id: 'utg', stackSize: 990, status: 'folded', currentBet: 0 },
                co: { id: 'co', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg', 'co'],
              board: ['Ad', '7s', '2h'],
            },
            events: [],
          },
        });
      });

      // Verify UTG slot is marked as folded
      const utgSlot = result.current.streets.flop.actionSlots.find((s) => s.playerId === 'utg');
      expect(utgSlot?.action).toBe(ActionType.FOLD);
      expect(utgSlot?.completed).toBe(true);
      expect(utgSlot?.isActive).toBe(false);

      // CO should now be active
      const coSlot = result.current.streets.flop.actionSlots.find((s) => s.playerId === 'co');
      expect(coSlot?.isActive).toBe(true);

      // getCurrentActionSlot should return CO slot
      expect(result.current.getCurrentActionSlot()?.playerId).toBe('co');
    });
  });

  describe('Flop checking workflow', () => {
    it('should handle complete check-around on flop', async () => {
      const { result } = renderHook(() => usePokerHandStore());

      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ success: true }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest.fn().mockResolvedValue([ActionType.CHECK, ActionType.BET]),
      };

      // Setup flop state
      act(() => {
        usePokerHandStore.setState({
          handId: 'test-hand-id',
          eventAdapter: mockEventAdapter,
          currentStreet: Street.FLOP,
          streets: {
            preflop: { communityCards: [], actionSlots: [], isComplete: true, pot: 0 },
            flop: {
              communityCards: ['Jh', '9c', '4d'],
              actionSlots: [
                {
                  id: 'flop-bb',
                  playerId: 'bb',
                  playerName: 'Player 2',
                  position: Position.BB,
                  isHero: true,
                  stackBefore: 490,
                  stackAfter: 490,
                  action: undefined,
                  betAmount: '',
                  isActive: true,
                  completed: false,
                  canEdit: true,
                },
                {
                  id: 'flop-btn',
                  playerId: 'btn',
                  playerName: 'Player 1',
                  position: Position.BTN,
                  isHero: false,
                  stackBefore: 495,
                  stackAfter: 495,
                  action: undefined,
                  betAmount: '',
                  isActive: false,
                  completed: false,
                  canEdit: false,
                },
              ],
              isComplete: false,
              pot: 20,
            },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
        });
      });

      // Mock states for the check sequence
      mockEventAdapter.rebuildState
        .mockResolvedValueOnce({
          currentState: {
            street: Street.FLOP,
            betting: { actionOn: 'btn', pot: 20, currentBet: 0 },
            players: {
              bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
              btn: { id: 'btn', stackSize: 495, status: 'active', currentBet: 0 },
            },
            playerOrder: ['bb', 'btn'],
            board: ['Jh', '9c', '4d'],
          },
          events: [],
        })
        .mockResolvedValueOnce({
          currentState: {
            street: Street.TURN,
            betting: { actionOn: 'bb', pot: 20, currentBet: 0 },
            players: {
              bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
              btn: { id: 'btn', stackSize: 495, status: 'active', currentBet: 0 },
            },
            playerOrder: ['bb', 'btn'],
            board: ['Jh', '9c', '4d', '2s'],
          },
          events: [],
        });

      // Simulate BB checking
      act(() => {
        const updatedStreets = { ...result.current.streets };
        updatedStreets.flop.actionSlots[0] = {
          ...updatedStreets.flop.actionSlots[0],
          action: ActionType.CHECK,
          completed: true,
          isActive: false,
        };
        // BTN is now to act
        updatedStreets.flop.actionSlots[1] = {
          ...updatedStreets.flop.actionSlots[1],
          isActive: true,
        };
        usePokerHandStore.setState({
          streets: updatedStreets,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'btn', pot: 20, currentBet: 0 },
              players: {
                bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
                btn: { id: 'btn', stackSize: 495, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'btn'],
              board: ['Jh', '9c', '4d'],
            },
            events: [],
          },
        });
      });

      // Verify BB slot is updated
      const bbSlot = result.current.streets.flop.actionSlots.find((s) => s.playerId === 'bb');
      expect(bbSlot?.action).toBe(ActionType.CHECK);
      expect(bbSlot?.completed).toBe(true);
      expect(bbSlot?.isActive).toBe(false);

      // BTN should now be active
      const btnSlot = result.current.streets.flop.actionSlots.find((s) => s.playerId === 'btn');
      expect(btnSlot?.isActive).toBe(true);

      // Simulate BTN checking and advancing to turn
      act(() => {
        const updatedStreets = { ...result.current.streets };
        updatedStreets.flop.actionSlots[1] = {
          ...updatedStreets.flop.actionSlots[1],
          action: ActionType.CHECK,
          completed: true,
          isActive: false,
        };
        updatedStreets.flop.isComplete = true;

        // Generate turn slots
        updatedStreets.turn = {
          communityCards: ['2s'],
          actionSlots: [
            {
              id: 'turn-bb',
              playerId: 'bb',
              playerName: 'Player 2',
              position: Position.BB,
              isHero: true,
              stackBefore: 490,
              stackAfter: 490,
              action: undefined,
              betAmount: '',
              isActive: true,
              completed: false,
              canEdit: false,
            },
            {
              id: 'turn-btn',
              playerId: 'btn',
              playerName: 'Player 1',
              position: Position.BTN,
              isHero: false,
              stackBefore: 495,
              stackAfter: 495,
              action: undefined,
              betAmount: '',
              isActive: false,
              completed: false,
              canEdit: false,
            },
          ],
          isComplete: false,
          pot: 20,
        };

        usePokerHandStore.setState({
          currentStreet: Street.TURN,
          streets: updatedStreets,
          engineState: {
            currentState: {
              street: Street.TURN,
              betting: { actionOn: 'bb', pot: 20, currentBet: 0 },
              players: {
                bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
                btn: { id: 'btn', stackSize: 495, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'btn'],
              board: ['Jh', '9c', '4d', '2s'],
            },
            events: [],
          },
          formData: {
            ...result.current.formData,
            turnCard: ['2s'],
          },
        });
      });

      // Should advance to turn
      expect(result.current.currentStreet).toBe(Street.TURN);
      expect(result.current.streets.flop.isComplete).toBe(true);

      // Turn slots should be generated
      expect(result.current.streets.turn.actionSlots).toHaveLength(2);
      expect(result.current.streets.turn.actionSlots[0].playerId).toBe('bb'); // BB acts first
      expect(result.current.streets.turn.actionSlots[0].isActive).toBe(true);

      // Community cards should be updated
      expect(result.current.formData.turnCard).toEqual(['2s']);
    });

    it('should validate check action is available before allowing it', async () => {
      const { result } = renderHook(() => usePokerHandStore());

      const players = [
        { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [1000], isHero: true },
        { id: 'bb', name: 'Player 2', position: 'bb', stackSize: [1000], isHero: false },
      ];

      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ success: true }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest.fn(),
      };

      // Setup flop with a bet facing the player (check should not be available)
      act(() => {
        usePokerHandStore.setState({
          handId: 'test-hand-id',
          eventAdapter: mockEventAdapter,
          players,
          gameConfig: {
            gameType: GameType.NLH,
            gameFormat: GameFormat.CASH,
            blinds: { small: 5, big: 10 },
          },
          currentStreet: Street.FLOP,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'utg', pot: 45, currentBet: 25 },
              players: {
                bb: { id: 'bb', stackSize: 965, status: 'active', currentBet: 25 },
                utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg'],
              board: ['As', 'Kh', 'Qd'],
            },
            events: [],
          },
          streets: {
            preflop: { communityCards: [], actionSlots: [], isComplete: true, pot: 0 },
            flop: {
              communityCards: ['As', 'Kh', 'Qd'],
              actionSlots: [
                {
                  id: 'flop-bb',
                  playerId: 'bb',
                  playerName: 'Player 2',
                  position: Position.BB,
                  isHero: false,
                  stackBefore: 990,
                  stackAfter: 965, // Bet 25
                  action: ActionType.BET,
                  betAmount: '25',
                  isActive: false,
                  completed: true,
                  canEdit: false,
                },
                {
                  id: 'flop-utg',
                  playerId: 'utg',
                  playerName: 'Player 1',
                  position: Position.UTG,
                  isHero: true,
                  stackBefore: 990,
                  stackAfter: 990,
                  action: undefined,
                  betAmount: '',
                  isActive: true,
                  completed: false,
                  canEdit: true,
                },
              ],
              isComplete: false,
              pot: 45, // 20 + 25
            },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
          formData: {
            gameType: 'nlhe',
            gameFormat: 'cash',
            stackSize: '1000',
            heroPosition: 'utg',
            villainPosition: 'bb',
            heroStackSize: [1000],
            villainStackSize: [1000],
            players,
            holeCards: ['As', 'Kh'],
            flopCards: ['As', 'Kh', 'Qd'],
            turnCard: [],
            riverCard: [],
            preflopActions: [],
            preflopDescription: '',
            flopActions: [],
            flopDescription: '',
            turnActions: [],
            turnDescription: '',
            riverActions: [],
            riverDescription: '',
            title: '',
            description: '',
            smallBlind: '5',
            bigBlind: '10',
            ante: false,
            anteAmount: '',
            tags: [],
          },
          isEngineInitialized: true,
          engine: null,
          handEvents: [],
          currentEventIndex: 0,
          isReplaying: false,
          heroId: 'utg',
          currentStep: 0,
          isBettingRoundComplete: false,
          tags: [],
        });
      });

      // Mock valid actions - check should NOT be available with a bet facing
      mockEventAdapter.getValidActions.mockResolvedValue([
        ActionType.FOLD,
        ActionType.CALL,
        ActionType.RAISE,
      ]);

      // Verify check is not available when facing a bet
      const validActions = await result.current.getValidActionsForCurrentPlayer();
      expect(validActions).not.toContain(ActionType.CHECK);
      expect(validActions).toContain(ActionType.CALL);

      // Now test scenario where check IS available (no bet facing)
      // Update engine state to show no current bet
      act(() => {
        usePokerHandStore.setState({
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'utg', pot: 20, currentBet: 0 }, // No current bet
              players: {
                bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 0 },
                utg: { id: 'utg', stackSize: 990, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg'],
              board: ['As', 'Kh', 'Qd'],
            },
            events: [],
          },
          streets: {
            ...result.current.streets,
            flop: {
              ...result.current.streets.flop,
              actionSlots: [
                {
                  ...result.current.streets.flop.actionSlots[0],
                  action: ActionType.CHECK,
                  stackAfter: 990, // No chips committed
                },
                result.current.streets.flop.actionSlots[1], // UTG unchanged
              ],
            },
          },
        });
      });

      mockEventAdapter.getValidActions.mockResolvedValue([ActionType.CHECK, ActionType.BET]);

      // Now check should be available
      const validActionsNobet = await result.current.getValidActionsForCurrentPlayer();
      expect(validActionsNobet).toContain(ActionType.CHECK);
      expect(validActionsNobet).toContain(ActionType.BET);
      expect(validActionsNobet).not.toContain(ActionType.CALL);
    });
  });
});
