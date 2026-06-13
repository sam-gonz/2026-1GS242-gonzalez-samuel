import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  code: string;
  players: Array<{ id: string; name: string; color: "red" | "black"; clerkId?: string }>;
  status: "waiting" | "playing" | "ended";
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    code: { type: String, required: true, unique: true },
    players: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, enum: ["red", "black"], required: true },
      clerkId: { type: String },
    }],
    status: { type: String, enum: ["waiting", "playing", "ended"], default: "waiting" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IRoom>("Room", roomSchema);
