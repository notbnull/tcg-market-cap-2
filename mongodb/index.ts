import ModelRegistry from "./registry";
import { ReturnModelType } from "@typegoose/typegoose";
import { PokemonCard } from "./models/PokemonCard/PokemonCard";
import { PokemonSet } from "./models/PokemonSet/PokemonSet";
import { CardMarketPriceHistory } from "./models/PriceHistory/CardMarketPriceHistory/CardMarketPriceHistory";
import { TCGPlayerPriceHistory } from "./models/PriceHistory/TCGPlayerPriceHistory/TCGPlayerPriceHistory";
import { MigrationHistory } from "./models/MigrationHistory/MigrationHistory";

export const getModelRegistry = () => ModelRegistry.getInstance();

export interface MongoModels {
  PokemonCardModel: ReturnModelType<typeof PokemonCard, object>;
  PokemonSetModel: ReturnModelType<typeof PokemonSet, object>;
  CardMarketPriceHistoryModel: ReturnModelType<
    typeof CardMarketPriceHistory,
    object
  >;
  TCGPlayerPriceHistoryModel: ReturnModelType<
    typeof TCGPlayerPriceHistory,
    object
  >;
  MigrationHistoryModel: ReturnModelType<typeof MigrationHistory, object>;
}

// Cache for the initialized models
let modelsCache: MongoModels | null = null;

/**
 * Get MongoDB models with registry initialization
 * This function ensures models are initialized just once per lifecycle
 * which prevents "OverwriteModelError: Cannot overwrite model once compiled"
 */
export async function MongoDbModels(): Promise<MongoModels> {
  // Return cached models if available
  if (modelsCache) {
    return modelsCache;
  }

  const registry = ModelRegistry.getInstance();

  // Initialize if not already initialized
  if (!registry.isInitialized || !registry.isConnected) {
    await registry.init();
  }

  // Create and cache the models
  modelsCache = {
    PokemonCardModel: registry.PokemonCardModel,
    PokemonSetModel: registry.PokemonSetModel,
    CardMarketPriceHistoryModel: registry.CardMarketPriceHistoryModel,
    TCGPlayerPriceHistoryModel: registry.TCGPlayerPriceHistoryModel,
    MigrationHistoryModel: registry.MigrationHistoryModel,
  };

  return modelsCache;
}
