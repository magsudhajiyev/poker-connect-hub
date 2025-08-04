import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedCardsDisplay from '../SelectedCardsDisplay';

// Mock the CardFromString component
jest.mock('@/components/ui/playing-card', () => ({
  CardFromString: ({ card }: { card: string }) => (
    <img role="img" alt={`Playing card ${card}`} src={`/cards/${card}.svg`} />
  ),
}));

describe('SelectedCardsDisplay Component', () => {
  it('displays hole cards correctly', () => {
    const cards = ['As', 'Kh'];
    render(<SelectedCardsDisplay cards={cards} label="Your Hole Cards" />);

    // Check label
    expect(screen.getByText('Your Hole Cards:')).toBeInTheDocument();

    // Check if cards are displayed
    const cardElements = screen.getAllByRole('img'); // PlayingCard uses img role
    expect(cardElements).toHaveLength(2);
    expect(cardElements[0]).toHaveAttribute('alt', 'Playing card As');
    expect(cardElements[1]).toHaveAttribute('alt', 'Playing card Kh');
  });

  it('does not render when no cards provided', () => {
    const { container } = render(<SelectedCardsDisplay cards={[]} label="Your Hole Cards" />);
    expect(container.firstChild).toBeNull();
  });

  it('displays multiple cards correctly', () => {
    const cards = ['As', 'Kh', 'Qd', '10c'];
    render(<SelectedCardsDisplay cards={cards} label="Community Cards" />);

    expect(screen.getByText('Community Cards:')).toBeInTheDocument();
    const cardElements = screen.getAllByRole('img');
    expect(cardElements).toHaveLength(4);
  });
});