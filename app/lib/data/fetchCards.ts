/* eslint-disable @typescript-eslint/no-explicit-any */
import { PokemonCard } from "@/app/mongodb/models/PokemonCard";
import logger from "@/app/utils/Logger";

export async function fetchCards({
  page = 1,
  limit = 25,
  sortColumn = "name",
  sortDirection = "asc",
}: {
  page?: number;
  limit?: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}) {
  const sort: { [key: string]: 1 | -1 } = {
    [sortColumn]: sortDirection === "asc" ? 1 : -1,
  };
  logger.info(`Fetching cards with sort: ${sortColumn} ${sortDirection}`);
  const PokemonCardModel = await PokemonCard.getMongoModel();
  logger.info("Getting PokemonCard Model");
  const cards = await PokemonCardModel.find({})
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  logger.info(`Fetched ${cards.length} cards`);
  const totalCards = await PokemonCardModel.countDocuments();
  logger.info(`Total cards: ${totalCards}`);

  const plainCards = cards.map((card: any) => ({
    ...card,
    _id: card._id.toString(),
    set: card.set.toString(),
    cardmarket: {
      ...card.cardmarket,
      _id: card?.cardmarket?._id?.toString() ?? "",
    },
    tcgplayer: {
      ...card.tcgplayer,
      _id: card?.tcgplayer?._id?.toString() ?? "",
    },
    images: {
      ...card.images,
      _id: card?.images?._id?.toString() ?? "",
    },
  }));

  return { cards: plainCards, totalCards };
}
