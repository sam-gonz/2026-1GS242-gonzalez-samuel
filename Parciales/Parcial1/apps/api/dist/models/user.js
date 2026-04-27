import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
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
export const User = mongoose.model('User', UserSchema);
