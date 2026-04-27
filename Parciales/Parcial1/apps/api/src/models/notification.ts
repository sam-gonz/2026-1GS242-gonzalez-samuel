import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'offer_received' | 'order_paid' | 'review_received' | 'trade_accepted';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  metadata: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);