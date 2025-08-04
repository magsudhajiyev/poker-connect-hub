import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokerTable from '../poker-table/PokerTable';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { ActionType } from '@/types/poker';

// Mock the store
jest.mock('@/stores/poker-hand-store');

// Mock child components
jest.mock('../poker-table/ClickablePlayerSeat', () => ({
  __esModule: true,
  default: ({ player, isToAct, position }: any) => (
    <div data-testid={`seat-${position}`} className={isToAct ? 'active' : ''}>
      {player ? `${player.name} (${player.position})` : 'Empty Seat'}
    </div>
  ),
}));

jest.mock('../poker-table/CommunityCardsOptimized', () => ({
  CommunityCardsOptimized: ({ cards }: any) => (
    <div data-testid="community-cards">{cards?.join(' ') || 'No cards'}</div>
  ),
}));

jest.mock('../poker-table/PotDisplayOptimized', () => ({
  PotDisplayOptimized: ({ pot }: any) => (
    <div data-testid="pot-display">Pot: ${pot}</div>
  ),
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

describe('PokerTable Component', () => {
  const mockOnUpdatePlayer = jest.fn();
  const mockOnRemovePlayer = jest.fn();
  const mockGetCurrencySymbol = jest.fn(() => '$');
  const mockGetAvailableActions = jest.fn(() => [ActionType.FOLD, ActionType.CALL, ActionType.RAISE]);
  const mockUpdateAction = jest.fn();
  const mockHandleBetSizeSelect = jest.fn();

  const defaultProps = {
    players: [
      { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [100], isHero: false },
      { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [100], isHero: true },
    ],
    communityCards: [],
    pot: 15,
    getCurrencySymbol: mockGetCurrencySymbol,
    gameFormat: 'cash',
    onUpdatePlayer: mockOnUpdatePlayer,
    onRemovePlayer: mockOnRemovePlayer,
    availablePositions: [{ value: 'bb', label: 'BB' }],
    currentStreet: 'preflopActions',
    formData: {},
    getAvailableActions: mockGetAvailableActions,
    updateAction: mockUpdateAction,
    handleBetSizeSelect: mockHandleBetSizeSelect,
    isPositionsStep: false,
  };

  const mockStoreState = {
    isPlayerToAct: jest.fn((playerId: string) => playerId === 'utg'),
    engineState: {
      currentState: {
        betting: {
          pot: 20,
          actionOn: 'utg',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePokerHandStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStoreState);
      }
      return mockStoreState;
    });
  });

  it('renders poker table with all seats', () => {
    render(<PokerTable {...defaultProps} />);

    // Check if all position seats are rendered
    expect(screen.getByTestId('seat-utg')).toBeInTheDocument();
    expect(screen.getByTestId('seat-sb')).toBeInTheDocument();
    expect(screen.getByTestId('seat-bb')).toBeInTheDocument();
    expect(screen.getByTestId('seat-co')).toBeInTheDocument();
    expect(screen.getByTestId('seat-btn')).toBeInTheDocument();
  });

  it('displays players in correct positions', () => {
    render(<PokerTable {...defaultProps} />);

    expect(screen.getByTestId('seat-utg')).toHaveTextContent('Player 1 (utg)');
    expect(screen.getByTestId('seat-sb')).toHaveTextContent('Player 2 (sb)');
    expect(screen.getByTestId('seat-bb')).toHaveTextContent('Empty Seat');
  });

  it('highlights active player with animation', () => {
    render(<PokerTable {...defaultProps} />);

    // UTG should be active (has the 'active' class)
    expect(screen.getByTestId('seat-utg')).toHaveClass('active');
    expect(screen.getByTestId('seat-sb')).not.toHaveClass('active');
  });

  it('displays pot from store when available', () => {
    render(<PokerTable {...defaultProps} />);

    // Should use store pot (20) over prop pot (15)
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $20');
  });

  it('falls back to prop pot when store pot is not available', () => {
    const noStorePotState = {
      ...mockStoreState,
      engineState: null,
    };
    
    (usePokerHandStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(noStorePotState);
      }
      return noStorePotState;
    });

    render(<PokerTable {...defaultProps} />);
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $15');
  });

  it('hides pot display when pot is 0', () => {
    const zeroPotProps = { ...defaultProps, pot: 0 };
    const zeroPotState = {
      ...mockStoreState,
      engineState: {
        currentState: {
          betting: { pot: 0 },
        },
      },
    };
    
    (usePokerHandStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(zeroPotState);
      }
      return zeroPotState;
    });

    render(<PokerTable {...zeroPotProps} />);
    expect(screen.queryByTestId('pot-display')).not.toBeInTheDocument();
  });

  it('displays community cards when provided', () => {
    const propsWithCards = {
      ...defaultProps,
      communityCards: ['As', 'Kh', 'Qd'],
    };

    render(<PokerTable {...propsWithCards} />);
    expect(screen.getByTestId('community-cards')).toHaveTextContent('As Kh Qd');
  });

  it.skip('updates active player based on store state', () => {
    const { rerender } = render(<PokerTable {...defaultProps} />);
    
    // Initially UTG is active
    expect(screen.getByTestId('seat-utg')).toHaveClass('active');
    
    // Update store to make SB active
    const updatedState = {
      ...mockStoreState,
      isPlayerToAct: jest.fn((playerId: string) => playerId === 'sb'),
      engineState: {
        currentState: {
          betting: {
            pot: 20,
            actionOn: 'sb',
          },
        },
      },
    };
    
    // Clear all mocks and set new implementation
    jest.clearAllMocks();
    (usePokerHandStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(updatedState);
      }
      return updatedState;
    });
    
    rerender(<PokerTable {...defaultProps} />);
    
    expect(screen.getByTestId('seat-utg')).not.toHaveClass('active');
    expect(screen.getByTestId('seat-sb')).toHaveClass('active');
  });

  it('does not highlight any player in positions step', () => {
    const positionsStepProps = { ...defaultProps, isPositionsStep: true };
    
    render(<PokerTable {...positionsStepProps} />);
    
    expect(screen.getByTestId('seat-utg')).not.toHaveClass('active');
    expect(screen.getByTestId('seat-sb')).not.toHaveClass('active');
  });

  it('passes correct props to player seats', () => {
    render(<PokerTable {...defaultProps} />);
    
    // Verify all seats are rendered (9 positions)
    const allPositions = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
    allPositions.forEach(position => {
      expect(screen.getByTestId(`seat-${position}`)).toBeInTheDocument();
    });
  });
});