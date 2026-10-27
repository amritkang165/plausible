import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("⚠️  [MongoDB] No valid MONGODB_URI found in environment variables.");
    return false;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", false);
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log("✅ [MongoDB] Connected successfully to database:", m.connection.name);
        return m;
      })
      .catch((err) => {
        console.error("❌ [MongoDB] Connection error:", err instanceof Error ? err.message : err);
        cached.promise = null;
        return null;
      });
  }

  cached.conn = await cached.promise;
  return !!cached.conn;
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
