/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { env } from "@/env/config";
import logger from "@/lib/utils/Logger";

const MONGODB_URI = env.MONGODB_URI;
const MONGODB_DB_NAME = env.MONGODB_DB_NAME;

let conn: mongoose.Connection | null = null;

async function setupMongo(): Promise<mongoose.Connection> {
  logger.info("Setting up MongoDB connection");

  try {
    if (conn == null) {
      logger.info("Creating new connection");

      mongoose.set("bufferCommands", false); // Disable mongoose buffering

      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });

      conn = mongoose.connection.useDb(MONGODB_DB_NAME, {
        useCache: true,
      });

      conn.on("error", (err) => {
        logger.error(`MongoDB connection error: ${err}`);
        conn = null;
      });

      logger.info("New connection established");
    }

    return conn;
  } catch (err) {
    logger.error(`MongoDB setup error: ${err}`);
    conn = null;
    throw err;
  }
}

export default setupMongo;
