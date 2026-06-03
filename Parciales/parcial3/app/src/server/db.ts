import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function connectDB() {
  const MONGO_URL =
    process.env.MONGO_URL ||
    (await MongoMemoryServer.create()).getUri();

  try {
    await mongoose.connect(MONGO_URL);
    console.log(`Connected to MongoDB at ${MONGO_URL.substring(0, 50)}...`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
