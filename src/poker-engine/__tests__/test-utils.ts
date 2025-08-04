import { EventSourcingAdapter } from '../adapters/EventSourcingAdapter';
import { SharedHand } from '@/models/SharedHand';
import { HandEvent } from '@/models/HandEvent';
import { ActionType, GameType, GameFormat, Position } from '@/types/poker';
import mongoose, { connect, disconnect } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export interface TestPlayer {
  id: string;
  position: string;
  chips: number;
  name?: string;
}

export interface TestSetup {
  players: TestPlayer[];
  blinds: {
    small: number;
    big: number;
    ante?: number;
  };
  gameType?: GameType;
  gameFormat?: GameFormat;
}

export async function setupTestDB(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await connect(mongoUri);
}

export async function teardownTestDB(): Promise<void> {
  await disconnect();
  await mongoServer.stop();
}

export async function cleanupTestDB(): Promise<void> {
  await SharedHand.deleteMany({});
  await HandEvent.deleteMany({});
}

export async function createTestHand(setup: TestSetup): Promise<EventSourcingAdapter> {
  const hand = await SharedHand.create({
    title: 'Test Hand',
    gameType: 'nlhe', // Use the string value expected by the model
    gameFormat: 'cash', // Use the string value expected by the model
    smallBlind: setup.blinds.small,
    bigBlind: setup.blinds.big,
    ante: setup.blinds.ante,
    userId: new mongoose.Types.ObjectId(), // Add required userId
    tableSize: setup.players.length, // Add required tableSize
    positions: {
      players: setup.players.map(p => ({
        playerId: p.id,
        playerName: p.name || `Player ${p.id}`,
        position: p.position,
        stackSize: p.chips,
        isHero: false,
      })),
    },
    isEventSourced: true,
  });
  
  const adapter = new EventSourcingAdapter(hand._id.toString());
  
  // Create initial hand event
  const initEventData = {
    gameId: hand._id.toString(),
    gameType: 'nlhe',
    gameFormat: 'cash',
    blinds: setup.blinds,
    players: setup.players.map((p, index) => ({
      id: p.id,
      name: p.name || `Player ${p.id}`,
      position: p.position,
      stackSize: p.chips,
      seatNumber: index + 1,
      isHero: false,
    })),
    buttonPosition: setup.players.find(p => p.position === 'BTN')?.position || 'BTN',
  };
  
  // Create HAND_INITIALIZED event in database
  await HandEvent.create({
    handId: hand._id,
    eventType: 'HAND_INITIALIZED',
    eventData: initEventData,
    eventVersion: 1,
    sequenceNumber: 0,
    timestamp: new Date(),
  });
  
  // Update hand's lastEventSequence
  hand.lastEventSequence = 0;
  await hand.save();
  
  // Now process blind posts through the adapter
  const blindPosts = [];
  
  // Handle heads-up: BTN posts small blind
  const isHeadsUp = setup.players.length === 2;
  if (isHeadsUp) {
    const btnPlayer = setup.players.find(p => p.position === Position.BTN || p.position === 'BTN' || p.position === 'btn');
    const bbPlayer = setup.players.find(p => p.position === Position.BB || p.position === 'BB' || p.position === 'bb');
    
    if (btnPlayer) {
      blindPosts.push({
        playerId: btnPlayer.id,
        type: 'small' as const,
        amount: setup.blinds.small,
      });
    }
    
    if (bbPlayer) {
      blindPosts.push({
        playerId: bbPlayer.id,
        type: 'big' as const,
        amount: setup.blinds.big,
      });
    }
  } else {
    // Regular game: SB and BB post
    const sbPlayer = setup.players.find(p => p.position === Position.SB || p.position === 'SB' || p.position === 'sb');
    const bbPlayer = setup.players.find(p => p.position === Position.BB || p.position === 'BB' || p.position === 'bb');
    
    if (sbPlayer) {
      blindPosts.push({
        playerId: sbPlayer.id,
        type: 'small' as const,
        amount: setup.blinds.small,
      });
    }
    
    if (bbPlayer) {
      blindPosts.push({
        playerId: bbPlayer.id,
        type: 'big' as const,
        amount: setup.blinds.big,
      });
    }
  }
  
  if (setup.blinds.ante) {
    setup.players.forEach(p => {
      blindPosts.push({
        playerId: p.id,
        type: 'ante' as const,
        amount: setup.blinds.ante!,
      });
    });
  }
  
  // Calculate dead blinds for missing positions
  let deadSmallBlind = setup.blinds.small;
  let deadBigBlind = setup.blinds.big;
  
  // If we have SB player, no dead small blind
  if (blindPosts.some(p => p.type === 'small')) {
    deadSmallBlind = 0;
  }
  
  // If we have BB player, no dead big blind
  if (blindPosts.some(p => p.type === 'big')) {
    deadBigBlind = 0;
  }
  
  // Process blinds through adapter (this will handle persistence)
  const blindsEvent = {
    type: 'BLINDS_POSTED' as const,
    data: { 
      posts: blindPosts,
      deadSmallBlind,
      deadBigBlind,
    },
    timestamp: new Date(),
    id: 'blinds-1',
    version: 1,
  };
  
  // The adapter should handle this through processCommand or similar
  // For now, let's create the event directly
  await HandEvent.create({
    handId: hand._id,
    eventType: 'BLINDS_POSTED',
    eventData: blindsEvent.data,
    eventVersion: 1,
    sequenceNumber: 1,
    timestamp: new Date(),
  });
  
  // Update hand's lastEventSequence
  hand.lastEventSequence = 1;
  await hand.save();
  
  return adapter;
}

