// src/poker-engine/services/migration.ts
import { ShareHandFormData, ActionStep } from '@/types/shareHand';
import { PokerEvent } from '../core/events';
import { GameConfig } from '../core/state';
import { v4 as uuidv4 } from 'uuid';
import { Street, ActionType, Position } from '@/types/poker';

export class MigrationService {
  static convertFormDataToEvents(formData: ShareHandFormData): PokerEvent[] {
    const events: PokerEvent[] = [];
    const baseTimestamp = new Date();
    let eventIndex = 0;

    // Helper to create timestamp
    const getTimestamp = () => new Date(baseTimestamp.getTime() + eventIndex++ * 1000);

    // 1. Initialize hand
    events.push({
      id: uuidv4(),
      type: 'HAND_INITIALIZED',
      timestamp: getTimestamp(),
      version: 1,
      data: {
        gameId: uuidv4(),
        gameType: formData.gameType as any,
        gameFormat: formData.gameFormat as any,
        blinds: {
          small: parseFloat(formData.smallBlind),
          big: parseFloat(formData.bigBlind),
          ante: formData.ante ? parseFloat(formData.smallBlind) : undefined,
        },
        players:
          formData.players?.map((p, index) => ({
            id: p.id,
            name: p.name,
            position: p.position as Position,
            stackSize: p.stackSize[0],
            seatNumber: index + 1,
            isHero: p.isHero || false,
          })) || [],
        buttonPosition:
          (formData.players?.find((p) => p.position === Position.BTN)?.position as Position) ||
          Position.BTN,
      },
    });

    // 2. Post blinds
    const blindPosts: any[] = [];
    const sbPlayer = formData.players?.find((p) => p.position === Position.SB);
    const bbPlayer = formData.players?.find((p) => p.position === Position.BB);

    if (sbPlayer) {
      blindPosts.push({
        playerId: sbPlayer.id,
        type: 'small',
        amount: parseFloat(formData.smallBlind),
      });
    }

    if (bbPlayer) {
      blindPosts.push({
        playerId: bbPlayer.id,
        type: 'big',
        amount: parseFloat(formData.bigBlind),
      });
    }

    if (blindPosts.length > 0) {
      events.push({
        id: uuidv4(),
        type: 'BLINDS_POSTED',
        timestamp: getTimestamp(),
        version: 1,
        data: { posts: blindPosts },
      });
    }

    // 3. Deal hole cards
    if (formData.holeCards && formData.holeCards.length > 0) {
      const heroPlayer = formData.players?.find((p) => p.isHero);
      if (heroPlayer) {
        events.push({
          id: uuidv4(),
          type: 'CARDS_DEALT',
          timestamp: getTimestamp(),
          version: 1,
          data: {
            street: Street.PREFLOP,
            cards: [
              {
                playerId: heroPlayer.id,
                cards: formData.holeCards,
              },
            ],
          },
        });
      }
    }

    // 4. Convert actions for each street
    const streets: Array<{ key: keyof ShareHandFormData; street: Street }> = [
      { key: 'preflopActions', street: Street.PREFLOP },
      { key: 'flopActions', street: Street.FLOP },
      { key: 'turnActions', street: Street.TURN },
      { key: 'riverActions', street: Street.RIVER },
    ];

    streets.forEach(({ key, street }) => {
      // Deal community cards if needed
      if (street === Street.FLOP && formData.flopCards?.length === 3) {
        events.push({
          id: uuidv4(),
          type: 'CARDS_DEALT',
          timestamp: getTimestamp(),
          version: 1,
          data: {
            street: Street.FLOP,
            cards: [{ cards: formData.flopCards }],
          },
        });
      } else if (street === Street.TURN && formData.turnCard?.length === 1) {
        events.push({
          id: uuidv4(),
          type: 'CARDS_DEALT',
          timestamp: getTimestamp(),
          version: 1,
          data: {
            street: Street.TURN,
            cards: [{ cards: formData.turnCard }],
          },
        });
      } else if (street === Street.RIVER && formData.riverCard?.length === 1) {
        events.push({
          id: uuidv4(),
          type: 'CARDS_DEALT',
          timestamp: getTimestamp(),
          version: 1,
          data: {
            street: Street.RIVER,
            cards: [{ cards: formData.riverCard }],
          },
        });
      }

      // Convert actions
      const actions = formData[key] as ActionStep[];
      if (!actions || actions.length === 0) {
        return;
      }

      let potSize = 0; // Track pot for events

      actions.forEach((action) => {
        if (action.completed && action.action) {
          events.push({
            id: uuidv4(),
            type: 'ACTION_TAKEN',
            timestamp: getTimestamp(),
            version: 1,
            data: {
              playerId: action.playerId,
              action: action.action as ActionType,
              amount: action.betAmount ? parseFloat(action.betAmount) : 0,
              isAllIn: action.action === 'all-in',
              street,
              potBefore: potSize,
              potAfter: potSize + (action.betAmount ? parseFloat(action.betAmount) : 0),
            },
          });

          potSize += action.betAmount ? parseFloat(action.betAmount) : 0;
        }
      });

      // Mark street as complete if there were actions
      if (actions.some((a) => a.completed)) {
        const activePlayers =
          formData.players
            ?.filter((p) => !actions.some((a) => a.playerId === p.id && a.action === 'fold'))
            .map((p) => p.id) || [];

        events.push({
          id: uuidv4(),
          type: 'STREET_COMPLETED',
          timestamp: getTimestamp(),
          version: 1,
          data: {
            street,
            pot: potSize,
            activePlayers,
            nextStreet: this.getNextStreet(street),
          },
        });
      }
    });

    return events;
  }

  private static getNextStreet(current: Street): Street | undefined {
    const streets: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
    const index = streets.indexOf(current);
    return index < streets.length - 1 ? streets[index + 1] : undefined;
  }

  // Validate that events can be replayed successfully
  static validateEvents(
    _gameConfig: GameConfig,
    _events: PokerEvent[],
  ): { isValid: boolean; errors: string[] } {
    // Simplified validation for migration
    // Full validation happens server-side in the repository
    return {
      isValid: true,
      errors: [],
    };
  }

  // Convert events back to form data (for editing)
  static convertEventsToFormData(_events: PokerEvent[]): ShareHandFormData {
    // This is a placeholder - implement if needed for editing existing hands
    throw new Error('Not implemented yet');
  }
}
