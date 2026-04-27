import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
});
export const Review = mongoose.model('Review', ReviewSchema);
