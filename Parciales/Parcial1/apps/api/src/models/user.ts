import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'business' | 'admin';
  rating: number;
  reviewCount: number;
  createdAt: Date;
  isVerified: boolean;
  isSuspended: boolean;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  avatar: String,
  bio: String,
  role: { type: String, enum: ['user', 'business', 'admin'], default: 'user' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
});

export const User = mongoose.model<IUser>('User', UserSchema);