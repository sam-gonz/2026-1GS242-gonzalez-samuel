import { Schema, model, Document, Types } from 'mongoose'

export interface IReview extends Document {
  // Reseña de transacción entre usuarios
  transaction?: Types.ObjectId
  reviewer?: Types.ObjectId
  reviewee?: Types.ObjectId
  // Reseña/comentario de carta del marketplace
  storeItem?: Types.ObjectId
  author?: Types.ObjectId
  // Compartidos
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>({
  // ─── Transaction review ────────────────────────────────────────
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  reviewer:    { type: Schema.Types.ObjectId, ref: 'User' },
  reviewee:    { type: Schema.Types.ObjectId, ref: 'User', index: true },
  // ─── Marketplace card review ───────────────────────────────────
  storeItem:   { type: Schema.Types.ObjectId, ref: 'StoreItem', index: true },
  author:      { type: Schema.Types.ObjectId, ref: 'User' },
  // ─── Shared ───────────────────────────────────────────────────
  rating:  { type: Number, enum: [1, 2, 3, 4, 5], required: true },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: { createdAt: true, updatedAt: false } })

// Un usuario solo puede dejar una reseña por transacción
ReviewSchema.index({ transaction: 1, reviewer: 1 }, { unique: true, sparse: true })
// Un usuario solo puede dejar una reseña por carta
ReviewSchema.index({ storeItem: 1, author: 1 },    { unique: true, sparse: true })

export const Review = model<IReview>('Review', ReviewSchema)