import mongoose, { Schema } from 'mongoose';
const CategorySchema = new Schema({
    name: { type: String, required: true },
    game: { type: String, required: true },
    imageUrl: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});
export const Category = mongoose.model('Category', CategorySchema);
