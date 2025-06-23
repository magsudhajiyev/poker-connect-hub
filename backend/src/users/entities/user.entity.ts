import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
})
export class User {
  _id?: Types.ObjectId;
  
  id?: string;

  @Prop({ required: true, unique: true, index: true })
  googleId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  name: string;

  @Prop({ maxlength: 500 })
  picture: string;

  @Prop()
  refreshToken: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  hasCompletedOnboarding: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual for id
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});