import mongoose from 'mongoose';

const sharedHandSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    gameType: {
      type: String,
      required: true,
      enum: ['nlh', 'nlhe', 'plo', 'plo5', 'plo6', '27sd', 'badugi', 'other'],
    },
    gameFormat: {
      type: String,
      required: true,
      enum: ['cash', 'mtt', 'sng', 'other'],
    },
    tableSize: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    positions: {
      heroPosition: String,
      villainPosition: String,
      players: [
        {
          position: String,
          stackSize: Number,
          isHero: Boolean,
          isVillain: Boolean,
        },
      ],
    },
    preflopCards: {
      holeCards: [String],
    },
    preflopActions: [
      {
        player: String,
        action: String,
        amount: Number,
        isAllIn: Boolean,
        potSizeAfter: Number,
        playerStackAfter: Number,
      },
    ],
    flopCards: [String],
    flopActions: [
      {
        player: String,
        action: String,
        amount: Number,
        isAllIn: Boolean,
        potSizeAfter: Number,
        playerStackAfter: Number,
      },
    ],
    turnCard: String,
    turnActions: [
      {
        player: String,
        action: String,
        amount: Number,
        isAllIn: Boolean,
        potSizeAfter: Number,
        playerStackAfter: Number,
      },
    ],
    riverCard: String,
    riverActions: [
      {
        player: String,
        action: String,
        amount: Number,
        isAllIn: Boolean,
        potSizeAfter: Number,
        playerStackAfter: Number,
      },
    ],
    analysis: {
      preflopDescription: String,
      flopDescription: String,
      turnDescription: String,
      riverDescription: String,
    },
    tags: [String],
    viewCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Event sourcing fields
    events: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HandEvent',
    }],
    // Track the last event sequence for optimistic concurrency control
    lastEventSequence: { 
      type: Number, 
      default: -1, 
    },
    // All new hands use event sourcing
    isEventSourced: { 
      type: Boolean, 
      default: true, 
    },
    // Cache the current state for performance (optional)
    currentStateCache: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    // When was the cache last updated
    cacheUpdatedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
sharedHandSchema.index({ userId: 1 });
sharedHandSchema.index({ createdAt: -1 });
sharedHandSchema.index({ tags: 1 });
sharedHandSchema.index({ isPublic: 1, createdAt: -1 });

export const SharedHand =
  mongoose.models.SharedHand || mongoose.model('SharedHand', sharedHandSchema);
