import mongoose, { Schema, Document } from "mongoose";

export interface ISkin extends Document {
  id: string;
  name: string;
  type: "pieces" | "board";
  price: number;
  colors?: { primary: string; secondary: string; accent?: string };
}

const skinSchema = new Schema<ISkin>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["pieces", "board"], required: true },
  price: { type: Number, required: true },
  colors: { type: { primary: String, secondary: String, accent: String }, default: null },
});

export default mongoose.model<ISkin>("Skin", skinSchema);
