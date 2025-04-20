/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "@/lib/utils/Logger";
import mongoose from "mongoose";
import { MongoDbModels } from "@/mongodb";
interface QueryOptions {
  page?: number;
  limit?: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  filter?: Record<string, any>;
}

export async function fetchCards({
  page = 1,
  limit = 25,
  sortColumn = "name",
  sortDirection = "asc",
  filter = {},
}: QueryOptions) {
  const sort: { [key: string]: 1 | -1 } = {
    [sortColumn]: sortDirection === "asc" ? 1 : -1,
  };
  logger.info(`Fetching cards with sort: ${sortColumn} ${sortDirection}`);

  // Convert string _id to ObjectId if it's a set filter
  const queryFilter = { ...filter };
  if (queryFilter.set && typeof queryFilter.set === "string") {
    try {
      queryFilter.set = new mongoose.Types.ObjectId(queryFilter.set);
      logger.info(`Converted set ID ${filter.set} to ObjectId`);
    } catch (error) {
      logger.error(`Failed to convert set ID to ObjectId: ${error}`);
    }
  }

  logger.info(`Query filter: ${JSON.stringify(queryFilter)}`);

  try {
    const { PokemonCardModel } = await MongoDbModels();
    // Output the collection name to ensure we're querying the right collection
    logger.info(`Collection name: ${PokemonCardModel.collection.name}`);

    // Get total count first
    const totalCards = await PokemonCardModel.countDocuments(queryFilter);
    logger.info(`Total cards: ${totalCards}`);

    // Then fetch the cards
    const cards = await PokemonCardModel.find(queryFilter)
      .sort(sort)
      .populate("set")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: true });

    logger.info(`Fetched ${cards.length} cards`);

    if (cards.length > 0) {
      logger.info(`Sample card: ${JSON.stringify(cards[0])}`);
    } else {
      logger.info("No cards found for this filter");
    }

    // Convert mongoose ObjectIds to strings using JSON serialization
    const plainCards = JSON.parse(JSON.stringify(cards));

    return { cards: plainCards, totalCards };
  } catch (error) {
    logger.error(`Error fetching cards: ${error}`);
    return { cards: [], totalCards: 0 };
  }
}
