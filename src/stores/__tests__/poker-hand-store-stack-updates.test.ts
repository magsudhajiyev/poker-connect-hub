import { renderHook, act } from '@testing-library/react';
import { usePokerHandStore } from '../poker-hand-store';
import { ActionType, GameType, GameFormat } from '@/types/poker';

describe('PokerHandStore - Stack Updates', () => {
  beforeEach(() => {
    act(() => {
      usePokerHandStore.getState().reset();
    });
  });

  it('should update player stacks immediately after betting actions', async () => {
    const { result } = renderHook(() => usePokerHandStore());

    // Initialize game with two players
    const players = [
      {
        id: 'bb',
        name: 'BB Player',
        position: 'bb',
        stackSize: [100],
        isHero: true,
      },
      {
        id: 'sb',
        name: 'SB Player',
        position: 'sb',
        stackSize: [100],
      },
    ];

    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 5, big: 10 },
    };

    // Initialize game
    await act(async () => {
      await result.current.initializeGame(players, gameConfig);
    });

    // Check initial stacks (after blinds)
    const initialPlayers = result.current.players;
    const bbPlayer = initialPlayers.find((p) => p.id === 'bb');
    const sbPlayer = initialPlayers.find((p) => p.id === 'sb');

    // Check initial player states

    // SB should have posted 5, so stack should be 95
    expect(sbPlayer?.stackSize[0]).toBe(95);
    // BB should have posted big blind 10, so stack should be 90
    expect(bbPlayer?.stackSize[0]).toBe(90);

    // In heads up, SB acts first preflop
    const sbSlot = result.current.getCurrentActionSlot();
    expect(sbSlot?.playerId).toBe('sb');

    // SB calls - needs to add 5 more to match the big blind
    await act(async () => {
      await result.current.processAction(sbSlot!.id, ActionType.CALL);
    });

    // Check stacks after SB calls
    const playersAfterSbCall = result.current.players;
    const bbAfterSbCall = playersAfterSbCall.find((p) => p.id === 'bb');
    const sbAfterCall = playersAfterSbCall.find((p) => p.id === 'sb');

    // SB posted 5 initially, then called 5 more, so should have 90
    expect(sbAfterCall?.stackSize[0]).toBe(90);
    // BB stack should remain the same
    expect(bbAfterSbCall?.stackSize[0]).toBe(90);

    // Now BB should act
    const bbSlot = result.current.getCurrentActionSlot();
    expect(bbSlot?.playerId).toBe('bb');

    // BB checks (no additional chips needed)
    await act(async () => {
      await result.current.processAction(bbSlot!.id, ActionType.CHECK);
    });

    // Check final stacks
    const finalPlayers = result.current.players;
    const bbFinal = finalPlayers.find((p) => p.id === 'bb');
    const sbFinal = finalPlayers.find((p) => p.id === 'sb');

    // BB should still have 90
    expect(bbFinal?.stackSize[0]).toBe(90);
    // SB should have 90
    expect(sbFinal?.stackSize[0]).toBe(90);

    // Check pot size
    expect(result.current.engineState?.currentState?.betting?.pot).toBe(20);
  });

  it('should update stacks for raise actions', async () => {
    const { result } = renderHook(() => usePokerHandStore());

    const players = [
      {
        id: 'utg',
        name: 'UTG Player',
        position: 'utg',
        stackSize: [200],
        isHero: true,
      },
      {
        id: 'sb',
        name: 'SB Player',
        position: 'sb',
        stackSize: [200],
      },
    ];

    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 5, big: 10 },
    };

    await act(async () => {
      await result.current.initializeGame(players, gameConfig);
    });

    // UTG raises to 30
    const utgSlot = result.current.getCurrentActionSlot();
    await act(async () => {
      await result.current.processAction(utgSlot!.id, ActionType.RAISE, 30);
    });

    // Check stacks after raise
    const playersAfterRaise = result.current.players;
    const utgAfterRaise = playersAfterRaise.find((p) => p.id === 'utg');

    // UTG posted 10, then raised to 30 total, so spent 30 total
    expect(utgAfterRaise?.stackSize[0]).toBe(170);
  });
});
