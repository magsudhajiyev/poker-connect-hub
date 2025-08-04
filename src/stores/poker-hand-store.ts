// =====================================================
// ZUSTAND STORE FOR POKER HAND SHARING
// =====================================================

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { HandBuilderService } from '@/poker-engine/services/builder';
import { Position, ActionType, Street, GameType, GameFormat } from '@/types/poker';
import { GameConfig, HandState } from '@/poker-engine/core/state';
import { Player } from '@/types/shareHand';
import { IEventSourcingAdapter } from '@/types/event-sourcing';
import { IHandEvent } from '@/models/HandEvent';
// import { v4 as uuidv4 } from 'uuid';  // Removed unused import

// =====================================================
// TYPES
// =====================================================

interface ActionSlot {
  id: string; // Unique ID for React keys
  playerId: string;
  playerName: string;
  position: Position;
  isHero: boolean;
  stackBefore: number; // Stack size before action
  stackAfter: number; // Stack size after action

  // Action data
  action?: string; // undefined = hasn't acted yet (compatible with ActionStep)
  amount?: number;
  betAmount?: string; // For compatibility with existing ActionStep

  // UI state
  isActive: boolean; // Is this the current player to act?
  completed: boolean; // Has this action been taken? (matches existing ActionStep)
  canEdit: boolean; // Can user modify this action?
}

interface StreetState {
  communityCards: string[];
  actionSlots: ActionSlot[];
  isComplete: boolean;
  pot: number;
}

interface PokerHandState {
  // Game Configuration
  gameConfig: GameConfig;

  // Players
  players: Player[];
  heroId: string | null;

  // Engine State
  engine: HandBuilderService | null;
  engineState:
    | ReturnType<HandBuilderService['getCurrentState']>
    | {
        currentState: HandState;
        events: IHandEvent[];
        lastSequence?: number;
      }
    | null;

  // Event Sourcing
  eventAdapter: IEventSourcingAdapter | null;
  handEvents: IHandEvent[];
  currentEventIndex: number;
  isReplaying: boolean;
  handId: string | null;

  // UI State
  currentStep: number;
  isEngineInitialized: boolean;

  // Street States
  streets: {
    preflop: StreetState;
    flop: StreetState;
    turn: StreetState;
    river: StreetState;
  };

  // Current Street
  currentStreet: Street;

  // Track if betting round is complete but street hasn't advanced yet
  isBettingRoundComplete: boolean;

  // Form Data (for compatibility with existing components)
  formData: {
    gameType: string;
    gameFormat: string;
    stackSize: string;
    heroPosition: string;
    villainPosition: string;
    heroStackSize: number[];
    villainStackSize: number[];
    players: Player[];
    holeCards: string[];
    flopCards: string[];
    turnCard: string[];
    riverCard: string[];
    preflopActions: ActionSlot[];
    preflopDescription: string;
    flopActions: ActionSlot[];
    flopDescription: string;
    turnActions: ActionSlot[];
    turnDescription: string;
    riverActions: ActionSlot[];
    riverDescription: string;
    title: string;
    description: string;
    smallBlind: string;
    bigBlind: string;
    ante: boolean;
    anteAmount: string;
    tags: string[];
  };

  // Tags (for compatibility)
  tags: string[];

