import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
});
export const Notification = mongoose.model('Notification', NotificationSchema);
