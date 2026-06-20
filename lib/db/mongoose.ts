import mongoose from "mongoose";
import { getMongoUri } from "@/lib/config/env";
import { isNextBuildPhase } from "@/lib/config/build-phase";
import { initServerLogging } from "@/lib/init-server-logging";
import { logger } from "@/lib/logger";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  initServerLogging();

  if (isNextBuildPhase()) {
    throw new Error("Database connections are disabled during Next.js build");
  }

  const uri = getMongoUri();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error("MongoDB connection failed", error);
    throw error;
  }
}
