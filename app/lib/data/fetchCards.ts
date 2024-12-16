/* eslint-disable @typescript-eslint/no-explicit-any */
import { PokemonCard } from "@/app/mongodb/models/PokemonCard";

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
  const sort = { [sortColumn]: sortDirection === "asc" ? 1 : -1 };

  const PokemonCardModel = await PokemonCard.getMongoModel();
  const cards = await PokemonCardModel.find({})
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalCards = await PokemonCardModel.countDocuments();

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

  console.log(plainCards);
  console.log(totalCards);

  return { cards: plainCards, totalCards };
}
