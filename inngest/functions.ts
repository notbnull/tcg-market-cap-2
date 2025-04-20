import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const scrapPokemonCardMetadata = inngest.createFunction(
  { id: "scrap-pokemon-card-metadata" },
  { event: "scrap/pokemon-card-metadata" },
  async ({ event, step }) => {
    const pokemonCardMetadata = await step.run(
      "scrap-pokemon-card-metadata",
      async () => {
        const response = await fetch("https://api.pokemontcg.io/v2/cards");
        const data = await response.json();
        return data;
      }
    );

    return pokemonCardMetadata;
  }
);

export const connectToMongo = inngest.createFunction(
  { id: "connect-to-mongo" },
  { event: "connect/to-mongo" },
  async ({ event, step }) => {
    const { MongoDbModels } = await import("@/mongodb");
    const { PokemonCardModel, PokemonSetModel } = await MongoDbModels();
    return {
      PokemonCardModel,
      PokemonSetModel,
    };
  }
);
