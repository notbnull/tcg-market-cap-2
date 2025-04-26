/**
 * Migration: Remove properties from PokemonCard
 *
 * This migration demonstrates how to remove properties from existing documents
 * in the PokemonCard collection.
 */
import { MongoDbModels } from "../index";
import logger from "@/lib/utils/Logger";

/**
 * Run the migration to remove properties from PokemonCard documents
 */
export async function up(): Promise<void> {
  const { PokemonCardModel } = await MongoDbModels();
  const propertiesToRemove = ["cardmarket", "tcgplayer"];

  logger.info("Removing properties from PokemonCard documents");

  try {
    const collectionName = PokemonCardModel.collection.collectionName;
    const db = PokemonCardModel.db.db;
    const collection = db.collection(collectionName);

    logger.info(`Working with collection: ${collectionName}`);

    const propertyQuery = {
      $or: propertiesToRemove.map((prop) => ({ [prop]: { $exists: true } })),
    };

    const sampleDoc = await collection.findOne(propertyQuery);

    if (sampleDoc) {
      logger.info(
        `Found sample document with properties to remove: ${sampleDoc._id}`
      );
    } else {
      logger.warn(
        `No documents found with properties: ${propertiesToRemove.join(", ")}`
      );
    }

    const unsetObj = propertiesToRemove.reduce<Record<string, string>>(
      (acc, prop) => {
        acc[prop] = "";
        return acc;
      },
      {}
    );

    const updateResult = await collection.updateMany({}, { $unset: unsetObj });

    logger.info(`Updated ${updateResult.modifiedCount} documents`);

    const remainingCount = await collection.countDocuments(propertyQuery);

    if (remainingCount > 0) {
      logger.warn(`${remainingCount} documents still have the properties!`);
    } else {
      logger.info("All properties successfully removed");
    }
  } catch (error) {
    logger.error(`Error in migration: ${error}`);
    throw error;
  }
}
