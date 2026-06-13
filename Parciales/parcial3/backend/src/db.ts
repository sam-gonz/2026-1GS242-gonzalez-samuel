import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function connectDB() {
  const MONGO_URL = process.env.MONGO_URL || (await MongoMemoryServer.create()).getUri();
  try {
    await mongoose.connect(MONGO_URL);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("MongoDB error:", error);
    process.exit(1);
  }
}
