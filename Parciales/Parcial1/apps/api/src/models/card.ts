import mongoose, { Schema, Document } from 'mongoose';

export type Game = 'pokemon' | 'yugioh' | 'onepiece' | 'dragonball' | 'magic' | 'other';
export type CardCondition = 'mint' | 'near-mint' | 'excellent' | 'good' | 'played' | 'poor';
export type CardStatus = 'available' | 'sold' | 'reserved' | 'deleted';

export interface ICard extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  game: Game;
  set: string;
  cardNumber?: string;
  condition: CardCondition;
  price: number;
  currency: string;
  images: string[];
  description?: string;
  status: CardStatus;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  game: { type: String, enum: ['pokemon', 'yugioh', 'onepiece', 'dragonball', 'magic', 'other'], required: true },
  set: { type: String, required: true },
  cardNumber: String,
  condition: { type: String, enum: ['mint', 'near-mint', 'excellent', 'good', 'played', 'poor'], required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  images: [{ type: String }],
  description: String,
  status: { type: String, enum: ['available', 'sold', 'reserved', 'deleted'], default: 'available' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Card = mongoose.model<ICard>('Card', CardSchema);