import { Schema, model, models, Document, Types } from 'mongoose';

// Define the interface for type safety
export interface IHandEvent extends Document {
  handId: Types.ObjectId;          // Reference to SharedHand
  eventType: string;                // HAND_INITIALIZED, BLINDS_POSTED, ACTION_TAKEN, etc.
  eventData: Record<string, any>;   // The actual event payload
  eventVersion: number;             // For future event schema changes
  sequenceNumber: number;           // Order of events (0, 1, 2, ...)
  timestamp: Date;                  // When the event occurred
  playerId?: string;                // Who triggered this event (optional)
  
  // Metadata for debugging
  metadata?: {
    engineStateBefore?: any;        // State before this event
    engineStateAfter?: any;         // State after this event
    validActions?: string[];        // What actions were valid at this point
  };
}

const HandEventSchema = new Schema<IHandEvent>({
  handId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SharedHand',
    required: true,
    index: true, 
  },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      // These should match your existing EventType enum in poker-engine/core/events.ts
      'HAND_INITIALIZED',
      'BLINDS_POSTED',
      'ACTION_TAKEN',
      'STREET_COMPLETED', 
      'HAND_COMPLETED',
    ],
  },
  eventData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  eventVersion: {
    type: Number,
    default: 1,
  },
  sequenceNumber: { 
    type: Number, 
    required: true, 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true,
  },
  playerId: {
    type: String,
    sparse: true,  // Allow null but index non-null values
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false,
  },
}, {
  timestamps: true,  // Adds createdAt and updatedAt
});

// Compound index for efficient queries and uniqueness
HandEventSchema.index({ handId: 1, sequenceNumber: 1 }, { unique: true });

// Index for querying events by type
HandEventSchema.index({ eventType: 1, timestamp: -1 });

// Index for player history
HandEventSchema.index({ playerId: 1, timestamp: -1 }, { sparse: true });

export const HandEvent = models.HandEvent || model<IHandEvent>('HandEvent', HandEventSchema);