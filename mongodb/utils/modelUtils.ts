import mongoose from "mongoose";
import setupMongo from "../setup";
import logger from "@/lib/utils/Logger";

/**
 * Cache for model instances and schemas to prevent recompilation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelCache = new Map<string, any>();
const schemaCache = new Map<string, mongoose.Schema>();

/**
 * Generic function to get or create a Mongoose model safely
 * This prevents the "Cannot overwrite model" error in development with hot reloading
 *
 * @param modelName The name of the model
 * @param schemaFactory Function that creates the schema (only called once)
 * @returns A Mongoose model instance
 */
export async function getModel<T>(
  modelName: string,
  schemaFactory: () => mongoose.Schema
): Promise<mongoose.Model<T>> {
  // First check if we already have this model cached
  if (modelCache.has(modelName)) {
    logger.info(`${modelName} Model already cached, reusing`);
    return modelCache.get(modelName) as mongoose.Model<T>;
  }

  // Get MongoDB connection
  const connection = await setupMongo();

  try {
    // Try to get existing model if already registered with Mongoose
    if (connection.modelNames().includes(modelName)) {
      logger.info(`${modelName} Model exists in connection, reusing`);
      const model = connection.model(modelName) as mongoose.Model<T>;
      modelCache.set(modelName, model);
      return model;
    }

    // Get or create schema
    let schema: mongoose.Schema;
    if (!schemaCache.has(modelName)) {
      logger.info(`Creating schema for ${modelName}`);
      schema = schemaFactory();
      schemaCache.set(modelName, schema);
    } else {
      logger.info(`Reusing cached schema for ${modelName}`);
      schema = schemaCache.get(modelName)!;
    }

    // Register the model
    logger.info(`Registering ${modelName} Model`);
    const model = connection.model<T>(modelName, schema);
    modelCache.set(modelName, model);
    return model;
  } catch (error) {
    // If model overwrite error, try to get the existing model
    if (error instanceof Error && error.name === "OverwriteModelError") {
      logger.info(`${modelName} Model already exists (caught error), reusing`);
      const model = connection.model(modelName) as mongoose.Model<T>;
      modelCache.set(modelName, model);
      return model;
    }
    throw error;
  }
}
