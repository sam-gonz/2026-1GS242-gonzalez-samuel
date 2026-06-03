import mongoose, { Schema, Document } from "mongoose";

export interface IMove {
  from: [number, number];
  to: [number, number];
  captured?: [number, number];
  promoted: boolean;
  player: string;
}

export interface IGame extends Document {
  roomCode: string;
  board: (string | null)[][];
  turn: "red" | "black";
  players: Array<{ id: string; color: "red" | "black" }>;
  status: "active" | "red_wins" | "black_wins" | "draw";
  moveHistory: IMove[];
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    roomCode: { type: String, required: true, unique: true },
    board: { type: [[Schema.Types.Mixed]], required: true },
    turn: { type: String, enum: ["red", "black"], default: "red" },
    players: [
      {
        id: { type: String, required: true },
        color: { type: String, enum: ["red", "black"], required: true },
      },
    ],
    status: {
      type: String,
      enum: ["active", "red_wins", "black_wins", "draw"],
      default: "active",
    },
    moveHistory: [
      {
        from: { type: [Number], required: true },
        to: { type: [Number], required: true },
        captured: { type: [Number] },
        promoted: { type: Boolean, default: false },
        player: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IGame>("Game", gameSchema);
