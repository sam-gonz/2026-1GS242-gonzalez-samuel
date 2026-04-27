import mongoose, { Schema, Document } from 'mongoose';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface ITradeOffer extends Document {
  tradePostId: mongoose.Types.ObjectId;
  offererId: mongoose.Types.ObjectId;
  offeringCards: { cardName: string; game: string; condition: string; images?: string[] }[];
  message?: string;
  status: OfferStatus;
  createdAt: Date;
}

const TradeOfferSchema = new Schema<ITradeOffer>({
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

export const TradeOffer = mongoose.model<ITradeOffer>('TradeOffer', TradeOfferSchema);