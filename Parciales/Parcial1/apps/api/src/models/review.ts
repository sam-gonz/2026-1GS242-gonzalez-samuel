import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  reviewedUserId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);