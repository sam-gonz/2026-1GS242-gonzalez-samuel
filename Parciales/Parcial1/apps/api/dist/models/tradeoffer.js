import mongoose, { Schema } from 'mongoose';
const TradeOfferSchema = new Schema({
    tradePostId: { type: Schema.Types.ObjectId, ref: 'TradePost', required: true },
    offererId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    offeringCards: [{
            cardName: { type: String, required: true },
            game: { type: String, required: true },
            condition: { type: String, required: true },
            images: [{ type: String }],
        }],
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});
export const TradeOffer = mongoose.model('TradeOffer', TradeOfferSchema);
