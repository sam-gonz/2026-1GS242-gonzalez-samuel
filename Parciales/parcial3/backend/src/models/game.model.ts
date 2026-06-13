import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  roomCode: string;
  board: (string | null)[][];
  turn: "red" | "black";
  players: Array<{ id: string; color: "red" | "black"; clerkId?: string }>;
  status: "active" | "red_wins" | "black_wins" | "draw";
  difficulty?: "easy" | "normal" | "hard" | "expert";
  gameMode?: "classic" | "rush";
  timeLimit?: number;
  redTimeRemaining?: number;
  blackTimeRemaining?: number;
  moveHistory: Array<{
    from: number[];
    to: number[];
    captured?: number[];
    promoted: boolean;
    player: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    roomCode: { type: String, required: true, unique: true },
    board: { type: [[Schema.Types.Mixed]], required: true },
    turn: { type: String, enum: ["red", "black"], default: "red" },
    players: [{
      id: { type: String, required: true },
      color: { type: String, enum: ["red", "black"], required: true },
      clerkId: { type: String },
    }],
    status: {
      type: String,
      enum: ["active", "red_wins", "black_wins", "draw"],
      default: "active",
    },
    difficulty: {
      type: String,
      enum: ["easy", "normal", "hard", "expert"],
      default: "normal",
    },
    gameMode: {
      type: String,
      enum: ["classic", "rush"],
      default: "classic",
    },
    timeLimit: {
      type: Number,
      default: null,
    },
    redTimeRemaining: {
      type: Number,
      default: null,
    },
    blackTimeRemaining: {
      type: Number,
      default: null,
    },
    moveHistory: [{
      from: { type: [Number], required: true },
      to: { type: [Number], required: true },
      captured: { type: [Number] },
      promoted: { type: Boolean, default: false },
      player: { type: String, required: true },
    }],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IGame>("Game", gameSchema);