export interface ExpectedState {
  pot?: number;
  currentBet?: number;
  street?: string;
  isHandComplete?: boolean;
  currentPlayerIndex?: number;
  minimumRaise?: number;
  players?: Array<{
    id: string;
    chips?: number;
    folded?: boolean;
    allIn?: boolean;
    currentBet?: number;
  }>;
  pots?: Array<{
    amount: number;
    eligiblePlayers: string[];
  }>;
}

export async function expectState(
  adapter: EventSourcingAdapter,
  expectations: ExpectedState,
): Promise<void> {
  const result = await adapter.rebuildState();
  const state = result.currentState;
  
  if (expectations.pot !== undefined) {
    expect(state.betting.pot).toBe(expectations.pot);
  }
  
  if (expectations.currentBet !== undefined) {
    expect(state.betting.currentBet).toBe(expectations.currentBet);
  }
  
  if (expectations.street !== undefined) {
    expect(state.street).toBe(expectations.street);
  }
  
  if (expectations.isHandComplete !== undefined) {
    expect(state.isComplete).toBe(expectations.isHandComplete);
  }
  
  if (expectations.currentPlayerIndex !== undefined) {
    const currentPlayer = state.betting.actionOn;
    const playerArray = Array.from(state.players.entries());
    const currentIndex = playerArray.findIndex(([id]) => id === currentPlayer);
    expect(currentIndex).toBe(expectations.currentPlayerIndex);
  }
  
  if (expectations.minimumRaise !== undefined) {
    expect(state.betting.minRaise).toBe(expectations.minimumRaise);
  }
  
  if (expectations.players) {
    expectations.players.forEach(expectedPlayer => {
      const player = state.players.get(expectedPlayer.id);
      expect(player).toBeDefined();
      
      if (expectedPlayer.chips !== undefined) {
        expect(player!.stackSize).toBe(expectedPlayer.chips);
      }
      
      if (expectedPlayer.folded !== undefined) {
        expect(player!.status === 'folded').toBe(expectedPlayer.folded);
      }
      
      if (expectedPlayer.allIn !== undefined) {
        expect(player!.status === 'allIn').toBe(expectedPlayer.allIn);
      }
      
      if (expectedPlayer.currentBet !== undefined) {
        expect(player!.currentBet).toBe(expectedPlayer.currentBet);
      }
    });
  }
  
  if (expectations.pots) {
    expect(state.betting.sidePots).toHaveLength(expectations.pots.length);
    expectations.pots.forEach((expectedPot, index) => {
      const pot = state.betting.sidePots[index];
      expect(pot.amount).toBe(expectedPot.amount);
      expect(pot.eligiblePlayers.sort()).toEqual(expectedPot.eligiblePlayers.sort());
    });
  }
}

export async function getValidActions(adapter: EventSourcingAdapter): Promise<ActionType[]> {
  return adapter.getValidActions();
}

export async function processCommand(
  adapter: EventSourcingAdapter,
  playerId: string,
  action: ActionType,
  amount?: number,
): Promise<{ success: boolean; error?: string }> {
  return adapter.processCommand(playerId, action, amount);
}