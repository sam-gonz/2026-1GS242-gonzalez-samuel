import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';

export interface IShippingAddress {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress?: IShippingAddress;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
  stripePaymentIntentId: String,
  stripeSessionId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);