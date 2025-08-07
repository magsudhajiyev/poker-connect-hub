import { renderHook } from '@testing-library/react';
import { usePlayerActionDialog } from '../usePlayerActionDialog';
import { usePokerHandStore } from '@/stores/poker-hand-store';

// Mock the store
jest.mock('@/stores/poker-hand-store');

describe('usePlayerActionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show CALL option when facing a bet on flop (engine state)', () => {
    // Mock store with engine state showing a bet
    const mockStore = {
      engineState: {
        currentState: {
          betting: {
            currentBet: 25,
            pot: 80,
          },
        },
      },
      eventAdapter: null,
      streets: {},
      currentStreet: 'flop',
    };

    (usePokerHandStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { result } = renderHook(() =>
      usePlayerActionDialog({
        isOpen: true,
        player: {
          id: 'player-co',
          name: 'Player CO',
          position: 'co',
          stackSize: [80],
        } as any,
        currentStreet: 'flop',
        formData: {
          flop: [],
        },
        pokerActions: undefined,
        getAvailableActions: undefined,
      }),
    );

    // Should show CALL option when facing a bet
    expect(result.current.availableActions).toContain('call');
    expect(result.current.availableActions).toContain('fold');
    expect(result.current.availableActions).toContain('raise');
    expect(result.current.availableActions).toContain('all-in');

    // Should NOT show check or bet when facing a bet
    expect(result.current.availableActions).not.toContain('check');
    expect(result.current.availableActions).not.toContain('bet');
  });

  it('should show CHECK and BET options when no bet on flop', () => {
    // Mock store with no current bet
    const mockStore = {
      engineState: {
        currentState: {
          betting: {
            currentBet: 0,
            pot: 50,
          },
        },
      },
      eventAdapter: null,
      streets: {},
      currentStreet: 'flop',
    };

    (usePokerHandStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { result } = renderHook(() =>
      usePlayerActionDialog({
        isOpen: true,
        player: {
          id: 'player-utg',
          name: 'Player UTG',
          position: 'utg',
          stackSize: [100],
        } as any,
        currentStreet: 'flop',
        formData: {
          flop: [],
        },
        pokerActions: undefined,
        getAvailableActions: undefined,
      }),
    );

    // Should show CHECK and BET when no bet to face
    expect(result.current.availableActions).toContain('check');
    expect(result.current.availableActions).toContain('bet');
    expect(result.current.availableActions).toContain('fold');
    expect(result.current.availableActions).toContain('all-in');

    // Should NOT show call when no bet to face
    expect(result.current.availableActions).not.toContain('call');
  });

  it('should fallback to checking actions array if no engine state', () => {
    // Mock store with no engine state
    const mockStore = {
      engineState: null,
      eventAdapter: null,
      streets: {},
      currentStreet: 'flop',
    };

    (usePokerHandStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { result } = renderHook(() =>
      usePlayerActionDialog({
        isOpen: true,
        player: {
          id: 'player-btn',
          name: 'Player BTN',
          position: 'btn',
          stackSize: [100],
        } as any,
        currentStreet: 'flop',
        formData: {
          flop: [{ playerId: 'player-utg', action: 'bet', amount: '20', completed: true }],
        },
        pokerActions: undefined,
        getAvailableActions: undefined,
      }),
    );

    // Should detect bet from actions array and show CALL
    expect(result.current.availableActions).toContain('call');
    expect(result.current.availableActions).toContain('fold');
    expect(result.current.availableActions).toContain('raise');
    expect(result.current.availableActions).toContain('all-in');
  });
});
