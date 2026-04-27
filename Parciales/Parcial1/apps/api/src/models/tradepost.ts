import mongoose, { Schema, Document } from 'mongoose';

export type TradeStatus = 'open' | 'closed' | 'completed';

export interface ITradeCard {
  cardName: string;
  game: string;
  condition: string;
  images?: string[];
  quantity: number;
}

export interface ITradePost extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  haves: ITradeCard[];
  wants: { cardName: string; game: string; condition?: string; notes?: string }[];
  status: TradeStatus;
  offerCount: number;
  createdAt: Date;
}

const TradeCardSubSchema = new Schema<ITradeCard>({
  cardName: { type: String, required: true },
  game: { type: String, required: true },
  condition: { type: String, required: true },
  images: [{ type: String }],
  quantity: { type: Number, default: 1 },
});

const TradePostSchema = new Schema<ITradePost>({
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

export const TradePost = mongoose.model<ITradePost>('TradePost', TradePostSchema);