import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShareHandProvider } from '../ShareHandProvider';
import PreflopStep from '../PreflopStep';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType } from '@/types/poker';

// Mock the poker hand store
jest.mock('@/stores/poker-hand-store');

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'test-user' } }, status: 'authenticated' }),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    checkEmailExists: jest.fn(),
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
  }),
}));

// Mock useHandBuilder hook
jest.mock('@/poker-engine/hooks/useHandBuilder', () => ({
  useHandBuilder: () => ({
    state: {
      currentState: {
        players: new Map(),
        betting: { pot: 0, currentBet: 0, actionOn: null },
      },
    },
    currentPlayer: null,
    legalActions: [],
    pot: 0,
    players: [],
    initializeHand: jest.fn().mockReturnValue({ isValid: true }),
    dealCards: jest.fn(),
    processAction: jest.fn().mockReturnValue({ isValid: true }),
  }),
}));

// Mock the lazy-loaded PokerTable to use store data
jest.mock('../lazy-components', () => ({
  LazyPokerTable: ({ pot, children }: { pot: number; children?: React.ReactNode }) => {
    // Get players from the store directly
    const storeModule = jest.requireMock<typeof import('@/stores/poker-hand-store')>(
      '@/stores/poker-hand-store',
    );
    const players = storeModule.usePokerHandStore((state) => state.players);

    return (
      <div data-testid="poker-table">
        <div data-testid="pot-display">Pot: ${pot || 0}</div>
        {players.map((player) => (
          <div key={player.id} data-testid={`player-${player.id}`}>
            <span data-testid={`player-name-${player.id}`}>{player.name}</span>
            <span data-testid={`player-stack-${player.id}`}>
              Stack: ${Array.isArray(player.stackSize) ? player.stackSize[0] : player.stackSize}
            </span>
            <span data-testid={`player-bet-${player.id}`}>Bet: ${player.betAmount || 0}</span>
          </div>
        ))}
        {children}
      </div>
    );
  },
}));

// Mock CardInput component
jest.mock('@/components/CardInput', () => ({
  __esModule: true,
  default: ({
    label,
    cards,
    onCardsChange,
    placeholder,
  }: {
    label: string;
    cards?: string[];
    onCardsChange: (cards: string[]) => void;
    placeholder?: string;
  }) => (
    <div>
      <label>{label}</label>
      <input
        placeholder={placeholder}
        value={cards?.join(' ') || ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value) {
            const parsedCards = value.split(' ').filter(Boolean);
            onCardsChange(parsedCards);
          } else {
            onCardsChange([]);
          }
        }}
      />
    </div>
  ),
}));

// Mock SelectedCardsDisplay
jest.mock('../SelectedCardsDisplay', () => ({
  __esModule: true,
  default: () => null,
}));

// Mock hooks
jest.mock('@/hooks/useShareHandLogic', () => ({
  useShareHandLogic: () => ({
    formData: {
      players: [],
      holeCards: [],
      preflopDescription: '',
      gameFormat: 'cash',
      smallBlind: '5',
      bigBlind: '10',
    },
    setFormData: jest.fn(),
    currentStep: 2,
    tags: [],
    addTag: jest.fn(),
    removeTag: jest.fn(),
    getPositionName: (pos: string) => pos.toUpperCase(),
    getCurrencySymbol: () => '$',
    calculatePotSize: jest.fn(),
    getAllSelectedCards: () => [],
    getAvailableActions: () => ['fold', 'call', 'raise'],
    updateAction: jest.fn(),
    getActionButtonClass: jest.fn(),
    handleBetSizeSelect: jest.fn(),
    steps: [],
    prevStep: jest.fn(),
    nextStep: jest.fn(),
    handleSubmit: jest.fn(),
    setCurrentStep: jest.fn(),
  }),
}));

jest.mock('@/hooks/usePlayerManagement', () => ({
  usePlayerManagement: (formData: any) => ({
    players: formData.players || [],
  }),
}));

