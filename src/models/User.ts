import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['google', 'email'],
      required: true,
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// Add search optimization indexes
userSchema.index({ name: 'text' }); // Text index for full-text search
userSchema.index({ name: 1 }); // Regular index for regex searches
userSchema.index({ isActive: 1, name: 1 }); // Compound index for active users search

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
