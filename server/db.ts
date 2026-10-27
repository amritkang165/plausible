import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("⚠️  [MongoDB] No valid MONGODB_URI found in .env. Please configure your MongoDB Atlas connection string.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ [MongoDB] Connected successfully to database:", mongoose.connection.name);
    return true;
  } catch (error) {
    console.error("❌ [MongoDB] Connection error:", error instanceof Error ? error.message : error);
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
