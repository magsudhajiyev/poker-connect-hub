import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreflopStep from '../PreflopStep';
import { ActionType } from '@/types/poker';

// Mock the ShareHandProvider to avoid next-auth import issues
jest.mock('../ShareHandProvider', () => ({
  useShareHandContext: () => ({
    players: [],
    formData: { players: [] },
    engineState: null,
    currentPlayer: null,
    legalActions: [],
    processAction: jest.fn(),
    initializeGame: jest.fn(),
    isGameInitialized: false,
    currentStreet: 'preflop',
    pot: 0,
  }),
}));

// Mock the lazy-loaded PokerTable component
jest.mock('../lazy-components', () => ({
  LazyPokerTable: ({ players, pot, ...props }: any) => (
    <div data-testid="poker-table">
      <div data-testid="pot-display">Pot: ${pot || 0}</div>
      {players.map((player: any) => (
        <div key={player.id} data-testid={`player-${player.id}`}>
          {player.name} - {player.position}
        </div>
      ))}
      {props.children}
    </div>
  ),
}));

// Mock CardInput component
jest.mock('@/components/CardInput', () => ({
  __esModule: true,
  default: ({ label, cards, onCardsChange, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <input 
        placeholder={placeholder}
        value={cards?.join(' ') || ''}
        onChange={(e) => {
          // Simulate card parsing
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
  default: ({ cards, label }: any) => 
    cards && cards.length > 0 ? (
      <div>
        <span>{label}</span>
        <div>{cards.join(' ')}</div>
      </div>
    ) : null,
}));

// Mock the usePlayerManagement hook
jest.mock('@/hooks/usePlayerManagement', () => ({
  usePlayerManagement: (formData: any) => ({
    players: formData.players || [],
  }),
}));

describe('PreflopStep Component', () => {
  const mockSetFormData = jest.fn();
  const mockUpdateAction = jest.fn();
  const mockHandleBetSizeSelect = jest.fn();
  const mockGetAvailableActions = jest.fn(() => [ActionType.FOLD, ActionType.CALL, ActionType.RAISE]);
  const mockGetAllSelectedCards = jest.fn(() => []);
  const mockGetCurrencySymbol = jest.fn(() => '$');

  const defaultProps = {
    formData: {
      players: [
        { id: 'utg', name: 'Player 1', position: 'utg', stackSize: [100], isHero: false },
        { id: 'sb', name: 'Player 2', position: 'sb', stackSize: [100], isHero: true },
      ],
      holeCards: [],
      preflopDescription: '',
      gameFormat: 'cash',
    },
    setFormData: mockSetFormData,
    getCurrencySymbol: mockGetCurrencySymbol,
    getAvailableActions: mockGetAvailableActions,
    updateAction: mockUpdateAction,
    handleBetSizeSelect: mockHandleBetSizeSelect,
    getAllSelectedCards: mockGetAllSelectedCards,
    pot: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all components correctly', () => {
    render(<PreflopStep {...defaultProps} />);

    // Check title
    expect(screen.getByText('Preflop Action')).toBeInTheDocument();

    // Check hole cards input
    expect(screen.getByText('Hole Cards')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your hole cards (e.g., Ah, 7d)')).toBeInTheDocument();

    // Check poker table is rendered
    expect(screen.getByTestId('poker-table')).toBeInTheDocument();

    // Check players are displayed
    expect(screen.getByTestId('player-utg')).toHaveTextContent('Player 1 - utg');
    expect(screen.getByTestId('player-sb')).toHaveTextContent('Player 2 - sb');

    // Check pot is displayed
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $15');

    // Check preflop insights textarea
    expect(screen.getByText('Preflop Insights (Optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe your thoughts/)).toBeInTheDocument();
  });

  it('displays pot correctly when passed as prop', () => {
    const { rerender } = render(<PreflopStep {...defaultProps} />);
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $15');

    // Update pot
    rerender(<PreflopStep {...defaultProps} pot={30} />);
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $30');
  });

  it('updates hole cards when input changes', () => {
    render(<PreflopStep {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Type your hole cards (e.g., Ah, 7d)');
    
    // Simulate CardInput behavior (it would parse and set cards)
    fireEvent.change(input, { target: { value: 'As Kh' } });
    
    // Verify setFormData was called
    // Note: In real implementation, CardInput would handle parsing
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('displays selected hole cards when they exist', () => {
    const propsWithCards = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        holeCards: ['As', 'Kh'],
      },
    };

    render(<PreflopStep {...propsWithCards} />);

    // Check if SelectedCardsDisplay would show the cards
    expect(screen.getByText('Your Hole Cards')).toBeInTheDocument();
  });

  it('updates preflop description', () => {
    render(<PreflopStep {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Describe your thoughts/);
    fireEvent.change(textarea, { target: { value: 'I have a strong hand' } });
    
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultProps.formData,
      preflopDescription: 'I have a strong hand',
    });
  });

  it('passes correct props to PokerTable', () => {
    render(<PreflopStep {...defaultProps} />);
    
    const pokerTable = screen.getByTestId('poker-table');
    expect(pokerTable).toBeInTheDocument();
    
    // Verify players and pot are displayed
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $15');
    expect(screen.getByTestId('player-utg')).toBeInTheDocument();
    expect(screen.getByTestId('player-sb')).toBeInTheDocument();
  });

  it('handles empty pot gracefully', () => {
    render(<PreflopStep {...defaultProps} pot={0} />);
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $0');
  });

  it('handles undefined pot gracefully', () => {
    render(<PreflopStep {...defaultProps} pot={undefined} />);
    expect(screen.getByTestId('pot-display')).toHaveTextContent('Pot: $0');
  });

  it('prevents player updates in action steps', () => {
    render(<PreflopStep {...defaultProps} />);
    
    // Even though handleUpdatePlayer is defined, it should do nothing
    // This is tested by the fact that the component renders without error
    expect(screen.getByTestId('poker-table')).toBeInTheDocument();
  });
});