import mongoose, { Schema } from 'mongoose';
const TradeCardSubSchema = new Schema({
    cardName: { type: String, required: true },
    game: { type: String, required: true },
    condition: { type: String, required: true },
    images: [{ type: String }],
    quantity: { type: Number, default: 1 },
});
const TradePostSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    haves: [TradeCardSubSchema],
    wants: [{
            cardName: { type: String, required: true },
            game: { type: String, required: true },
            condition: String,
            notes: String,
        }],
    status: { type: String, enum: ['open', 'closed', 'completed'], default: 'open' },
    offerCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
export const TradePost = mongoose.model('TradePost', TradePostSchema);