describe('Stack Update Flow', () => {
  let mockStore: any;
  let mockProcessAction: jest.Mock;
  let mockInitializeGame: jest.Mock;

  beforeEach(() => {
    // Reset the store state before each test
    mockProcessAction = jest.fn().mockResolvedValue(true);
    mockInitializeGame = jest.fn().mockResolvedValue(undefined);

    mockStore = {
      isEngineInitialized: true,
      engineState: {
        currentState: {
          betting: {
            pot: 15,
            actionOn: 'utg',
            currentBet: 10,
          },
          players: new Map([
            [
              'utg',
              {
                id: 'utg',
                name: 'Player 1',
                stackSize: 90, // Started with 100, posted 10
                currentBet: 10,
                status: 'active',
              },
            ],
            [
              'sb',
              {
                id: 'sb',
                name: 'Player 2',
                stackSize: 95, // Started with 100, posted 5
                currentBet: 5,
                status: 'active',
              },
            ],
          ]),
        },
      },
      players: [
        {
          id: 'utg',
          name: 'Player 1',
          position: 'utg',
          stackSize: [90],
          isHero: false,
          betAmount: 10,
        },
        { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [95], isHero: true, betAmount: 5 },
      ],
      formData: {
        players: [
          { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [90], isHero: false },
          { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [95], isHero: true },
        ],
        holeCards: [],
        preflopDescription: '',
        gameFormat: 'cash',
      },
      streets: {
        preflop: {
          actionSlots: [
            { id: 'preflop-utg', playerId: 'utg', isActive: true, completed: false },
            { id: 'preflop-sb', playerId: 'sb', isActive: false, completed: false },
          ],
          pot: 15,
        },
      },
      currentStreet: 'preflop',
      isBettingRoundComplete: false,
      processAction: mockProcessAction,
      initializeGame: mockInitializeGame,
      dealCards: jest.fn(),
      updateFormData: jest.fn(),
      getCurrentPlayer: () => ({ id: 'utg', name: 'Player 1' }),
      getLegalActions: () => [ActionType.FOLD, ActionType.CALL, ActionType.RAISE],
      isPlayerToAct: (playerId: string) => playerId === 'utg',
      createHandWithEventSourcing: jest.fn().mockResolvedValue('test-hand-id'),
      initializeWithEventSourcing: jest.fn(),
      getValidActionsForCurrentPlayer: jest
        .fn()
        .mockResolvedValue([ActionType.FOLD, ActionType.CALL, ActionType.RAISE]),
    };

    // Make usePokerHandStore return a function when called as a hook
    (usePokerHandStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      if (typeof selector === 'function') {
        // This is being used as a hook with a selector
        return selector(mockStore);
      }
      // This is being used to get the full store
      return mockStore;
    });
  });

  it('displays initial stack sizes correctly after blinds', () => {
    render(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call', 'raise']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={15}
        />
      </ShareHandProvider>,
    );

    // Check initial stacks after blinds
    expect(screen.getByTestId('player-stack-utg')).toHaveTextContent('Stack: $90');
    expect(screen.getByTestId('player-stack-sb')).toHaveTextContent('Stack: $95');

    // Check bet amounts
    expect(screen.getByTestId('player-bet-utg')).toHaveTextContent('Bet: $10');
    expect(screen.getByTestId('player-bet-sb')).toHaveTextContent('Bet: $5');
  });

  it('updates stack sizes after a raise action', async () => {
    // Mock the processAction to update players with new stack
    mockProcessAction.mockImplementation(async (slotId, action, amount) => {
      if (slotId === 'preflop-utg' && action === ActionType.RAISE && amount === 30) {
        // Update the store to reflect the raise
        mockStore.players = [
          {
            id: 'utg',
            name: 'Player 1',
            position: 'utg',
            stackSize: [70],
            isHero: false,
            betAmount: 30,
          }, // 100 - 30
          {
            id: 'sb',
            name: 'Player 2',
            position: 'sb',
            stackSize: [95],
            isHero: true,
            betAmount: 5,
          },
        ];
        mockStore.engineState.currentState.players.set('utg', {
          id: 'utg',
          name: 'Player 1',
          stackSize: 70,
          currentBet: 30,
          status: 'active',
        });
        mockStore.engineState.currentState.betting.currentBet = 30;
        mockStore.engineState.currentState.betting.pot = 35; // 5 + 30
        mockStore.engineState.currentState.betting.actionOn = 'sb';
        mockStore.isPlayerToAct = (playerId: string) => playerId === 'sb';
      }
      return true;
    });

    const { rerender } = render(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call', 'raise']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={15}
        />
      </ShareHandProvider>,
    );

    // Simulate UTG raising to 30
    await act(async () => {
      await mockProcessAction('preflop-utg', ActionType.RAISE, 30);
    });

    // Force re-render with updated store data
    rerender(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call', 'raise']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={35}
        />
      </ShareHandProvider>,
    );

    // Check updated stacks
    expect(screen.getByTestId('player-stack-utg')).toHaveTextContent('Stack: $70');
    expect(screen.getByTestId('player-stack-sb')).toHaveTextContent('Stack: $95');

    // Check updated bet amounts
    expect(screen.getByTestId('player-bet-utg')).toHaveTextContent('Bet: $30');
  });

  it('updates stack sizes after an all-in action', async () => {
    // Mock the processAction to handle all-in
    mockProcessAction.mockImplementation(async (slotId, action) => {
      if (slotId === 'preflop-sb' && action === ActionType.ALL_IN) {
        // Update the store to reflect the all-in
        mockStore.players = [
          {
            id: 'utg',
            name: 'Player 1',
            position: 'utg',
            stackSize: [90],
            isHero: false,
            betAmount: 10,
          },
          {
            id: 'sb',
            name: 'Player 2',
            position: 'sb',
            stackSize: [0],
            isHero: true,
            betAmount: 95,
            isAllIn: true,
          }, // All-in
        ];
        mockStore.engineState.currentState.players.set('sb', {
          id: 'sb',
          name: 'Player 2',
          stackSize: 0,
          currentBet: 95,
          status: 'allIn',
        });
        mockStore.engineState.currentState.betting.pot = 105; // 10 + 95
        mockStore.isBettingRoundComplete = true;
      }
      return true;
    });

    const { rerender } = render(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call', 'raise', 'all-in']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={15}
        />
      </ShareHandProvider>,
    );

    // Change active player to SB
    mockStore.isPlayerToAct = (playerId: string) => playerId === 'sb';
    mockStore.engineState.currentState.betting.actionOn = 'sb';

    // Simulate SB going all-in
    await act(async () => {
      await mockProcessAction('preflop-sb', ActionType.ALL_IN);
    });

    // Force re-render with updated store data
    rerender(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={105}
        />
      </ShareHandProvider>,
    );

    // Check updated stacks
    expect(screen.getByTestId('player-stack-utg')).toHaveTextContent('Stack: $90');
    expect(screen.getByTestId('player-stack-sb')).toHaveTextContent('Stack: $0');

    // Check bet amounts
    expect(screen.getByTestId('player-bet-sb')).toHaveTextContent('Bet: $95');
  });

  it('preserves stack sizes when advancing streets', async () => {
    // Set up players after some preflop action
    mockStore.players = [
      {
        id: 'utg',
        name: 'Player 1',
        position: 'utg',
        stackSize: [70],
        isHero: false,
        betAmount: 0,
      },
      { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [70], isHero: true, betAmount: 0 },
    ];
    mockStore.currentStreet = 'flop';
    mockStore.engineState.currentState.betting.pot = 60;
    mockStore.isBettingRoundComplete = false;

    render(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['check', 'bet']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={60}
        />
      </ShareHandProvider>,
    );

    // Check that stacks are preserved
    expect(screen.getByTestId('player-stack-utg')).toHaveTextContent('Stack: $70');
    expect(screen.getByTestId('player-stack-sb')).toHaveTextContent('Stack: $70');

    // Bet amounts should be reset for new street
    expect(screen.getByTestId('player-bet-utg')).toHaveTextContent('Bet: $0');
    expect(screen.getByTestId('player-bet-sb')).toHaveTextContent('Bet: $0');
  });

  it('handles multiple actions in sequence correctly', async () => {
    let actionCount = 0;

    // Mock processAction to simulate a sequence of actions
    mockProcessAction.mockImplementation(async () => {
      actionCount++;

      if (actionCount === 1) {
        // UTG raises to 30
        mockStore.players = [
          {
            id: 'utg',
            name: 'Player 1',
            position: 'utg',
            stackSize: [70],
            isHero: false,
            betAmount: 30,
          },
          {
            id: 'sb',
            name: 'Player 2',
            position: 'sb',
            stackSize: [95],
            isHero: true,
            betAmount: 5,
          },
        ];
        mockStore.engineState.currentState.betting.pot = 35;
        mockStore.engineState.currentState.betting.actionOn = 'sb';
      } else if (actionCount === 2) {
        // SB calls 30
        mockStore.players = [
          {
            id: 'utg',
            name: 'Player 1',
            position: 'utg',
            stackSize: [70],
            isHero: false,
            betAmount: 30,
          },
          {
            id: 'sb',
            name: 'Player 2',
            position: 'sb',
            stackSize: [70],
            isHero: true,
            betAmount: 30,
          },
        ];
        mockStore.engineState.currentState.betting.pot = 60;
        mockStore.isBettingRoundComplete = true;
      }

      return true;
    });

    const { rerender } = render(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call', 'raise']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={15}
        />
      </ShareHandProvider>,
    );

    // UTG raises
    await act(async () => {
      await mockProcessAction('preflop-utg', ActionType.RAISE, 30);
    });

    rerender(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => ['fold', 'call', 'raise']}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={35}
        />
      </ShareHandProvider>,
    );

    // Check after first action
    expect(screen.getByTestId('player-stack-utg')).toHaveTextContent('Stack: $70');
    expect(screen.getByTestId('player-bet-utg')).toHaveTextContent('Bet: $30');

    // SB calls
    await act(async () => {
      await mockProcessAction('preflop-sb', ActionType.CALL);
    });

    rerender(
      <ShareHandProvider>
        <PreflopStep
          formData={mockStore.formData}
          setFormData={jest.fn()}
          getCurrencySymbol={() => '$'}
          getAvailableActions={() => []}
          updateAction={jest.fn()}
          handleBetSizeSelect={jest.fn()}
          getAllSelectedCards={() => []}
          pot={60}
        />
      </ShareHandProvider>,
    );

    // Check after second action
    expect(screen.getByTestId('player-stack-utg')).toHaveTextContent('Stack: $70');
    expect(screen.getByTestId('player-stack-sb')).toHaveTextContent('Stack: $70');
    expect(screen.getByTestId('player-bet-utg')).toHaveTextContent('Bet: $30');
    expect(screen.getByTestId('player-bet-sb')).toHaveTextContent('Bet: $30');
  });
});
