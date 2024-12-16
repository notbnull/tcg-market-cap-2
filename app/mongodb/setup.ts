/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { env } from "../env/config";
import logger from "../utils/Logger";
let db: mongoose.Connection;

export async function setupMongo(): Promise<any> {
  if (db) {
    return db;
  }
  try {
    logger.info(`Connecting to MongoDB ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, {
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
    });
    logger.info("Connected to MongoDB");

    db = mongoose.connection.useDb(env.MONGODB_DB_NAME, {
      useCache: true,
    });
    return db;
  } catch (error) {
    logger.error(`Error connecting to MongoDB, ${error}`);
    throw error;
  }
}
