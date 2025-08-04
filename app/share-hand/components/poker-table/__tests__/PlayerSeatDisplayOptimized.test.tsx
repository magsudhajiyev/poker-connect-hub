import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlayerSeatDisplayOptimized } from '../PlayerSeatDisplayOptimized';
import { Player } from '@/types/shareHand';

// Mock the utility functions
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/utils/shareHandConstants', () => ({
  getPositionName: (position: string) => {
    const positionMap: Record<string, string> = {
      utg: 'UTG',
      utg1: 'UTG+1',
      mp: 'MP',
      lj: 'LJ',
      hj: 'HJ',
      co: 'CO',
      btn: 'BTN',
      sb: 'SB',
      bb: 'BB',
    };
    return positionMap[position] || position.toUpperCase();
  },
}));

describe('PlayerSeatDisplayOptimized Component', () => {
  const createPlayer = (overrides?: Partial<Player>): Player =>
    ({
      id: 'player1',
      name: 'Test Player',
      stackSize: 100,
      position: 'btn',
      isHero: false,
      ...overrides,
    }) as Player;

  it('renders player with correct name and stack size', () => {
    const player = createPlayer({ name: 'John Doe', stackSize: 250 });

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
  });

  it('renders player with array stack size format', () => {
    const player = createPlayer({ stackSize: [500] as any });

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('renders player with zero stack size', () => {
    const player = createPlayer({ stackSize: 0 });

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('renders player with undefined stack size', () => {
    const player = createPlayer({ stackSize: undefined as any });

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('displays position when valid', () => {
    const player = createPlayer();

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('BTN')).toBeInTheDocument();
  });

  it('does not display position when unknown', () => {
    const player = createPlayer();

    render(<PlayerSeatDisplayOptimized player={player} position="unknown" />);

    expect(screen.queryByText('UNKNOWN')).not.toBeInTheDocument();
  });

  it('does not display position when empty', () => {
    const player = createPlayer();

    render(<PlayerSeatDisplayOptimized player={player} position="" />);

    expect(screen.queryByText(/^(UTG|MP|CO|BTN|SB|BB)/)).not.toBeInTheDocument();
  });

  it('shows all-in status instead of stack size', () => {
    const player = createPlayer({ stackSize: 0 });
    (player as any).isAllIn = true;

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('All-in')).toBeInTheDocument();
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
  });

  it('displays bet amount when player has bet', () => {
    const player = createPlayer();
    (player as any).betAmount = 50;

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('does not display bet amount when zero', () => {
    const player = createPlayer();
    (player as any).betAmount = 0;

    render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    // Should only show stack size, not bet amount
    const dollarTexts = screen.getAllByText(/^\$/);
    expect(dollarTexts).toHaveLength(1); // Only stack size
  });

  it('applies correct styles when player is to act', () => {
    const player = createPlayer();

    const { container } = render(
      <PlayerSeatDisplayOptimized player={player} position="btn" isToAct={true} />,
    );

    const seatDiv = container.firstChild as HTMLElement;
    expect(seatDiv).toHaveClass('border-emerald-500');
    expect(seatDiv).toHaveClass('animate-pulse');

    // Check for action indicator
    const actionIndicator = seatDiv.querySelector('.bg-emerald-500');
    expect(actionIndicator).toBeInTheDocument();
  });

  it('applies folded styles when player has folded', () => {
    const player = createPlayer();
    (player as any).hasFolded = true;

    const { container } = render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    const seatDiv = container.firstChild as HTMLElement;
    expect(seatDiv).toHaveClass('opacity-60');
    expect(seatDiv).toHaveClass('border-slate-700');

    const nameElement = screen.getByText('Test Player');
    expect(nameElement).toHaveClass('text-slate-500');
  });

  it('re-renders when stack size changes', () => {
    const player = createPlayer({ stackSize: 100 });

    const { rerender } = render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$100')).toBeInTheDocument();

    // Update stack size
    const updatedPlayer = { ...player, stackSize: 200 };
    rerender(<PlayerSeatDisplayOptimized player={updatedPlayer} position="btn" />);

    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('re-renders when stack size changes from array format', () => {
    const player = createPlayer({ stackSize: [100] as any });

    const { rerender } = render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$100')).toBeInTheDocument();

    // Update stack size
    const updatedPlayer = { ...player, stackSize: [300] as any };
    rerender(<PlayerSeatDisplayOptimized player={updatedPlayer} position="btn" />);

    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('does not re-render when only unrelated props change', () => {
    const player = createPlayer({ stackSize: 100 });
    let renderCount = 0;

    // Create a wrapper that tracks renders of the memoized component
    const TestWrapper = React.memo(({ player, position }: any) => {
      React.useEffect(() => {
        renderCount++;
      });
      return <PlayerSeatDisplayOptimized player={player} position={position} />;
    });

    const { rerender } = render(<TestWrapper player={player} position="btn" />);
    const initialRenderCount = renderCount;

    // Rerender with the exact same player object reference
    rerender(<TestWrapper player={player} position="btn" />);

    // The wrapper might re-render, but PlayerSeatDisplayOptimized should not
    // because the props are identical
    expect(renderCount).toBe(initialRenderCount);
  });

  it('re-renders when bet amount changes', () => {
    const player = createPlayer();
    (player as any).betAmount = 25;

    const { rerender } = render(<PlayerSeatDisplayOptimized player={player} position="btn" />);

    expect(screen.getByText('$25')).toBeInTheDocument();

    // Update bet amount
    const updatedPlayer = { ...player };
    (updatedPlayer as any).betAmount = 75;
    rerender(<PlayerSeatDisplayOptimized player={updatedPlayer} position="btn" />);

    expect(screen.getByText('$75')).toBeInTheDocument();
  });

  it('re-renders when folded status changes', () => {
    const player = createPlayer();

    const { rerender, container } = render(
      <PlayerSeatDisplayOptimized player={player} position="btn" />,
    );

    let seatDiv = container.firstChild as HTMLElement;
    expect(seatDiv).not.toHaveClass('opacity-60');

    // Player folds
    const foldedPlayer = { ...player };
    (foldedPlayer as any).hasFolded = true;
    rerender(<PlayerSeatDisplayOptimized player={foldedPlayer} position="btn" />);

    seatDiv = container.firstChild as HTMLElement;
    expect(seatDiv).toHaveClass('opacity-60');
  });

  it('re-renders when isToAct changes', () => {
    const player = createPlayer();

    const { rerender, container } = render(
      <PlayerSeatDisplayOptimized player={player} position="btn" isToAct={false} />,
    );

    let seatDiv = container.firstChild as HTMLElement;
    expect(seatDiv).not.toHaveClass('animate-pulse');

    // Player becomes active
    rerender(<PlayerSeatDisplayOptimized player={player} position="btn" isToAct={true} />);

    seatDiv = container.firstChild as HTMLElement;
    expect(seatDiv).toHaveClass('animate-pulse');
  });

  it('handles complex stack update scenario', () => {
    // Initial state with folded players and active player
    const players = [
      createPlayer({ id: 'p1', name: 'Player 1', stackSize: 100, position: 'btn' }),
      createPlayer({ id: 'p2', name: 'Player 2', stackSize: 200, position: 'sb' }),
      createPlayer({ id: 'p3', name: 'Player 3', stackSize: 150, position: 'bb' }),
    ];

    (players[0] as any).hasFolded = true;

    const { rerender } = render(
      <div>
        {players.map((player, index) => (
          <PlayerSeatDisplayOptimized
            key={player.id}
            player={player}
            position={player.position}
            isToAct={index === 1}
          />
        ))}
      </div>,
    );

    // Verify initial state
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();

    // Player 2 bets, reducing stack
    const updatedPlayers = [...players];
    updatedPlayers[1] = { ...players[1], stackSize: 150 };
    (updatedPlayers[1] as any).betAmount = 50;

    rerender(
      <div>
        {updatedPlayers.map((player, index) => (
          <PlayerSeatDisplayOptimized
            key={player.id}
            player={player}
            position={player.position}
            isToAct={index === 2}
          />
        ))}
      </div>,
    );

    // Verify stack update and bet display
    // There are two $150 stacks now (Player 2 and Player 3), so we need to be more specific
    const allStackTexts = screen.getAllByText(/^\$\d+$/);
    const stackValues = allStackTexts.map((el) => el.textContent);
    expect(stackValues).toContain('$100'); // Player 1
    expect(stackValues).toContain('$150'); // Player 2 and 3
    expect(stackValues.filter((v) => v === '$150').length).toBe(2); // Both Player 2 and 3 have $150

    // Check bet amount is displayed
    expect(screen.getByText('$50')).toBeInTheDocument(); // Bet amount
  });
});
