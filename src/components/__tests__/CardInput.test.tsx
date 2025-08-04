import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CardInput from '../CardInput';

// Mock the child components
jest.mock('../card-input/CardDisplay', () => ({
  __esModule: true,
  default: ({ cards, onRemoveCard }: any) => (
    <div data-testid="card-display">
      {cards.map((card: string) => (
        <button key={card} data-testid={`card-${card}`} onClick={() => onRemoveCard(card)}>
          {card}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../card-input/CardSuggestions', () => ({
  __esModule: true,
  default: ({ suggestions, selectedIndex, onSelectSuggestion, show }: any) => {
    if (!show || suggestions.length === 0) {
      return null;
    }
    return (
      <div data-testid="card-suggestions" className="card-suggestions">
        {suggestions.map((card: string, index: number) => (
          <button
            key={card}
            data-testid={`suggestion-${card}`}
            className={selectedIndex === index ? 'selected' : ''}
            onClick={() => onSelectSuggestion(card)}
            onMouseDown={(e) => e.preventDefault()}
          >
            {card}
          </button>
        ))}
      </div>
    );
  },
}));

// Mock the useCardInput hook
jest.mock('../card-input/useCardInput', () => ({
  useCardInput: (cards: string[], excludeCards: string[]) => {
    const [inputValue, setInputValue] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const allCards = [
      'As',
      'Ah',
      'Ad',
      'Ac',
      'Ks',
      'Kh',
      'Kd',
      'Kc',
      'Qs',
      'Qh',
      'Qd',
      'Qc',
      '7s',
      '7h',
      '7d',
      '7c',
      '2s',
      '2h',
      '2d',
      '2c',
    ];

    const getSuggestions = (value: string) => {
      if (!value) {
        return [];
      }
      const allExcludedCards = [...cards, ...excludeCards];
      return allCards
        .filter(
          (card) =>
            card.toLowerCase().includes(value.toLowerCase()) && !allExcludedCards.includes(card),
        )
        .slice(0, 6);
    };

    const parseCardInput = (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 2) {
        const rank = trimmed[0].toUpperCase();
        const suit = trimmed[1].toLowerCase();
        const card = rank + suit;
        if (allCards.includes(card)) {
          return [card];
        }
      }
      return [];
    };

    return {
      inputValue,
      setInputValue,
      showSuggestions,
      setShowSuggestions,
      selectedSuggestionIndex,
      setSelectedSuggestionIndex,
      inputRef,
      getSuggestions,
      parseCardInput,
    };
  },
}));

describe('CardInput Component', () => {
  const defaultProps = {
    label: 'Select Cards',
    cards: [],
    onCardsChange: jest.fn(),
    maxCards: 2,
    placeholder: 'Type cards (e.g., "Ah, 7d")',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct label and placeholder', () => {
    render(<CardInput {...defaultProps} />);

    expect(screen.getByText('Select Cards')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")')).toBeInTheDocument();
  });

  it('shows card count indicator', () => {
    render(<CardInput {...defaultProps} />);

    expect(screen.getByText('0/2 cards selected')).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    const user = userEvent.setup();
    render(<CardInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-As')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ah')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ad')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ac')).toBeInTheDocument();
    });
  });

  it('selects card when clicking on suggestion', async () => {
    const user = userEvent.setup();
    const mockOnCardsChange = jest.fn();
    render(<CardInput {...defaultProps} onCardsChange={mockOnCardsChange} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.getByTestId('suggestion-As')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('suggestion-As'));

    expect(mockOnCardsChange).toHaveBeenCalledWith(['As']);
  });

  it('automatically selects card when typing exact match', async () => {
    const user = userEvent.setup();
    const mockOnCardsChange = jest.fn();
    render(<CardInput {...defaultProps} onCardsChange={mockOnCardsChange} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'As');

    await waitFor(() => {
      expect(mockOnCardsChange).toHaveBeenCalledWith(['As']);
    });
  });

  it('clears input after selecting a card', async () => {
    const user = userEvent.setup();
    render(<CardInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")') as HTMLInputElement;

    await user.type(input, 'As');

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('displays selected cards', () => {
    const propsWithCards = {
      ...defaultProps,
      cards: ['As', 'Kh'],
    };

    render(<CardInput {...propsWithCards} />);

    expect(screen.getByTestId('card-As')).toBeInTheDocument();
    expect(screen.getByTestId('card-Kh')).toBeInTheDocument();
    expect(screen.getByText('2/2 cards selected')).toBeInTheDocument();
  });

  it('removes card when clicking on it', async () => {
    const user = userEvent.setup();
    const mockOnCardsChange = jest.fn();
    const propsWithCards = {
      ...defaultProps,
      cards: ['As', 'Kh'],
      onCardsChange: mockOnCardsChange,
    };

    render(<CardInput {...propsWithCards} />);

    await user.click(screen.getByTestId('card-As'));

    expect(mockOnCardsChange).toHaveBeenCalledWith(['Kh']);
  });

  it('hides input when max cards reached', () => {
    const propsWithMaxCards = {
      ...defaultProps,
      cards: ['As', 'Kh'],
      maxCards: 2,
    };

    render(<CardInput {...propsWithMaxCards} />);

    expect(screen.queryByPlaceholderText('Type cards (e.g., "Ah, 7d")')).not.toBeInTheDocument();
  });

  it('excludes already selected cards from suggestions', async () => {
    const user = userEvent.setup();
    const propsWithCard = {
      ...defaultProps,
      cards: ['As'],
    };

    render(<CardInput {...propsWithCard} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.queryByTestId('suggestion-As')).not.toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ah')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ad')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ac')).toBeInTheDocument();
    });
  });

  it('excludes cards in excludeCards prop from suggestions', async () => {
    const user = userEvent.setup();
    const propsWithExclude = {
      ...defaultProps,
      excludeCards: ['As', 'Ah'],
    };

    render(<CardInput {...propsWithExclude} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.queryByTestId('suggestion-As')).not.toBeInTheDocument();
      expect(screen.queryByTestId('suggestion-Ah')).not.toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ad')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-Ac')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation through suggestions', async () => {
    const user = userEvent.setup();
    render(<CardInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();
    });

    // Press arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByTestId('suggestion-As')).toHaveClass('selected');

    // Press arrow down again
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByTestId('suggestion-Ah')).toHaveClass('selected');

    // Press arrow up
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByTestId('suggestion-As')).toHaveClass('selected');
  });

  it('selects suggestion with Enter key', async () => {
    const user = userEvent.setup();
    const mockOnCardsChange = jest.fn();
    render(<CardInput {...defaultProps} onCardsChange={mockOnCardsChange} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();
    });

    // Navigate to first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Select with Enter
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnCardsChange).toHaveBeenCalledWith(['As']);
  });

  it('hides suggestions on Escape key', async () => {
    const user = userEvent.setup();
    render(<CardInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByTestId('card-suggestions')).not.toBeInTheDocument();
  });

  it('shows suggestions on focus if input has value', async () => {
    const user = userEvent.setup();
    render(<CardInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    // Click outside to blur
    await user.click(document.body);

    // Wait for blur timeout
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(screen.queryByTestId('card-suggestions')).not.toBeInTheDocument();

    // Focus again
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();
    });
  });

  it('handles blur correctly when clicking on suggestions', async () => {
    const user = userEvent.setup();
    const mockOnCardsChange = jest.fn();
    render(<CardInput {...defaultProps} onCardsChange={mockOnCardsChange} />);

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")');

    await user.type(input, 'A');

    await waitFor(() => {
      expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();
    });

    // The blur event should not hide suggestions when clicking within suggestions
    const suggestionButton = screen.getByTestId('suggestion-As');

    // Simulate blur with related target within suggestions
    fireEvent.blur(input, {
      relatedTarget: suggestionButton,
    });

    // Suggestions should still be visible
    expect(screen.getByTestId('card-suggestions')).toBeInTheDocument();

    // Now click the suggestion
    await user.click(suggestionButton);

    expect(mockOnCardsChange).toHaveBeenCalledWith(['As']);
  });

  it('clears input when all cards are removed', async () => {
    const user = userEvent.setup();
    const mockOnCardsChange = jest.fn();
    const { rerender } = render(
      <CardInput {...defaultProps} cards={['As']} onCardsChange={mockOnCardsChange} />,
    );

    const input = screen.getByPlaceholderText('Type cards (e.g., "Ah, 7d")') as HTMLInputElement;

    await user.type(input, 'K');
    expect(input.value).toBe('K');

    // Remove the card
    await user.click(screen.getByTestId('card-As'));

    // Rerender with empty cards
    rerender(<CardInput {...defaultProps} cards={[]} onCardsChange={mockOnCardsChange} />);

    // Input should be cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
