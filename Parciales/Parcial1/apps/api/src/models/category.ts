import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  game: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  game: { type: String, required: true },
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);