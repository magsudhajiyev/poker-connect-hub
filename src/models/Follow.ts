import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId; // User who is following
  following: mongoose.Types.ObjectId; // User being followed
  createdAt: Date;
}

const FollowSchema: Schema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure a user can't follow the same person twice
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for efficient queries
FollowSchema.index({ follower: 1, createdAt: -1 }); // Get who a user follows
FollowSchema.index({ following: 1, createdAt: -1 }); // Get a user's followers

export const Follow = mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);