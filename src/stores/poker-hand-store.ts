// =====================================================
// ZUSTAND STORE FOR POKER HAND SHARING
// =====================================================

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { HandBuilderService } from '@/poker-engine/services/builder';
import { Position, ActionType, Street, GameType, GameFormat } from '@/types/poker';
import { GameConfig } from '@/poker-engine/core/state';
import { Player } from '@/types/shareHand';
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
  engineState: ReturnType<HandBuilderService['getCurrentState']> | null;

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
  initializeGame: (players: Player[], gameConfig: GameConfig) => void;
  processAction: (slotId: string, action: ActionType, amount?: number) => Promise<boolean>;
  dealCards: (playerId: string | null, cards: string[], street: Street) => void;
  generateActionSlots: (street: Street) => void;
  updateFormData: (data: Partial<PokerHandState['formData']>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // Computed
  getCurrentPlayer: () => Player | null;
  getLegalActions: () => ReturnType<HandBuilderService['getLegalActions']>;
  getCurrentActionSlot: () => ActionSlot | null;
  isStreetComplete: (street: Street) => boolean;

  // Internal helpers
  generateActionSlotsForStreet: (
    players: Player[],
    street: Street,
    engine: HandBuilderService,
  ) => ActionSlot[];
  advanceToNextStreet: () => void;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

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
      streets: {
        preflop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        flop: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        turn: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
        river: { communityCards: [], actionSlots: [], isComplete: false, pot: 0 },
      },
      currentStreet: Street.PREFLOP,
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
        const currentPlayerId = engineState.currentState.betting.actionOn;

        return orderedPlayers.map((player) => {
          const playerState = engineState.currentState.players.get(player.id);

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
      initializeGame: (players, gameConfig) => {
        try {
          // Create engine
          const engine = new HandBuilderService(gameConfig);

          // Debug: Log players data

          // Check if we have a button player
          const hasButton = players.some((p) => p.position === Position.BTN);
          if (!hasButton) {
            console.error('Button position required for hand initialization');
            return;
          }

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
          const preflopSlots = get().generateActionSlotsForStreet(players, Street.PREFLOP, engine);

          set({
            players,
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
                pot: engine.getCurrentState().currentState.betting.pot,
              },
            },
            formData: {
              ...get().formData,
              players,
              preflopActions: preflopSlots,
            },
          });
        } catch (error) {
          console.error('Error initializing game:', error);
        }
      },

      // Process Action
      processAction: async (slotId, action, amount) => {
        const state = get();
        const { engine, currentStreet } = state;
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
        const nextPlayerId = newEngineState.currentState.betting.actionOn;

        // Update the action slot
        const updatedSlots = state.streets[currentStreet].actionSlots.map((s) => {
          const playerState = newEngineState.currentState.players.get(s.playerId);

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
          const enginePlayer = newEngineState.currentState.players.get(player.id);
          if (enginePlayer) {
            return {
              ...player,
              stackSize: [enginePlayer.stackSize],
            };
          }
          return player;
        });

        set((state) => ({
          engineState: newEngineState,
          players: updatedPlayers,
          streets: {
            ...state.streets,
            [currentStreet]: {
              ...state.streets[currentStreet],
              actionSlots: updatedSlots,
              isComplete: isStreetComplete,
              pot: newEngineState.currentState.betting.pot,
            },
          },
          formData: {
            ...state.formData,
            [streetKey]: updatedSlots,
            players: updatedPlayers,
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
        if (!engine) {
          return;
        }

        engine.dealCards(playerId, cards, street);

        set((state) => ({
          engineState: engine.getCurrentState(),
          streets: {
            ...state.streets,
            [street]: {
              ...state.streets[street],
              communityCards: playerId ? state.streets[street].communityCards : cards,
            },
          },
        }));
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
        const { currentStreet, players, engine } = get();
        if (!engine) {
          return;
        }

        const streetOrder: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
        const currentIndex = streetOrder.indexOf(currentStreet);

        if (currentIndex < streetOrder.length - 1) {
          const nextStreet = streetOrder[currentIndex + 1];

          // Generate action slots for next street
          const slots = get().generateActionSlotsForStreet(players, nextStreet, engine);

          set((state) => ({
            currentStreet: nextStreet,
            streets: {
              ...state.streets,
              [nextStreet]: {
                ...state.streets[nextStreet],
                actionSlots: slots,
                pot: state.engineState?.currentState.betting.pot || 0,
              },
            },
          }));
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
        const currentPlayerId = engineState.currentState.betting.actionOn;

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
        return streets[currentStreet].actionSlots.find((s) => s.isActive) || null;
      },

      isStreetComplete: (street) => {
        return get().streets[street].isComplete;
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
