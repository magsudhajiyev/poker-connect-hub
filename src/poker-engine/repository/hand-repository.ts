// src/poker-engine/repository/hand-repository.ts
import { PokerHand, IPokerHand as IPokerHandDocument } from './schemas';
import { PokerHandEngine } from '../core/engine';
import { PokerEvent } from '../core/events';
import { HandState, GameConfig } from '../core/state';
import { GameType, GameFormat, ActionType, Street } from '@/types/poker';
import { CreateHandDTO, UpdateHandDTO, HandFilters } from '@/types/poker-engine';

export class HandRepository {
  async createHand(data: CreateHandDTO): Promise<IPokerHandDocument> {
    // Create engine to generate snapshots and summary
    const gameConfig: GameConfig = {
      gameType: data.gameConfig.gameType as GameType,
      gameFormat: data.gameConfig.gameFormat as GameFormat,
      blinds: data.gameConfig.blinds,
      currency: 'USD',
    };
    const engine = new PokerHandEngine(gameConfig, data.events);
    const finalState = engine.getCurrentState();

    // Generate snapshots
    const snapshots = this.generateSnapshots(data.events, gameConfig);

    // Generate summary
    const summary = this.generateSummary(finalState, data.events);

    // Generate tags
    const tags = this.generateTags(finalState, data.events);

    // Create hand document
    const hand = new PokerHand({
      userId: data.userId,
      title: data.title,
      description: data.description,
      gameConfig: data.gameConfig,
      events: data.events,
      summary,
      snapshots,
      tags,
    });

    return await hand.save();
  }

  async updateHand(
    handId: string,
    userId: string,
    updates: UpdateHandDTO,
  ): Promise<IPokerHandDocument | null> {
    const hand = await PokerHand.findOne({ _id: handId, userId });
    if (!hand) {
      return null;
    }

    // Update simple fields
    if (updates.title) {
      hand.title = updates.title;
    }
    if (updates.description) {
      hand.description = updates.description;
    }
    if (updates.tags) {
      hand.tags = updates.tags;
    }

    // If events are updated, regenerate derived data
    if (updates.events) {
      hand.events = updates.events;

      // Regenerate snapshots and summary
      const engine = new PokerHandEngine(hand.gameConfig as GameConfig, updates.events);
      const finalState = engine.getCurrentState();

      hand.snapshots = this.generateSnapshots(updates.events, hand.gameConfig as GameConfig);
      hand.summary = this.generateSummary(finalState, updates.events);
      hand.tags = this.generateTags(finalState, updates.events);
    }

    return await hand.save();
  }

  async getHand(handId: string): Promise<IPokerHandDocument | null> {
    return await PokerHand.findById(handId);
  }

  async getHandsForFeed(
    filters: HandFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ hands: IPokerHandDocument[]; total: number }> {
    const query = this.buildQuery(filters);

    const [hands, total] = await Promise.all([
      PokerHand.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PokerHand.countDocuments(query),
    ]);

    return { hands: hands as any as IPokerHandDocument[], total };
  }

  async incrementViewCount(handId: string): Promise<void> {
    await PokerHand.findByIdAndUpdate(handId, { $inc: { viewCount: 1 } });
  }

  async toggleLike(handId: string, userId: string): Promise<boolean> {
    const hand = await PokerHand.findById(handId);
    if (!hand) {
      return false;
    }

    const likeIndex = hand.likes.indexOf(userId);
    if (likeIndex > -1) {
      hand.likes.splice(likeIndex, 1);
    } else {
      hand.likes.push(userId);
    }

    await hand.save();
    return likeIndex === -1; // Returns true if liked, false if unliked
  }

  private generateSnapshots(events: PokerEvent[], gameConfig: GameConfig): Record<string, any> {
    const engine = new PokerHandEngine(gameConfig);
    const snapshots: Record<string, any> = {};

    events.forEach((event) => {
      engine.applyEvent(event);

      if (event.type === 'STREET_COMPLETED') {
        const state = engine.getCurrentState();
        const streetEvent = event as any;
        snapshots[streetEvent.data.street] = this.createSnapshot(state);
      }
    });

    return snapshots;
  }

  private createSnapshot(state: HandState): any {
    return {
      players: Array.from(state.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        stackSize: p.stackSize,
        status: p.status,
        currentBet: p.currentBet,
        totalInvested: p.totalInvested,
      })),
      pot: state.betting.pot,
      communityCards: state.communityCards,
      currentBet: state.betting.currentBet,
      actions: state.actionHistory.filter((a) => a.street === state.street),
    };
  }

  private generateSummary(state: HandState, events: PokerEvent[]): any {
    const hero = Array.from(state.players.values()).find((p) => p.isHero);
    const streets = new Set<string>();

    events.forEach((e) => {
      if (e.type === 'STREET_COMPLETED') {
        const streetEvent = e as any;
        streets.add(streetEvent.data.street);
      }
    });

    return {
      heroPosition: hero?.position || 'unknown',
      playerCount: state.players.size,
      potSize: state.betting.pot + state.betting.sidePots.reduce((sum, p) => sum + p.amount, 0),
      showdown: state.winners ? state.winners.length > 0 : false,
      streets: Array.from(streets),
    };
  }

  private generateTags(state: HandState, events: PokerEvent[]): string[] {
    const tags: string[] = [];

    // Check for all-in
    if (
      events.some((e) => e.type === 'ACTION_TAKEN' && (e as any).data.action === ActionType.ALL_IN)
    ) {
      tags.push('all-in');
    }

    // Check for 3-bet, 4-bet
    const raises = events.filter(
      (e) =>
        e.type === 'ACTION_TAKEN' &&
        (e as any).data.action === ActionType.RAISE &&
        (e as any).data.street === Street.PREFLOP,
    );

    if (raises.length >= 2) {
      tags.push('3bet-pot');
    }
    if (raises.length >= 3) {
      tags.push('4bet-pot');
    }

    // Check for multiway
    const activePlayers = Array.from(state.players.values()).filter((p) => p.status !== 'folded');
    if (activePlayers.length >= 3) {
      tags.push('multiway');
    }

    return tags;
  }

  private buildQuery(filters: HandFilters): any {
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.gameType) {
      query['gameConfig.gameType'] = filters.gameType;
    }
    if (filters.heroPosition) {
      query['summary.heroPosition'] = filters.heroPosition;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.createdAt.$lte = filters.dateTo;
      }
    }

    return query;
  }
}
