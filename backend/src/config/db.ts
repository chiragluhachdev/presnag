import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  // Fail fast (10s) instead of the 30s default so problems surface quickly in logs.
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`[db] connected`);
}
