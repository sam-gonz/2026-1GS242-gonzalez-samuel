import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  ownedSkins: string[];
  activeSkin: { pieces?: string; board?: string } | null;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    ownedSkins: { type: [String], default: [] },
    activeSkin: {
      type: { pieces: String, board: String },
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IUser>("User", userSchema);
