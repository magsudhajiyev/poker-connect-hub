// Shared types for poker engine - safe for both client and server
// DO NOT import Mongoose here - this file is used in browser code

export interface IPokerHand {
  _id?: string;
  userId: string;
  title: string;
  description: string;

  gameConfig: {
    gameType: string;
    gameFormat: string;
    blinds: {
      small: number;
      big: number;
      ante?: number;
    };
    currency: string;
  };

  events: any[]; // PokerEvent[] - keeping as any for flexibility

  summary: {
    heroPosition: string;
    villainPosition?: string;
    playerCount: number;
    potSize: number;
    winner?: string;
    showdown: boolean;
    streets: string[];
  };

  snapshots: {
    preflop?: any;
    flop?: any;
    turn?: any;
    river?: any;
    showdown?: any;
  };

  tags: string[];
  viewCount: number;
  likes: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHandDTO {
  userId: string;
  title: string;
  description: string;
  gameConfig: {
    gameType: string;
    gameFormat: string;
    blinds: {
      small: number;
      big: number;
      ante?: number;
    };
  };
  events: any[]; // PokerEvent[]
}

export interface UpdateHandDTO {
  title?: string;
  description?: string;
  events?: any[];
  tags?: string[];
}

export interface HandFilters {
  userId?: string;
  gameType?: string;
  tags?: string[];
  heroPosition?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
