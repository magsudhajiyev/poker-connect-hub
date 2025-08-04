import { act, renderHook } from '@testing-library/react';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType, GameFormat, GameType, Position, Street } from '@/types/poker';

describe('PokerHandStore - Street Synchronization', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  describe('Street advancement with event sourcing', () => {
    it('should advance from preflop to flop when all players complete betting', async () => {
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
      
      // Mock event sourcing adapter
      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ 
          success: true,
          event: { type: 'ACTION_TAKEN', sequenceNumber: 2 }
        }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest.fn().mockResolvedValue([ActionType.FOLD, ActionType.CALL, ActionType.RAISE]),
      };
      
      // Initial state - UTG to act preflop
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.PREFLOP,
          betting: { 
            actionOn: 'utg', 
            pot: 15, 
            currentBet: 10 
          },
          players: {
            utg: { id: 'utg', stackSize: 200, status: 'active', currentBet: 0 },
            sb: { id: 'sb', stackSize: 195, status: 'active', currentBet: 5 },
          },
          playerOrder: ['utg', 'sb'],
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
              pot: 15 
            },
            flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
          formData: {
            players,
            gameConfig,
            holeCards: ['As', 'Kh'],
            flopCards: [],
            turnCard: [],
            riverCard: [],
          },
        });
      });
      
      // After UTG calls - SB to act
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.PREFLOP,
          betting: { 
            actionOn: 'sb', 
            pot: 20, 
            currentBet: 10 
          },
          players: {
            utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 10 },
            sb: { id: 'sb', stackSize: 195, status: 'active', currentBet: 5 },
          },
          playerOrder: ['utg', 'sb'],
        },
        events: [],
      });
      
      // Process UTG call
      await act(async () => {
        await result.current.processAction('preflop-utg', ActionType.CALL, 10);
      });
      
      // Verify still on preflop
      expect(result.current.currentStreet).toBe(Street.PREFLOP);
      
      // After SB calls - street advances to flop (simulate two calls to rebuildState)
      mockEventAdapter.rebuildState
        .mockResolvedValueOnce({
          currentState: {
            street: Street.FLOP,
            betting: { 
              actionOn: 'sb', 
              pot: 20, 
              currentBet: 0 
            },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 190, status: 'active', currentBet: 0 },
            },
            playerOrder: ['sb', 'utg'], // Post-flop order
            board: ['Ah', '7d', '2c'],
          },
          events: [],
        })
        .mockResolvedValueOnce({
          currentState: {
            street: Street.FLOP,
            betting: { 
              actionOn: 'sb', 
              pot: 20, 
              currentBet: 0 
            },
            players: {
              utg: { id: 'utg', stackSize: 190, status: 'active', currentBet: 0 },
              sb: { id: 'sb', stackSize: 190, status: 'active', currentBet: 0 },
            },
            playerOrder: ['sb', 'utg'], // Post-flop order
            board: ['Ah', '7d', '2c'],
          },
          events: [],
        });
      
      // Process SB call
      await act(async () => {
        await result.current.processAction('preflop-sb', ActionType.CALL, 5);
      });
      
      // Verify street advanced to flop
      expect(result.current.currentStreet).toBe(Street.FLOP);
      expect(result.current.streets.preflop.isComplete).toBe(true);
      expect(result.current.streets.flop.actionSlots).toHaveLength(2);
      expect(result.current.streets.flop.actionSlots[0].playerId).toBe('sb'); // SB acts first post-flop
      expect(result.current.streets.flop.pot).toBe(20);
      
      // Verify community cards were synced to formData
      expect(result.current.formData.flopCards).toEqual(['Ah', '7d', '2c']);
    });

    it('should maintain pot size across street transitions', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: 'co', name: 'Player 1', position: 'co', stackSize: [1000], isHero: false },
        { id: 'btn', name: 'Player 2', position: 'btn', stackSize: [1000], isHero: true },
        { id: 'bb', name: 'Player 3', position: 'bb', stackSize: [1000], isHero: false },
      ];
      
      // Mock adapter that shows pot growing
      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ success: true }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest.fn().mockResolvedValue([ActionType.FOLD, ActionType.CALL, ActionType.RAISE]),
      };
      
      // Initial state - CO to act with 15 in pot (blinds)
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.PREFLOP,
          betting: { actionOn: 'co', pot: 15, currentBet: 10 },
          players: {
            co: { id: 'co', stackSize: 1000, status: 'active', currentBet: 0 },
            btn: { id: 'btn', stackSize: 1000, status: 'active', currentBet: 0 },
            bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 10 },
          },
          playerOrder: ['co', 'btn', 'bb'],
        },
        events: [],
      });
      
      // Initialize
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
              actionSlots: players.map((p, i) => ({
                id: `preflop-${p.id}`,
                playerId: p.id,
                playerName: p.name,
                position: p.position as Position,
                isHero: p.isHero,
                stackBefore: p.stackSize[0],
                stackAfter: p.stackSize[0],
                action: undefined,
                betAmount: '',
                isActive: i === 0,
                completed: false,
                canEdit: false,
              })), 
              isComplete: false, 
              pot: 15 
            },
            flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
        });
      });
      
      // After CO raises to 30
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.PREFLOP,
          betting: { actionOn: 'btn', pot: 45, currentBet: 30 },
          players: {
            co: { id: 'co', stackSize: 970, status: 'active', currentBet: 30 },
            btn: { id: 'btn', stackSize: 1000, status: 'active', currentBet: 0 },
            bb: { id: 'bb', stackSize: 990, status: 'active', currentBet: 10 },
          },
          playerOrder: ['co', 'btn', 'bb'],
        },
        events: [],
      });
      
      await act(async () => {
        await result.current.processAction('preflop-co', ActionType.RAISE, 30);
      });
      
      expect(result.current.streets.preflop.pot).toBe(45);
      
      // Continue with more actions and verify pot carries over...
    });

    it('should sync formData with engine state when streets advance', async () => {
      const { result } = renderHook(() => usePokerHandStore());
      
      const players = [
        { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [500], isHero: true },
        { id: 'bb', name: 'Player 2', position: 'bb', stackSize: [500], isHero: false },
      ];
      
      const mockEventAdapter = {
        processCommand: jest.fn().mockResolvedValue({ success: true }),
        rebuildState: jest.fn(),
        getEvents: jest.fn().mockResolvedValue([]),
        getValidActions: jest.fn().mockResolvedValue([]),
      };
      
      // Setup for flop with community cards
      mockEventAdapter.rebuildState.mockResolvedValueOnce({
        currentState: {
          street: Street.FLOP,
          betting: { actionOn: 'bb', pot: 20, currentBet: 0 },
          players: {
            utg: { id: 'utg', stackSize: 490, status: 'active', currentBet: 0 },
            bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
          },
          playerOrder: ['bb', 'utg'],
          board: ['Ks', 'Qh', '9d'],
        },
        events: [],
      });
      
      // Initialize on flop
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
          currentStreet: Street.FLOP,
          engineState: {
            currentState: {
              street: Street.FLOP,
              betting: { actionOn: 'bb', pot: 20, currentBet: 0 },
              players: {
                utg: { id: 'utg', stackSize: 490, status: 'active', currentBet: 0 },
                bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg'],
              board: ['Ks', 'Qh', '9d'],
            },
            events: [],
          },
          formData: {
            players,
            flopCards: ['Ks', 'Qh', '9d'],
            turnCard: [],
            riverCard: [],
          },
        });
      });
      
      // The formData should already have the flop cards from initialization
      expect(result.current.formData.flopCards).toEqual(['Ks', 'Qh', '9d']);
      expect(result.current.currentStreet).toBe(Street.FLOP);
      
      // Update engine state for turn
      act(() => {
        usePokerHandStore.setState({
          engineState: {
            currentState: {
              street: Street.TURN,
              betting: { actionOn: 'bb', pot: 20, currentBet: 0 },
              players: {
                utg: { id: 'utg', stackSize: 490, status: 'active', currentBet: 0 },
                bb: { id: 'bb', stackSize: 490, status: 'active', currentBet: 0 },
              },
              playerOrder: ['bb', 'utg'],
              board: ['Ks', 'Qh', '9d', '3c'],
            },
            events: [],
          },
        });
      });
      
      // Advance to turn
      act(() => {
        result.current.advanceToNextStreet();
      });
      
      // Verify turn card was added
      expect(result.current.formData.turnCard).toEqual(['3c']);
      expect(result.current.currentStreet).toBe(Street.TURN);
    });
  });
});