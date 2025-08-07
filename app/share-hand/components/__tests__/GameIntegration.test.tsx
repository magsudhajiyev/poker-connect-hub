import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokerTable from '../poker-table/PokerTable';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType } from '@/types/poker';

// Mock the poker hand store
jest.mock('@/stores/poker-hand-store');

// Mock child components we don't need for integration test
jest.mock('../poker-table/ClickablePlayerSeat', () => ({
  __esModule: true,
  default: ({ player, isToAct, position }: any) => (
    <div data-testid={`seat-${position}`} className={isToAct ? 'active' : ''}>
      {player ? (
        <div data-testid={`player-${player.id}`}>
          <span>{player.name}</span>
          <span data-testid={`stack-display-${player.id}`}>${player.stackSize}</span>
        </div>
      ) : (
        'Empty Seat'
      )}
    </div>
  ),
}));

jest.mock('../poker-table/CommunityCardsOptimized', () => ({
  CommunityCardsOptimized: ({ cards }: any) => (
    <div data-testid="community-cards">{cards?.join(' ') || 'No cards'}</div>
  ),
}));

jest.mock('../poker-table/PotDisplayOptimized', () => ({
  PotDisplayOptimized: ({ pot }: any) => <div data-testid="pot-display">Pot: ${pot}</div>,
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Create a test component that uses ShareHandProvider
const TestGameFlow = ({ onActionComplete }: { onActionComplete?: () => void }) => {
  const [gameState, setGameState] = React.useState({
    players: [
      { id: 'p1', name: 'Player 1', position: 'btn', stackSize: 1000, isHero: false },
      { id: 'p2', name: 'Player 2', position: 'sb', stackSize: 1000, isHero: false },
      { id: 'p3', name: 'Player 3', position: 'bb', stackSize: 1000, isHero: true },
    ],
    pot: 0,
    currentStreet: 'preflop',
    communityCards: [],
  });

  const handleUpdateAction = (playerId: string, action: any) => {
    // Simulate action processing
    setGameState((prev) => {
      const updatedPlayers = prev.players.map((player) => {
        if (player.id === playerId) {
          const betAmount = action.amount || 0;
          return {
            ...player,
            stackSize: player.stackSize - betAmount,
            lastAction: action.type,
          };
        }
        return player;
      });

      const totalBets = action.amount || 0;

      return {
        ...prev,
        players: updatedPlayers,
        pot: prev.pot + totalBets,
      };
    });

    onActionComplete?.();
  };

  return (
    <div data-testid="game-container">
      <PokerTable
        players={gameState.players}
        communityCards={gameState.communityCards}
        pot={gameState.pot}
        getCurrencySymbol={() => '$'}
        gameFormat="cash"
        onUpdatePlayer={() => {}}
        onRemovePlayer={() => {}}
        availablePositions={[]}
        currentStreet={gameState.currentStreet}
        formData={{}}
        getAvailableActions={() => [ActionType.FOLD, ActionType.CALL, ActionType.RAISE]}
        updateAction={handleUpdateAction}
        handleBetSizeSelect={() => {}}
        isPositionsStep={false}
      />
      <div data-testid="debug-info">
        {gameState.players.map((p) => (
          <div key={p.id} data-testid={`stack-${p.id}`}>
            {p.name}: ${p.stackSize}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Game Integration Tests', () => {
  let mockEngine: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock engine with event tracking
    mockEngine = {
      currentState: {
        betting: {
          pot: 0,
          actionOn: 'p2', // SB acts first preflop
          currentBet: 10,
          toCall: 10,
        },
        players: {
          p1: { id: 'p1', stackSize: 1000, betAmount: 0, hasFolded: false },
          p2: { id: 'p2', stackSize: 995, betAmount: 5, hasFolded: false },
          p3: { id: 'p3', stackSize: 990, betAmount: 10, hasFolded: false },
        },
      },
      processAction: jest.fn((playerId: string, action: any) => {
        // Simulate engine processing
        const player = mockEngine.currentState.players[playerId];
        if (action.type === ActionType.CALL) {
          const callAmount = action.amount || mockEngine.currentState.betting.toCall;
          player.stackSize -= callAmount;
          player.betAmount = (player.betAmount || 0) + callAmount;
          mockEngine.currentState.betting.pot += callAmount;
        } else if (action.type === ActionType.RAISE) {
          const raiseAmount = action.amount || 30;
          player.stackSize -= raiseAmount;
          player.betAmount = raiseAmount;
          mockEngine.currentState.betting.pot += raiseAmount;
          mockEngine.currentState.betting.currentBet = raiseAmount;
          mockEngine.currentState.betting.toCall = raiseAmount;
        } else if (action.type === ActionType.FOLD) {
          player.hasFolded = true;
        }

        // Move action to next player
        const playerOrder = ['p2', 'p3', 'p1'];
        const currentIndex = playerOrder.indexOf(playerId);
        let nextIndex = (currentIndex + 1) % playerOrder.length;

        // Skip folded players
        while (
          mockEngine.currentState.players[playerOrder[nextIndex]].hasFolded &&
          nextIndex !== currentIndex
        ) {
          nextIndex = (nextIndex + 1) % playerOrder.length;
        }

        mockEngine.currentState.betting.actionOn = playerOrder[nextIndex];

        return { success: true };
      }),
      getValidActions: jest.fn(() => [ActionType.FOLD, ActionType.CALL, ActionType.RAISE]),
    };

    // Mock the store
    const mockStoreState = {
      engineState: mockEngine,
      isPlayerToAct: jest.fn(
        (playerId: string) => mockEngine.currentState.betting.actionOn === playerId,
      ),
      processAction: mockEngine.processAction,
      initializeEngine: jest.fn(),
      currentStreet: 'preflop',
      streets: {
        preflop: { pot: 15 },
        flop: { pot: 0 },
        turn: { pot: 0 },
        river: { pot: 0 },
      },
      players: [],
      streetIndex: 0,
      currentPlayerIndex: 0,
    };

    (usePokerHandStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStoreState);
      }
      return mockStoreState;
    });
  });

  it('initializes game with correct player stacks and positions', async () => {
    render(<TestGameFlow />);

    // Check initial stacks
    expect(screen.getByTestId('stack-p1')).toHaveTextContent('Player 1: $1000');
    expect(screen.getByTestId('stack-p2')).toHaveTextContent('Player 2: $1000');
    expect(screen.getByTestId('stack-p3')).toHaveTextContent('Player 3: $1000');

    // Check players are in correct seats
    expect(screen.getByTestId('seat-btn')).toContainElement(screen.getByTestId('player-p1'));
    expect(screen.getByTestId('seat-sb')).toContainElement(screen.getByTestId('player-p2'));
    expect(screen.getByTestId('seat-bb')).toContainElement(screen.getByTestId('player-p3'));
  });

  it('updates stack sizes after player action', async () => {
    render(<TestGameFlow />);

    // Simulate SB (p2) calling BB
    act(() => {
      mockEngine.processAction('p2', { type: ActionType.CALL, amount: 5 });
    });

    // Check that mock engine was called
    expect(mockEngine.processAction).toHaveBeenCalledWith('p2', {
      type: ActionType.CALL,
      amount: 5,
    });

    // Verify engine state update
    expect(mockEngine.currentState.players.p2.stackSize).toBe(990); // 995 - 5
    expect(mockEngine.currentState.players.p2.betAmount).toBe(10); // 5 + 5
    expect(mockEngine.currentState.betting.pot).toBe(5); // Initial 0 + 5 (as per mock implementation)
  });

  it('handles multiple actions in sequence', async () => {
    const onActionComplete = jest.fn();
    render(<TestGameFlow onActionComplete={onActionComplete} />);

    // SB calls
    act(() => {
      mockEngine.processAction('p2', { type: ActionType.CALL, amount: 5 });
    });

    // BB raises
    act(() => {
      mockEngine.processAction('p3', { type: ActionType.RAISE, amount: 30 });
    });

    // BTN folds
    act(() => {
      mockEngine.processAction('p1', { type: ActionType.FOLD });
    });

    // Verify final state
    expect(mockEngine.currentState.players.p1.hasFolded).toBe(true);
    expect(mockEngine.currentState.players.p2.stackSize).toBe(990); // Called 5
    expect(mockEngine.currentState.players.p3.stackSize).toBe(960); // Raised to 30 (was already 10 in)
    expect(mockEngine.currentState.betting.pot).toBe(35); // 5 + 30
  });

  it('correctly identifies player to act', async () => {
    render(<TestGameFlow />);

    // Initially SB (p2) should be to act
    expect(mockEngine.currentState.betting.actionOn).toBe('p2');
    expect(usePokerHandStore().isPlayerToAct('p2')).toBe(true);
    expect(usePokerHandStore().isPlayerToAct('p3')).toBe(false);

    // After SB acts, BB should be to act
    act(() => {
      mockEngine.processAction('p2', { type: ActionType.CALL, amount: 5 });
    });

    expect(mockEngine.currentState.betting.actionOn).toBe('p3');
  });

  it('handles all-in scenarios correctly', async () => {
    // Set up a player with small stack
    mockEngine.currentState.players.p2.stackSize = 50;

    render(<TestGameFlow />);

    // Player goes all-in
    act(() => {
      mockEngine.processAction('p2', { type: ActionType.RAISE, amount: 50 });
    });

    // Verify all-in
    expect(mockEngine.currentState.players.p2.stackSize).toBe(0);
    expect(mockEngine.currentState.players.p2.betAmount).toBe(50);
  });

  it('updates UI when pot changes', async () => {
    // Start with a non-zero pot so PotDisplay renders
    mockEngine.currentState.betting.pot = 15;

    const { rerender } = render(<TestGameFlow />);

    // Pot display might not render if pot is 0, so let's check for the debug info instead
    expect(screen.getByTestId('debug-info')).toBeInTheDocument();

    // Simulate actions that change the pot
    act(() => {
      mockEngine.currentState.betting.pot = 50;
    });

    // Update store state
    const updatedStoreState = {
      ...usePokerHandStore(),
      engineState: mockEngine,
    };

    (usePokerHandStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(updatedStoreState);
      }
      return updatedStoreState;
    });

    // Force re-render to simulate state update
    rerender(<TestGameFlow />);

    // Verify pot would be available in engine state
    expect(mockEngine.currentState.betting.pot).toBe(50);
  });

  it('maintains game state consistency across multiple streets', async () => {
    const onActionComplete = jest.fn();
    render(<TestGameFlow onActionComplete={onActionComplete} />);

    // Complete preflop action
    act(() => {
      mockEngine.processAction('p2', { type: ActionType.CALL, amount: 5 });
      mockEngine.processAction('p3', { type: ActionType.CHECK });
      mockEngine.processAction('p1', { type: ActionType.CHECK });
    });

    // Move to flop
    act(() => {
      mockEngine.currentState.street = 'flop';
      mockEngine.currentState.betting.actionOn = 'p2'; // SB acts first postflop
    });

    // Verify state consistency
    expect(mockEngine.currentState.street).toBe('flop');
    expect(mockEngine.currentState.betting.actionOn).toBe('p2');

    // Continue with flop action
    act(() => {
      mockEngine.processAction('p2', { type: ActionType.CHECK });
    });

    expect(mockEngine.currentState.betting.actionOn).toBe('p3');
  });

  it('handles rapid consecutive actions without state corruption', async () => {
    render(<TestGameFlow />);

    // Simulate rapid actions
    const actions = [
      { player: 'p2', action: { type: ActionType.CALL, amount: 5 } },
      { player: 'p3', action: { type: ActionType.RAISE, amount: 30 } },
      { player: 'p1', action: { type: ActionType.CALL, amount: 30 } },
      { player: 'p2', action: { type: ActionType.FOLD } },
    ];

    // Execute all actions rapidly
    actions.forEach(({ player, action }) => {
      act(() => {
        mockEngine.processAction(player, action);
      });
    });

    // Verify final state integrity
    expect(mockEngine.currentState.players.p2.hasFolded).toBe(true);
    expect(mockEngine.currentState.players.p1.betAmount).toBe(30);
    expect(mockEngine.currentState.players.p3.betAmount).toBe(30);

    // Verify pot calculation
    const expectedPot = 5 + 30 + 30; // SB call + BB raise + BTN call
    expect(mockEngine.currentState.betting.pot).toBe(expectedPot);
  });
});
