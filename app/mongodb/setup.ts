/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { env } from "../env/config";
import logger from "../utils/Logger";
const MONGODB_URI = env.MONGODB_URI;
const MONGODB_DB_NAME = env.MONGODB_DB_NAME;
const runtime = process.env.NEXT_RUNTIME;

interface CachedConnection {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

let cached: CachedConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function setupMongo() {
  logger.info(`Runtime: ${runtime}`);
  logger.info("Setting up MongoDB");
  if (cached.conn) {
    logger.info("MongoDB already connected");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    };

    logger.info(`Connecting to MongoDB ${MONGODB_URI}`);
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Explicitly use the specified database
      return mongoose.connection.useDb(MONGODB_DB_NAME, {
        useCache: true, // This ensures the connection is cached
      });
    });
    logger.info("Connected to MongoDB");
  }

  try {
    cached.conn = await cached.promise;
    logger.info("Connected to MongoDB");
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default setupMongo;
