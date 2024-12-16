/* eslint-disable @typescript-eslint/no-explicit-any */
import { mongoose } from "@typegoose/typegoose";
import { env } from "../env/config";

let db: mongoose.Connection;

export async function setupMongo(): Promise<any> {
  if (db) {
    return db;
  }
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB");

    db = mongoose.connection.useDb(env.MONGODB_DB_NAME, {
      useCache: true, // This helps with performance
    });

    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
