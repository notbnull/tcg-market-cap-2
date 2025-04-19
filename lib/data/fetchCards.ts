/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "@/lib/utils/Logger";
import { PokemonCard } from "@/mongodb/models/PokemonCard";
import mongoose from "mongoose";

export async function fetchCards({
  page = 1,
  limit = 25,
  sortColumn = "name",
  sortDirection = "asc",
  filter = {},
}: {
  page?: number;
  limit?: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  filter?: Record<string, any>;
}) {
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
    const PokemonCardModel = await PokemonCard.getMongoModel();
    logger.info("Getting PokemonCard Model");

    // Output the collection name to ensure we're querying the right collection
    logger.info(`Collection name: ${PokemonCardModel.collection.name}`);

    const cards = await PokemonCardModel.find(queryFilter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    logger.info(`Fetched ${cards.length} cards`);

    if (cards.length > 0) {
      logger.info(`Sample card: ${JSON.stringify(cards[0])}`);
    } else {
      logger.info("No cards found for this filter");
    }

    const totalCards = await PokemonCardModel.countDocuments(queryFilter);
    logger.info(`Total cards: ${totalCards}`);

    const plainCards = cards.map((card: any) => ({
      ...card,
      _id: card._id.toString(),
      set: card.set.toString(),
      cardmarket: card.cardmarket
        ? {
            ...card.cardmarket,
            _id: card?.cardmarket?._id?.toString() ?? "",
          }
        : undefined,
      tcgplayer: card.tcgplayer
        ? {
            ...card.tcgplayer,
            _id: card?.tcgplayer?._id?.toString() ?? "",
          }
        : undefined,
      images: card.images
        ? {
            ...card.images,
            _id: card?.images?._id?.toString() ?? "",
          }
        : undefined,
    }));

    return { cards: plainCards, totalCards };
  } catch (error) {
    logger.error(`Error fetching cards: ${error}`);
    return { cards: [], totalCards: 0 };
  }
}
