import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type SharedHandDocument = SharedHand & Document;

@Schema({ timestamps: true })
export class SharedHand {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 2000 })
  description: string;

  @Prop({ required: true })
  gameType: string;

  @Prop({ required: true })
  gameFormat: string;

  @Prop({ required: true, min: 2, max: 10 })
  tableSize: number;

  @Prop({ type: Object, required: true })
  positions: Record<string, any>;

  @Prop({ type: Object, required: true })
  preflopCards: Record<string, any>;

  @Prop({ type: [Object], default: [] })
  preflopActions: Array<any>;

  @Prop({ type: [String], default: [] })
  flopCards: string[];

  @Prop({ type: [Object], default: [] })
  flopActions: Array<any>;

  @Prop({ type: String })
  turnCard: string;

  @Prop({ type: [Object], default: [] })
  turnActions: Array<any>;

  @Prop({ type: String })
  riverCard: string;

  @Prop({ type: [Object], default: [] })
  riverActions: Array<any>;

  @Prop({ type: Object })
  analysis: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: Array<{
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;

  @Prop({ default: true })
  isPublic: boolean;

  // Virtual for populated user
  user?: User;

  // Virtual for like count
  likeCount?: number;

  // Virtual for comment count
  commentCount?: number;
}

export const SharedHandSchema = SchemaFactory.createForClass(SharedHand);

// Add indexes
SharedHandSchema.index({ userId: 1, createdAt: -1 });
SharedHandSchema.index({ isPublic: 1, createdAt: -1 });
SharedHandSchema.index({ tags: 1 });

// Virtual for like count
SharedHandSchema.virtual('likeCount').get(function () {
  return this.likes?.length || 0;
});

// Virtual for comment count
SharedHandSchema.virtual('commentCount').get(function () {
  return this.comments?.length || 0;
});

// Ensure virtuals are included in JSON responses
SharedHandSchema.set('toJSON', {
  virtuals: true,
  transform (doc, ret) {
    delete ret.__v;
    return ret;
  },
});
