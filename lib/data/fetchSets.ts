import logger from "@/lib/utils/Logger";
import type { PokemonSet as PokemonSetType } from "@/lib/types";
import { MongoDbModels } from "@/mongodb";

export async function fetchSets({
  page = 1,
  limit = 12,
  sortColumn = "releaseDate",
  sortDirection = "desc",
  query = "",
}: {
  page?: number;
  limit?: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  query?: string;
}) {
  const sort: { [key: string]: 1 | -1 } = {
    [sortColumn]: sortDirection === "asc" ? 1 : -1,
  };
  logger.info(`Fetching sets with sort: ${sortColumn} ${sortDirection}`);

  const filter: { [key: string]: unknown } = {};
  if (query) {
    filter.name = { $regex: query, $options: "i" };
    logger.info(`Searching sets with name matching: ${query}`);
  }

  const { PokemonSetModel } = await MongoDbModels();
  const sets = await PokemonSetModel.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  logger.info(`Fetched ${sets.length} sets`);

  const totalSets = await PokemonSetModel.countDocuments(filter);
  logger.info(`Total sets: ${totalSets}`);

  const plainSets = sets.map((set) => ({
    _id: set._id.toString(),
    pokemonTcgApiId: set.pokemonTcgApiId,
    name: set.name,
    series: set.series,
    printedTotal: set.printedTotal,
    total: set.total,
    releaseDate: set.releaseDate,
    images: {
      _id: "", // MongoDB doesn't store _id for nested objects when using lean()
      symbol: set.images?.symbol ?? "",
      logo: set.images?.logo ?? "",
    },
  }));

  return { sets: plainSets as PokemonSetType[], totalSets };
}
