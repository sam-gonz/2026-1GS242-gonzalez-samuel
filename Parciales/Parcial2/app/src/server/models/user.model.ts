import mongoose, { Schema, type Document } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  name: string
  email: string
  unlockedShinies: number[]
  purchasedPacks: string[]
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  unlockedShinies: { type: [Number], default: [] },
  purchasedPacks: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model<IUser>('User', UserSchema)