// src/poker-engine/repository/schemas.ts
// WARNING: This file should NEVER be imported in client-side code
// It contains Mongoose schemas that only work on the server
// Use types from @/types/poker-engine for client-side code
import mongoose, { Schema, Document } from 'mongoose';

// Event subdocument schema
const eventSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    timestamp: { type: Date, required: true },
    version: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

// Snapshot subdocument schema
const snapshotSchema = new Schema(
  {
    players: [
      {
        id: String,
        name: String,
        position: String,
        stackSize: Number,
        status: String,
        currentBet: Number,
        totalInvested: Number,
      },
    ],
    pot: Number,
    communityCards: [String],
    currentBet: Number,
    actions: [
      {
        playerId: String,
        action: String,
        amount: Number,
        timestamp: Date,
      },
    ],
  },
  { _id: false },
);

// Main hand schema
export interface IPokerHand extends Document {
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

  events: any[]; // PokerEvent[]

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

const handSchema = new Schema<IPokerHand>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },

    gameConfig: {
      gameType: { type: String, required: true },
      gameFormat: { type: String, required: true },
      blinds: {
        small: { type: Number, required: true },
        big: { type: Number, required: true },
        ante: { type: Number },
      },
      currency: { type: String, default: 'USD' },
    },

    events: [eventSchema],

    summary: {
      heroPosition: { type: String, required: true },
      villainPosition: { type: String },
      playerCount: { type: Number, required: true },
      potSize: { type: Number, required: true },
      winner: { type: String },
      showdown: { type: Boolean, default: false },
      streets: [{ type: String }],
    },

    snapshots: {
      preflop: snapshotSchema,
      flop: snapshotSchema,
      turn: snapshotSchema,
      river: snapshotSchema,
      showdown: snapshotSchema,
    },

    tags: [{ type: String, index: true }],
    viewCount: { type: Number, default: 0 },
    likes: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
handSchema.index({ createdAt: -1 });
handSchema.index({ 'summary.heroPosition': 1 });
handSchema.index({ 'gameConfig.gameType': 1 });
handSchema.index({ tags: 1 });
handSchema.index({ userId: 1, createdAt: -1 });

export const PokerHand = mongoose.model<IPokerHand>('PokerHand', handSchema);
