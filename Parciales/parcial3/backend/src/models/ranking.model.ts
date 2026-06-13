import mongoose, { Schema, Document } from "mongoose";

export interface IRanking extends Document {
  clerkId: string;
  name: string;
  wins: number;
  losses: number;
  totalGames: number;
  totalMoves: number;
  bestScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const rankingSchema = new Schema<IRanking>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    totalMoves: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IRanking>("Ranking", rankingSchema);
