import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlayerSeatDisplayOptimized } from '../PlayerSeatDisplayOptimized';
import { Player } from '@/types/shareHand';

// Mock the getPositionName function
jest.mock('@/utils/shareHandConstants', () => ({
  getPositionName: (pos: string) => pos.toUpperCase(),
}));

// Mock the CardFromString component
jest.mock('@/components/ui/playing-card', () => ({
  CardFromString: ({ card }: { card: string }) => <div data-testid={`card-${card}`}>{card}</div>,
}));

describe('PlayerSeatDisplayOptimized - Stack Updates', () => {
  const createPlayer = (
    overrides: Partial<Player> = {},
  ): Player & { betAmount?: number; hasFolded?: boolean; isAllIn?: boolean } => ({
    id: 'test-player',
    name: 'Test Player',
    position: 'utg',
    stackSize: [100],
    isHero: false,
    ...overrides,
  });

  beforeEach(() => {
    // Clear console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays initial stack size correctly', () => {
    const player = createPlayer({ stackSize: [100] });

    render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('updates display when stack size changes', () => {
    const player = createPlayer({ stackSize: [100] });

    const { rerender } = render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$100')).toBeInTheDocument();

    // Update stack size
    const updatedPlayer = createPlayer({ stackSize: [75] });

    rerender(
      <PlayerSeatDisplayOptimized
        player={updatedPlayer}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.queryByText('$100')).not.toBeInTheDocument();
    expect(screen.getByText('$75')).toBeInTheDocument();
  });

  it('displays "All-in" when player is all-in', () => {
    const player = createPlayer({
      stackSize: [0],
      isAllIn: true,
    });

    render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('All-in')).toBeInTheDocument();
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
  });

  it('updates from normal stack to all-in', () => {
    const player = createPlayer({ stackSize: [100] });

    const { rerender } = render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$100')).toBeInTheDocument();

    // Update to all-in
    const allInPlayer = createPlayer({
      stackSize: [0],
      isAllIn: true,
    });

    rerender(
      <PlayerSeatDisplayOptimized
        player={allInPlayer}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.queryByText('$100')).not.toBeInTheDocument();
    expect(screen.getByText('All-in')).toBeInTheDocument();
  });

  it('displays bet amount when player has bet', () => {
    const player = createPlayer({
      stackSize: [75],
      betAmount: 25,
    });

    render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$75')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
  });

  it('updates bet amount correctly', () => {
    const player = createPlayer({
      stackSize: [100],
      betAmount: 0,
    });

    const { rerender } = render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.queryByText('$0')).not.toBeInTheDocument(); // Bet amount 0 should not display

    // Update with bet
    const playerWithBet = createPlayer({
      stackSize: [50],
      betAmount: 50,
    });

    rerender(
      <PlayerSeatDisplayOptimized
        player={playerWithBet}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    // Both stack and bet are $50, so we should have 2 elements
    expect(screen.getAllByText('$50')).toHaveLength(2); // Stack and bet
  });

  it('handles array and non-array stack sizes', () => {
    // Test with array stack size
    const playerWithArray = createPlayer({ stackSize: [150] });

    const { rerender } = render(
      <PlayerSeatDisplayOptimized
        player={playerWithArray}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$150')).toBeInTheDocument();

    // Test with non-array stack size (edge case)
    const playerWithNumber = createPlayer({ stackSize: 200 as any });

    rerender(
      <PlayerSeatDisplayOptimized
        player={playerWithNumber}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('displays hole cards for hero player', () => {
    const hero = createPlayer({
      isHero: true,
      holeCards: ['As', 'Kh'],
      stackSize: [100],
    });

    render(
      <PlayerSeatDisplayOptimized player={hero} position="utg" gameFormat="cash" isToAct={false} />,
    );

    expect(screen.getByTestId('card-As')).toBeInTheDocument();
    expect(screen.getByTestId('card-Kh')).toBeInTheDocument();
  });

  it('does not display hole cards for non-hero player', () => {
    const villain = createPlayer({
      isHero: false,
      holeCards: ['As', 'Kh'],
      stackSize: [100],
    });

    render(
      <PlayerSeatDisplayOptimized
        player={villain}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    expect(screen.queryByTestId('card-As')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-Kh')).not.toBeInTheDocument();
  });

  it('handles rapid stack updates', () => {
    const player = createPlayer({ stackSize: [100] });

    const { rerender } = render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    // Rapid updates simulating multiple actions
    const stackSizes = [90, 70, 40, 0];

    stackSizes.forEach((size) => {
      const updatedPlayer = createPlayer({
        stackSize: [size],
        isAllIn: size === 0,
      });

      rerender(
        <PlayerSeatDisplayOptimized
          player={updatedPlayer}
          position="utg"
          gameFormat="cash"
          isToAct={false}
        />,
      );

      if (size === 0) {
        expect(screen.getByText('All-in')).toBeInTheDocument();
      } else {
        expect(screen.getByText(`$${size}`)).toBeInTheDocument();
      }
    });
  });

  it('correctly identifies when re-render is needed', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const player = createPlayer({ stackSize: [100] });

    const { rerender } = render(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    // Clear initial render logs
    consoleSpy.mockClear();

    // Same stack - should not re-render (memo should return true)
    rerender(
      <PlayerSeatDisplayOptimized
        player={player}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    // Should not log stack change
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Stack changed'),
      expect.anything(),
    );

    // Different stack - should re-render
    const updatedPlayer = createPlayer({ stackSize: [75] });

    rerender(
      <PlayerSeatDisplayOptimized
        player={updatedPlayer}
        position="utg"
        gameFormat="cash"
        isToAct={false}
      />,
    );

    // Should log the render with new stack
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[PlayerSeat] Rendering'),
      expect.objectContaining({
        stack: 75,
      }),
    );
  });
});
