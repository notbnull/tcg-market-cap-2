import ModelRegistry from "./registry";
import { ReturnModelType } from "@typegoose/typegoose";
import { PokemonCard } from "./models/PokemonCard/PokemonCard";
import { PokemonSet } from "./models/PokemonSet/PokemonSet";

export const getModelRegistry = () => ModelRegistry.getInstance();

export interface MongoModels {
  PokemonCardModel: ReturnModelType<typeof PokemonCard, object>;
  PokemonSetModel: ReturnModelType<typeof PokemonSet, object>;
}

export async function MongoDbModels(): Promise<MongoModels> {
  const registry = ModelRegistry.getInstance();

  // Initialize if not already initialized
  if (!registry.isInitialized || !registry.isConnected) {
    await registry.init();
  }

  return {
    PokemonCardModel: registry.PokemonCardModel,
    PokemonSetModel: registry.PokemonSetModel,
  };
}
