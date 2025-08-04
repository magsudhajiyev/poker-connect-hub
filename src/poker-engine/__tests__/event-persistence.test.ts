import { HandBuilderService } from '../services/builder';
import { GameType, GameFormat, Position, ActionType } from '@/types/poker';
import { GameConfig } from '../core/state';

describe('Event Persistence Integration', () => {
  const gameConfig: GameConfig = {
    gameType: GameType.NLH,
    gameFormat: GameFormat.CASH,
    blinds: { small: 1, big: 2 },
  };

  it('should generate proper events for save-engine endpoint', () => {
    const builder = new HandBuilderService(gameConfig);

    // Initialize hand
    const players = [
      {
        id: 'player1',
        name: 'UTG Player',
        position: Position.UTG,
        stackSize: 100,
        isHero: false,
      },
      {
        id: 'player2',
        name: 'Button',
        position: Position.BTN,
        stackSize: 100,
        isHero: true,
      },
      {
        id: 'player3',
        name: 'Small Blind',
        position: Position.SB,
        stackSize: 100,
        isHero: false,
      },
      {
        id: 'player4',
        name: 'Big Blind',
        position: Position.BB,
        stackSize: 100,
        isHero: false,
      },
    ];

    const initResult = builder.initializeHand(players);
    expect(initResult.isValid).toBe(true);

    const blindsResult = builder.postBlinds();
    expect(blindsResult.isValid).toBe(true);

    // Get events
    const events = builder.getEvents();

    // Should have HAND_INITIALIZED and BLINDS_POSTED events
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('HAND_INITIALIZED');
    expect(events[1].type).toBe('BLINDS_POSTED');

    // Verify HAND_INITIALIZED event structure
    const initEvent = events[0];
    expect(initEvent.data).toMatchObject({
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: { small: 1, big: 2 },
      players: expect.arrayContaining([
        expect.objectContaining({ id: 'player1', position: Position.UTG }),
        expect.objectContaining({ id: 'player2', position: Position.BTN }),
        expect.objectContaining({ id: 'player3', position: Position.SB }),
        expect.objectContaining({ id: 'player4', position: Position.BB }),
      ]),
    });

    // Verify BLINDS_POSTED event structure
    const blindsEvent = events[1];
    expect(blindsEvent.data.posts).toEqual(
      expect.arrayContaining([
        { playerId: 'player3', type: 'small', amount: 1 },
        { playerId: 'player4', type: 'big', amount: 2 },
      ]),
    );

    // Verify engine state after initialization
    const state = builder.getCurrentState();
    expect(state.currentState.betting.pot).toBe(3); // SB + BB
    expect(state.currentState.betting.actionOn).toBe('player1'); // UTG first to act
  });

  it('should maintain correct action order after blinds', () => {
    const builder = new HandBuilderService(gameConfig);

    const players = [
      { id: 'utg', name: 'UTG', position: Position.UTG, stackSize: 100, isHero: false },
      { id: 'btn', name: 'Button', position: Position.BTN, stackSize: 100, isHero: true },
      { id: 'sb', name: 'SB', position: Position.SB, stackSize: 100, isHero: false },
      { id: 'bb', name: 'BB', position: Position.BB, stackSize: 100, isHero: false },
    ];

    builder.initializeHand(players);
    builder.postBlinds();

    const state = builder.getCurrentState();

    // UTG should be first to act preflop
    expect(state.currentState.betting.actionOn).toBe('utg');

    // Process UTG fold
    const foldResult = builder.processAction('utg', ActionType.FOLD);
    expect(foldResult.isValid).toBe(true);

    const stateAfterFold = builder.getCurrentState();
    // Button should be next to act
    expect(stateAfterFold.currentState.betting.actionOn).toBe('btn');
  });
});