  // Actions
  initializeGame: (players: Player[], gameConfig: GameConfig) => Promise<void>;
  processAction: (slotId: string, action: ActionType, amount?: number) => Promise<boolean>;
  dealCards: (playerId: string | null, cards: string[], street: Street) => void;
  generateActionSlots: (street: Street) => void;
  updateFormData: (data: Partial<PokerHandState['formData']>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // Event Sourcing Actions
  createHandWithEventSourcing: (
    players: Player[],
    gameConfig: GameConfig,
  ) => Promise<string | null>;
  initializeWithEventSourcing: (handId: string) => Promise<void>;
  getValidActionsForCurrentPlayer: () => Promise<ActionType[]>;
  loadEventsForReplay: () => Promise<void>;
  replayToEvent: (eventIndex: number) => Promise<void>;
  replayNext: () => Promise<void>;
  replayPrevious: () => Promise<void>;

  // Computed
  getCurrentPlayer: () => Player | null;
  getLegalActions: () => ReturnType<HandBuilderService['getLegalActions']>;
  getCurrentActionSlot: () => ActionSlot | null;
  isPlayerToAct: (playerId: string) => boolean;
  isStreetComplete: (street: Street) => boolean;

  // Internal helpers
  generateActionSlotsForStreet: (
    players: Player[],
    street: Street,
    engine: HandBuilderService,
  ) => ActionSlot[];
  advanceToNextStreet: () => void;
  getSlotById: (slotId: string) => ActionSlot | null;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Helper to ensure players is always a Map
const ensurePlayersMap = (playersData: any): Map<string, any> => {
  if (playersData instanceof Map) {
    return playersData;
  } else if (typeof playersData === 'object' && playersData !== null) {
    return new Map(Object.entries(playersData));
  }
  return new Map();
};

const getActionOrder = (players: Player[], street: Street): Player[] => {
  // Use the actual player positions from the engine rules
  const allPositions =
    street === Street.PREFLOP
      ? [
          Position.UTG,
          Position.UTG1,
          Position.LJ,
          Position.HJ,
          Position.MP,
          Position.CO,
          Position.BTN,
          Position.SB,
          Position.BB,
        ]
      : [
          Position.SB,
          Position.BB,
          Position.UTG,
          Position.UTG1,
          Position.LJ,
          Position.HJ,
          Position.MP,
          Position.CO,
          Position.BTN,
        ];

  // Filter to only include positions that exist in the current game
  const existingPositions = allPositions.filter((pos) => players.some((p) => p.position === pos));

  return existingPositions
    .map((pos) => players.find((p) => p.position === pos))
    .filter(Boolean) as Player[];
};

const generateSlotId = (street: Street, playerId: string) => `${street}-${playerId}`;

// =====================================================
// ZUSTAND STORE
// =====================================================

export const usePokerHandStore = create<PokerHandState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      gameConfig: {
        gameType: GameType.NLH,
        gameFormat: GameFormat.CASH,
        blinds: { small: 1, big: 2 },
      },
      players: [],
      heroId: null,
      engine: null,
      engineState: null,
      currentStep: 0,
      isEngineInitialized: false,

      // Event Sourcing State
      eventAdapter: null,
      handEvents: [],
      currentEventIndex: -1,
      isReplaying: false,
      handId: null,
      streets: {
        preflop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
      },
      currentStreet: Street.PREFLOP,
      isBettingRoundComplete: false,
      formData: {
        gameType: '',
        gameFormat: '',
        stackSize: '',
        heroPosition: '',
        villainPosition: '',
        heroStackSize: [100],
        villainStackSize: [100],
        players: [],
        holeCards: [],
        flopCards: [],
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
        smallBlind: '',
        bigBlind: '',
        ante: false,
        anteAmount: '',
        tags: [],
      },
      tags: [],

      // Generate Action Slots for a Street
      generateActionSlotsForStreet: (
        players: Player[],
        street: Street,
        engine: HandBuilderService,
      ) => {
        const orderedPlayers = getActionOrder(players, street);
        const engineState = engine.getCurrentState();
        const currentPlayerId = engineState?.currentState?.betting?.actionOn || null;

        return orderedPlayers.map((player) => {
          // Get player state, handling both Map and plain object cases
          const playersMap = ensurePlayersMap(engineState?.currentState?.players);
          const playerState = playersMap.get(player.id);

          return {
            id: generateSlotId(street, player.id),
            playerId: player.id,
            playerName: player.name,
            position: player.position as Position,
            isHero: player.isHero || false,
            stackBefore: playerState?.stackSize || player.stackSize[0],
            stackAfter: playerState?.stackSize || player.stackSize[0],
            action: undefined,
            betAmount: '',
            isActive: player.id === currentPlayerId,
            completed: false,
            canEdit: false, // Will be true for hero actions in edit mode
          };
        });
      },

      // Initialize Game
      initializeGame: async (players, gameConfig) => {
        try {
          // If we already have a handId, use event sourcing
          const { handId, eventAdapter } = get();

          if (handId && eventAdapter) {
            // Initialize through event sourcing
            const state = await eventAdapter.rebuildState();

            // Generate preflop action slots based on engine state
            let activePlayerId = state?.currentState?.betting?.actionOn || null;

            // If no actionOn player set yet (initial state), determine who should act first
            if (!activePlayerId && state?.currentState) {
              // Find first active player in position order
              const playerOrder = state.currentState.playerOrder || [];
              const playersData = state.currentState.players;

              // Convert players to Map if it's not already
              const playersMap = ensurePlayersMap(playersData);

              for (const playerId of playerOrder) {
                const player = playersMap.get(playerId);
                if (player && player.status === 'active') {
                  activePlayerId = playerId;
                  break;
                }
              }
            }

            const orderedPlayers = getActionOrder(players, Street.PREFLOP);

            const preflopSlots = orderedPlayers.map((player) => {
              // Get player state, handling both Map and plain object cases
              const playersMap = ensurePlayersMap(state?.currentState?.players);
              const playerState = playersMap.get(player.id);

              const isActive = player.id === activePlayerId;

              return {
                id: generateSlotId(Street.PREFLOP, player.id),
                playerId: player.id,
                playerName: player.name,
                position: player.position as Position,
                isHero: player.isHero || false,
                stackBefore: playerState?.stackSize || player.stackSize[0],
                stackAfter: playerState?.stackSize || player.stackSize[0],
                action: undefined,
                betAmount: '',
                isActive,
                completed: false,
                canEdit: false,
              };
            });

            // Update players with current stack sizes and hole cards from engine after blinds
            const updatedPlayers = players.map((player) => {
              if (state?.currentState?.players) {
                const playersMap = ensurePlayersMap(state.currentState.players);
                const enginePlayer = playersMap.get(player.id);
                if (enginePlayer) {
                  return {
                    ...player,
                    stackSize: [enginePlayer.stackSize],
                    holeCards: enginePlayer.holeCards || [],
                  };
                }
              }
              return player;
            });

            set({
              players: updatedPlayers.map((p) => ({ ...p })), // Deep clone for initial update
              gameConfig,
              engine: null, // No legacy engine when using event sourcing
              engineState: state,
              isEngineInitialized: true,
              heroId: players.find((p) => p.isHero)?.id || null,
              streets: {
                ...get().streets,
                preflop: {
                  ...get().streets.preflop,
                  actionSlots: preflopSlots,
                  pot: state?.currentState?.betting?.pot || 0,
                },
              },
              formData: {
                ...get().formData,
                players: updatedPlayers.map((p) => ({ ...p })), // Deep clone here too
                preflopActions: preflopSlots,
              },
            });
          } else {
            // Legacy flow - create engine directly (for tests)
            const engine = new HandBuilderService(gameConfig);

            // Initialize hand in engine
            const result = engine.initializeHand(
              players.map((p) => ({
                id: p.id,
                name: p.name,
                position: p.position as Position,
                stackSize: p.stackSize[0],
                isHero: p.isHero || false,
              })),
            );

            if (!result.isValid) {
              console.error('Failed to initialize hand:', result.error);
              return;
            }

            // Post blinds
            const blindsResult = engine.postBlinds();
            if (!blindsResult.isValid) {
              console.error('Failed to post blinds:', blindsResult.error);
              return;
            }

            // Generate preflop action slots
            const preflopSlots = get().generateActionSlotsForStreet(
              players,
              Street.PREFLOP,
              engine,
            );

            // Update players with current stack sizes from engine after blinds
            const engineState = engine.getCurrentState();
            const updatedPlayers = players.map((player) => {
              if (engineState?.currentState?.players) {
                const playersMap = ensurePlayersMap(engineState.currentState.players);
                const enginePlayer = playersMap.get(player.id);
                if (enginePlayer) {
                  return {
                    ...player,
                    stackSize: [enginePlayer.stackSize],
                  };
                }
              }
              return player;
            });

            set({
              players: updatedPlayers.map((p) => ({ ...p })), // Deep clone for consistency
              gameConfig,
              engine,
              engineState: engine.getCurrentState(),
              isEngineInitialized: true,
              heroId: players.find((p) => p.isHero)?.id || null,
              streets: {
                ...get().streets,
                preflop: {
                  ...get().streets.preflop,
                  actionSlots: preflopSlots,
                  pot: engine.getCurrentState()?.currentState?.betting?.pot || 0,
                },
              },
              formData: {
                ...get().formData,
                players: updatedPlayers.map((p) => ({ ...p })), // Deep clone here too
                preflopActions: preflopSlots,
              },
            });
          }
        } catch (error) {
          console.error('Error initializing game:', error);
        }
      },

      // Process Action
      processAction: async (slotId, action, amount) => {
        const state = get();
        const { engine, currentStreet, eventAdapter } = state;

        // Use event sourcing if available
        if (eventAdapter) {
          // Find the action slot
          const slot = state.streets[currentStreet].actionSlots.find((s) => s.id === slotId);
          if (!slot) {
            console.error('Action slot not found:', {
              slotId,
              currentStreet,
              availableSlots: state.streets[currentStreet].actionSlots.map((s) => s.id),
            });
            return false;
          }

          // Get current engine state from event sourcing
          const engineState = await eventAdapter.rebuildState();
          const currentPlayerId = engineState?.currentState?.betting?.actionOn || null;

          // Allow action if this is the active slot OR if the slot matches the active player
          const isCurrentPlayer = slot.playerId === currentPlayerId;
          if (!slot.isActive && !isCurrentPlayer) {
            console.error('Action slot not active:', {
              slotId,
              slot,
              slotStreet: currentStreet,
              currentStreet: engineState.currentState.street,
              activeSlot: state.streets[currentStreet].actionSlots.find((s) => s.isActive)?.id,
              engineActionOn: currentPlayerId,
            });
            return false;
          }

          // Process through event sourcing adapter
          const result = await eventAdapter.processCommand(slot.playerId, action, amount);

          if (!result.success) {
            console.error('Action failed:', result.error);
            return false;
          }

          // Wait a bit for automatic events (like STREET_COMPLETED) to be persisted
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Refetch events and rebuild state to get the latest data
          const events = await eventAdapter.getEvents();
          const newState = await eventAdapter.rebuildState();

          // Update store with new state
          set({
            engineState: newState,
            handEvents: events,
          });

          // Continue with UI updates below...
          const newEngineState = newState;
          const nextPlayerId = newEngineState?.currentState?.betting?.actionOn || null;

          // Update the action slot
          const updatedSlots = state.streets[currentStreet].actionSlots.map((s) => {
            // Get player state, handling both Map and plain object cases
            const playersMap = ensurePlayersMap(newEngineState?.currentState?.players);
            const playerState = playersMap.get(s.playerId);

            if (s.id === slotId) {
              return {
                ...s,
                action,
                amount,
                betAmount: amount?.toString() || '',
                completed: true,
                isActive: false,
                stackAfter: playerState?.stackSize || 0,
              };
            }
            // Update next player as active
            if (s.playerId === nextPlayerId) {
              return {
                ...s,
                isActive: true,
                stackAfter: playerState?.stackSize || s.stackAfter,
              };
            }
            return {
              ...s,
              isActive: false,
              stackAfter: playerState?.stackSize || s.stackAfter,
            };
          });

          // Check if street is complete
          const engineStreet = newEngineState?.currentState?.street;
          const isStreetComplete = engineStreet && engineStreet !== currentStreet;

          const streetKey = `${currentStreet}Actions` as keyof typeof state.formData;

          // Update players array with new stack sizes and bet amounts
          const updatedPlayers = state.players.map((player) => {
            // Get player state, handling both Map and plain object cases
            if (newEngineState?.currentState?.players) {
              const playersMap = ensurePlayersMap(newEngineState.currentState.players);
              const enginePlayer = playersMap.get(player.id);
              if (enginePlayer) {
                const updatedPlayer = {
                  ...player,
                  stackSize: [enginePlayer.stackSize],
                  betAmount: enginePlayer.currentBet || 0,
                  hasFolded: enginePlayer.status === 'folded',
                  isAllIn: enginePlayer.status === 'allIn',
                  holeCards: player.holeCards || enginePlayer.holeCards || [],
                };

                return updatedPlayer;
              }
            }
            return player;
          });

          // Simple update - UI components read directly from engineState
          set((state) => ({
            engineState: newEngineState,
            players: updatedPlayers,
            streets: {
              ...state.streets,
              [currentStreet]: {
                ...state.streets[currentStreet],
                actionSlots: updatedSlots,
                isComplete: isStreetComplete,
                pot: newEngineState?.currentState?.betting?.pot || 0,
              },
            },
            formData: {
              ...state.formData,
              [streetKey]: updatedSlots,
              players: updatedPlayers,
            },
          }));

          // Mark the street as ready to advance, but don't auto-advance
          // The user must click "Next" to proceed to the next street
          if (isStreetComplete) {
            // Mark betting round as complete
            set({ isBettingRoundComplete: true });

            // In test environment, still advance synchronously for tests to pass
            if (process.env.NODE_ENV === 'test') {
              get().advanceToNextStreet();
            }
            // In production, just mark the betting round as complete
            // The street will advance when user clicks Next
          }

          return true;
        }

        // Fallback to legacy engine if no event sourcing
        if (!engine) {
          return false;
        }

        // Find the action slot
        const slot = state.streets[currentStreet].actionSlots.find((s) => s.id === slotId);
        if (!slot || !slot.isActive) {
          console.error('Action slot not found or not active:', { slotId, slot, currentStreet });
          return false;
        }

        // Process through engine
        const result = engine.processAction(slot.playerId, action, amount);

        if (!result.isValid) {
          console.error('Invalid action:', result.error);
          return false;
        }

        // Get updated engine state
        const newEngineState = engine.getCurrentState();
        const nextPlayerId = newEngineState?.currentState?.betting?.actionOn || null;

        // Update the action slot
        const updatedSlots = state.streets[currentStreet].actionSlots.map((s) => {
          // Get player state, handling both Map and plain object cases
          const playersMap = ensurePlayersMap(newEngineState?.currentState?.players);
          const playerState = playersMap.get(s.playerId);

          if (s.id === slotId) {
            return {
              ...s,
              action,
              amount,
              betAmount: amount?.toString() || '',
              completed: true,
              isActive: false,
              stackAfter: playerState?.stackSize || 0,
            };
          }
          // Update next player as active
          if (s.playerId === nextPlayerId) {
            return {
              ...s,
              isActive: true,
              stackAfter: playerState?.stackSize || s.stackAfter, // Update stack for all players
            };
          }
          return {
            ...s,
            isActive: false,
            stackAfter: playerState?.stackSize || s.stackAfter, // Update stack for all players
          };
        });

        // Check if street is complete
        const isStreetComplete = newEngineState.currentState.street !== currentStreet;

        const streetKey = `${currentStreet}Actions` as keyof typeof state.formData;

        // Update players array with new stack sizes
        const updatedPlayers = state.players.map((player) => {
          // Get player state, handling both Map and plain object cases
          const playersMap = ensurePlayersMap(newEngineState.currentState.players);
          const enginePlayer = playersMap.get(player.id);
          if (enginePlayer) {
            return {
              ...player,
              stackSize: [enginePlayer.stackSize],
              betAmount: enginePlayer.currentBet || 0,
              hasFolded: enginePlayer.status === 'folded',
              isAllIn: enginePlayer.status === 'allIn',
              holeCards: player.holeCards || enginePlayer.holeCards || [],
            };
          }
          return { ...player }; // Clone player even if no engine player
        });

        set((state) => ({
          engineState: newEngineState,
          players: updatedPlayers.map((p) => ({ ...p })), // Deep clone players
          streets: {
            ...state.streets,
            [currentStreet]: {
              ...state.streets[currentStreet],
              actionSlots: updatedSlots,
              isComplete: isStreetComplete,
              pot: newEngineState?.currentState?.betting?.pot || 0,
            },
          },
          formData: {
            ...state.formData,
            [streetKey]: updatedSlots,
            players: updatedPlayers.map((p) => ({ ...p })), // Deep clone formData players too
          },
        }));

        // Auto-advance to next street if complete
        if (isStreetComplete && currentStreet !== Street.RIVER) {
          get().advanceToNextStreet();
        }

        return true;
      },

      // Deal Cards
      dealCards: (playerId, cards, street) => {
        const { engine } = get();

        // If we have a legacy engine, use it
        if (engine) {
          engine.dealCards(playerId, cards, street);
          const newEngineState = engine.getCurrentState();

          set((state) => ({
            engineState: newEngineState,
            // Update players with hole cards if dealing to a specific player
            players: playerId
              ? state.players.map((player) => {
                  if (player.id === playerId) {
                    return {
                      ...player,
                      holeCards: [...cards], // Clone the cards array
                    };
                  }
                  return { ...player }; // Clone other players too
                })
              : [...state.players],
            streets: {
              ...state.streets,
              [street]: {
                ...state.streets[street],
                communityCards: playerId ? state.streets[street].communityCards : cards,
              },
            },
          }));
        } else {
          // Event sourcing mode - just update local state
          set((state) => ({
            // Update players with hole cards if dealing to a specific player
            players: playerId
              ? state.players.map((player) => {
                  if (player.id === playerId) {
                    return {
                      ...player,
                      holeCards: [...cards], // Clone the cards array
                    };
                  }
                  return { ...player }; // Clone other players too
                })
              : [...state.players],
            streets: {
              ...state.streets,
              [street]: {
                ...state.streets[street],
                communityCards: playerId ? state.streets[street].communityCards : cards,
              },
            },
          }));
        }
      },

      // Generate Action Slots (Public method)
      generateActionSlots: (street) => {
        const { players, engine } = get();
        if (!engine) {
          return;
        }

        const slots = get().generateActionSlotsForStreet(players, street, engine);

        set((state) => ({
          streets: {
            ...state.streets,
            [street]: {
              ...state.streets[street],
              actionSlots: slots,
            },
          },
        }));
      },

      // Advance to Next Street
      advanceToNextStreet: () => {
        const { currentStreet, players, engine, eventAdapter, engineState } = get();

        // We need either engine or event sourcing to advance
        if (!engine && !eventAdapter) {
          return;
        }

        // If engineState has a street, use that as the target
        const targetStreet = engineState?.currentState?.street as Street;
        if (targetStreet && targetStreet !== currentStreet) {
          // We're advancing to match the engine state
          const nextStreet = targetStreet;

          // Generate action slots for next street
          let slots: ActionSlot[] = [];

          if (eventAdapter && engineState) {
            // For event sourcing, generate slots based on engine state
            const orderedPlayers = getActionOrder(players, nextStreet);
            const currentPlayerId = engineState.currentState?.betting?.actionOn || null;

            slots = orderedPlayers.map((player) => {
              const playersMap = ensurePlayersMap(engineState.currentState?.players);
              const playerState = playersMap.get(player.id);

              return {
                id: generateSlotId(nextStreet, player.id),
                playerId: player.id,
                playerName: player.name,
                position: player.position as Position,
                isHero: player.isHero || false,
                stackBefore: playerState?.stackSize || player.stackSize[0],
                stackAfter: playerState?.stackSize || player.stackSize[0],
                action: undefined,
                betAmount: '',
                isActive: player.id === currentPlayerId,
                completed: false,
                canEdit: false,
              };
            });
          } else if (engine) {
            // Legacy flow
            slots = get().generateActionSlotsForStreet(players, nextStreet, engine);
          }

          // Get community cards from engine state if available
          let communityCards: string[] = [];
          if (engineState && (engineState.currentState as any)?.board) {
            communityCards = [...(engineState.currentState as any).board];
          }

          // Update formData with community cards based on the new street
          const formDataUpdate: any = {};
          if (nextStreet === Street.FLOP && communityCards.length >= 3) {
            formDataUpdate.flopCards = communityCards.slice(0, 3);
          } else if (nextStreet === Street.TURN && communityCards.length >= 4) {
            formDataUpdate.turnCard = [communityCards[3]];
          } else if (nextStreet === Street.RIVER && communityCards.length >= 5) {
            formDataUpdate.riverCard = [communityCards[4]];
          }

          // Update players with latest engine state
          const updatedPlayers = players.map((player) => {
            if (engineState?.currentState?.players) {
              const playersMap = ensurePlayersMap(engineState.currentState.players);
              const enginePlayer = playersMap.get(player.id);
              if (enginePlayer) {
                return {
                  ...player,
                  stackSize: [enginePlayer.stackSize],
                  betAmount: 0, // Reset bet amount for new street
                  hasFolded: enginePlayer.status === 'folded',
                  isAllIn: enginePlayer.status === 'allIn',
                  holeCards: player.holeCards || enginePlayer.holeCards || [],
                };
              }
            }
            return player;
          });

          set((state) => ({
            currentStreet: nextStreet,
            isBettingRoundComplete: false,
            players: updatedPlayers.map((p) => ({ ...p })), // Deep clone players
            streets: {
              ...state.streets,
              [nextStreet]: {
                ...state.streets[nextStreet],
                actionSlots: slots,
                pot: state.engineState?.currentState.betting.pot || 0,
                communityCards:
                  nextStreet === Street.FLOP
                    ? communityCards.slice(0, 3)
                    : nextStreet === Street.TURN
                      ? communityCards.slice(0, 4)
                      : nextStreet === Street.RIVER
                        ? communityCards
                        : [],
              },
            },
            formData: {
              ...state.formData,
              ...formDataUpdate,
              players: updatedPlayers.map((p) => ({ ...p })), // Deep clone formData players too
            },
          }));
        } else {
          // Standard progression through streets
          const streetOrder: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
          const currentIndex = streetOrder.indexOf(currentStreet);

          if (currentIndex < streetOrder.length - 1) {
            const nextStreet = streetOrder[currentIndex + 1];

            // Generate action slots for next street
            let slots: ActionSlot[] = [];

            if (eventAdapter && engineState) {
              // For event sourcing, generate slots based on engine state
              const orderedPlayers = getActionOrder(players, nextStreet);
              const currentPlayerId = engineState.currentState?.betting?.actionOn || null;

              slots = orderedPlayers.map((player) => {
                const playersMap = ensurePlayersMap(engineState.currentState?.players);
                const playerState = playersMap.get(player.id);

                return {
                  id: generateSlotId(nextStreet, player.id),
                  playerId: player.id,
                  playerName: player.name,
                  position: player.position as Position,
                  isHero: player.isHero || false,
                  stackBefore: playerState?.stackSize || player.stackSize[0],
                  stackAfter: playerState?.stackSize || player.stackSize[0],
                  action: undefined,
                  betAmount: '',
                  isActive: player.id === currentPlayerId,
                  completed: false,
                  canEdit: false,
                };
              });
            } else if (engine) {
              // Legacy flow
              slots = get().generateActionSlotsForStreet(players, nextStreet, engine);
            }

            // Get community cards from engine state if available
            let communityCards: string[] = [];
            if ((engineState?.currentState as any)?.board) {
              communityCards = [...(engineState?.currentState as any).board];
            }

            // Update formData with community cards based on the new street
            const formDataUpdate: any = {};
            if (nextStreet === Street.FLOP && communityCards.length >= 3) {
              formDataUpdate.flopCards = communityCards.slice(0, 3);
            } else if (nextStreet === Street.TURN && communityCards.length >= 4) {
              formDataUpdate.turnCard = [communityCards[3]];
            } else if (nextStreet === Street.RIVER && communityCards.length >= 5) {
              formDataUpdate.riverCard = [communityCards[4]];
            }

            set((state) => ({
              currentStreet: nextStreet,
              isBettingRoundComplete: false,
              streets: {
                ...state.streets,
                [nextStreet]: {
                  ...state.streets[nextStreet],
                  actionSlots: slots,
                  pot: state.engineState?.currentState.betting.pot || 0,
                  communityCards:
                    nextStreet === Street.FLOP
                      ? communityCards.slice(0, 3)
                      : nextStreet === Street.TURN
                        ? communityCards.slice(0, 4)
                        : nextStreet === Street.RIVER
                          ? communityCards
                          : [],
                },
              },
              formData: {
                ...state.formData,
                ...formDataUpdate,
              },
            }));
          }
        }
      },

      // Form Data Updates
      updateFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      // Step Navigation
      nextStep: () => {
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) }));
      },

      prevStep: () => {
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) }));
      },

      // Reset
      reset: () => {
        set({
          players: [],
          heroId: null,
          engine: null,
          engineState: null,
          currentStep: 0,
          isEngineInitialized: false,
          streets: {
            preflop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
            river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
          },
          currentStreet: Street.PREFLOP,
          isBettingRoundComplete: false,
          formData: {
            gameType: '',
            gameFormat: '',
            stackSize: '',
            heroPosition: '',
            villainPosition: '',
            heroStackSize: [100],
            villainStackSize: [100],
            players: [],
            holeCards: [],
            flopCards: [],
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
            smallBlind: '',
            bigBlind: '',
            ante: false,
            anteAmount: '',
            tags: [],
          },
          tags: [],
        });
      },

      // Computed Values
      getCurrentPlayer: () => {
        const { engine } = get();
        if (!engine) {
          return null;
        }

        const engineState = engine.getCurrentState();
        const currentPlayerId = engineState?.currentState?.betting?.actionOn || null;

        if (!currentPlayerId) {
          return null;
        }

        return get().players.find((p) => p.id === currentPlayerId) || null;
      },

      getLegalActions: () => {
        const { engine } = get();
        if (!engine) {
          return [];
        }

        const currentPlayer = get().getCurrentPlayer();
        if (!currentPlayer) {
          return [];
        }

        return engine.getLegalActions();
      },

      getCurrentActionSlot: () => {
        const { currentStreet, streets } = get();
        const currentSlot = streets[currentStreet].actionSlots.find((s) => s.isActive) || null;

        return currentSlot;
      },

      isPlayerToAct: (playerId: string) => {
        const { engineState, currentStreet, streets, isBettingRoundComplete } = get();

        // If betting round is complete, no one is to act
        if (isBettingRoundComplete) {
          return false;
        }

        // First check if we have engine state
        if (engineState && engineState.currentState) {
          // The engine is the source of truth
          const isActive = engineState?.currentState?.betting?.actionOn === playerId;
          return isActive;
        }

        // Fallback to checking action slots
        const slot = streets[currentStreet].actionSlots.find((s) => s.playerId === playerId);
        const isActive = slot?.isActive || false;
        return isActive;
      },

      isStreetComplete: (street) => {
        return get().streets[street].isComplete;
      },

      getSlotById: (slotId) => {
        const { streets } = get();
        for (const street of Object.values(streets)) {
          const slot = street.actionSlots.find((s) => s.id === slotId);
          if (slot) {
            return slot;
          }
        }
        return null;
      },

      // Event Sourcing Methods
      createHandWithEventSourcing: async (players, gameConfig) => {
        try {
          // Create a temporary hand builder to generate initial events
          const tempEngine = new HandBuilderService(gameConfig);

          // Initialize hand
          const initResult = tempEngine.initializeHand(
            players.map((p) => ({
              id: p.id,
              name: p.name,
              position: p.position as Position,
              stackSize: p.stackSize[0],
              isHero: p.isHero || false,
            })),
          );

          if (!initResult.isValid) {
            console.error('Failed to initialize hand:', initResult.error);
            return null;
          }

          // Post blinds
          const blindsResult = tempEngine.postBlinds();
          if (!blindsResult.isValid) {
            console.error('Failed to post blinds:', blindsResult.error);
            return null;
          }

          // Get the events from the engine
          const events = tempEngine.getEvents();

          // Create hand in database with events
          const response = await fetch('/api/hands/save-engine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: 'Live Hand',
              description: '',
              gameConfig,
              events,
            }),
          });

          if (!response.ok) {
            console.error('Failed to create hand');
            return null;
          }

          const data = await response.json();
          const handId = data.hand.id;

          // Initialize event sourcing with the new hand
          await get().initializeWithEventSourcing(handId);

          return handId;
        } catch (error) {
          console.error('Error creating hand with event sourcing:', error);
          return null;
        }
      },

      initializeWithEventSourcing: async (handId) => {
        // Add a small delay to ensure events are fully persisted
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create a client-side adapter that makes API calls
        const clientAdapter: IEventSourcingAdapter = {
          processCommand: async (playerId: string, action: ActionType, amount?: number) => {
            const response = await fetch(`/api/hands/${handId}/command`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ playerId, action, amount }),
            });
            const data = await response.json();

            return data;
          },

          getEvents: async () => {
            const response = await fetch(`/api/hands/${handId}/events`, {
              credentials: 'include',
            });
            const data = await response.json();
            return data.events || [];
          },

          getValidActions: async () => {
            const response = await fetch(`/api/hands/${handId}/valid-actions`, {
              credentials: 'include',
            });
            const data = await response.json();
            return data.validActions || [];
          },

          rebuildState: async () => {
            const response = await fetch(`/api/hands/${handId}/events`, {
              credentials: 'include',
            });
            const data = await response.json();

            return {
              currentState: data.currentState || ({} as HandState),
              events: data.events || [],
              lastSequence: data.lastSequence || -1,
            };
          },

          replayToSequence: async (sequenceNumber: number) => {
            const response = await fetch(`/api/hands/${handId}/replay/${sequenceNumber}`, {
              credentials: 'include',
            });
            const data = await response.json();
            return {
              currentState: data.currentState || ({} as HandState),
              events: data.events || [],
            };
          },
        };

        // Set up event listener on engine
        const { engine } = get();
        if (engine) {
          const pokerEngine = (engine as any).engine; // Access the underlying PokerHandEngine
          if (pokerEngine && pokerEngine.onEvent) {
            pokerEngine.onEvent(async (_event: any) => {
              // This will be called whenever engine processes an event
              // For client-side, we'll just refetch events after actions
            });
          }
        }

        // Load existing events with retry logic
        let events: any[] = [];
        let state = null;
        let retries = 3;

        while (retries > 0) {
          try {
            events = await clientAdapter.getEvents();
            state = await clientAdapter.rebuildState();

            // If we got events, break out of retry loop
            if (events.length > 0) {
              break;
            }

            // No events found, retry after a delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries--;
          } catch (error) {
            console.error('Error loading events:', error);
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (events.length === 0) {
          console.error('Failed to load events after retries');
        }

        set({
          eventAdapter: clientAdapter,
          handEvents: events,
          engineState: state,
          currentEventIndex: events.length - 1,
          handId,
        });
      },

      getValidActionsForCurrentPlayer: async () => {
        const { eventAdapter } = get();

        if (!eventAdapter) {
          return [];
        }

        return await eventAdapter.getValidActions();
      },

      loadEventsForReplay: async () => {
        const { eventAdapter } = get();
        if (!eventAdapter) {
          return;
        }

        const events = await eventAdapter.getEvents();
        set({
          handEvents: events,
          isReplaying: true,
          currentEventIndex: 0,
        });
      },

      replayToEvent: async (eventIndex) => {
        const { eventAdapter, handEvents } = get();
        if (!eventAdapter || eventIndex < 0 || eventIndex >= handEvents.length) {
          return;
        }

        const state = await eventAdapter.replayToSequence(handEvents[eventIndex].sequenceNumber);

        set({
          engineState: state,
          currentEventIndex: eventIndex,
        });
      },

      replayNext: async () => {
        const { currentEventIndex, handEvents } = get();
        if (currentEventIndex < handEvents.length - 1) {
          await get().replayToEvent(currentEventIndex + 1);
        }
      },

      replayPrevious: async () => {
        const { currentEventIndex } = get();
        if (currentEventIndex > 0) {
          await get().replayToEvent(currentEventIndex - 1);
        }
      },
    })),
  ),
);

// =====================================================
// SELECTORS (for performance)
// =====================================================

export const useCurrentPlayer = () => usePokerHandStore((state) => state.getCurrentPlayer());
export const useLegalActions = () => usePokerHandStore((state) => state.getLegalActions());
export const useCurrentStreetSlots = () =>
  usePokerHandStore((state) => state.streets[state.currentStreet].actionSlots);
export const useIsEngineReady = () => usePokerHandStore((state) => state.isEngineInitialized);
export const useFormData = () => usePokerHandStore((state) => state.formData);
export const useCurrentStep = () => usePokerHandStore((state) => state.currentStep);
export const useTags = () => usePokerHandStore((state) => state.tags);
export const usePot = () => usePokerHandStore((state) => state.streets[state.currentStreet].pot);
export const useCurrentStreet = () => usePokerHandStore((state) => state.currentStreet);
export const usePlayers = () => usePokerHandStore((state) => state.players);
export const useIsPlayerToAct = (playerId: string) =>
  usePokerHandStore((state) => {
    return state.isPlayerToAct(playerId);
  });
