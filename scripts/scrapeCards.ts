/* eslint-disable @typescript-eslint/no-explicit-any */
// lets scrape the cards from the api and save them to the database
import { PokemonCard } from "@/app/mongodb/models/PokemonCard";
import mongoose from "mongoose";
import { PokemonSet } from "@/app/mongodb/models/PokemonSet";
import { Types } from "mongoose";

async function main() {
  try {
    let page = 32;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`Fetching cards from page ${page}...`);
      const cards = await fetchCards(page);

      if (cards.length === 0) {
        console.log("No more cards to fetch.");
        hasMorePages = false;
        break;
      }

      console.log(`Fetched ${cards.length} cards from page ${page}`);
      const PokemonCardModel = await PokemonCard.getMongoModel();
      const PokemonSetModel = await PokemonSet.getMongoModel();
      for (const card of cards) {
        await processCard(PokemonCardModel, PokemonSetModel, card);
      }

      console.log(`Finished processing page ${page}`);
      page += 1;
    }

    console.log("Finished processing all pages.");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function fetchCards(page: number): Promise<unknown[]> {
  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?page=${page}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();

    return [...data];
  } catch (error) {
    console.error(`Error fetching cards from page ${page}:`, error);
    throw error;
  }
}

async function processCard(
  pokemonCardModelWithDb: any,
  pokemonSetModelWithDb: any,
  cardData: any
) {
  let set = await pokemonSetModelWithDb.findOne({
    pokemonTcgApiId: cardData.set.id,
  });

  if (!set) {
    set = await pokemonSetModelWithDb.create({
      pokemonTcgApiId: cardData.set.id,
      name: cardData.set.name,
      series: cardData.set.series,
      printedTotal: cardData.set.printedTotal,
      total: cardData.set.total,
      releaseDate: cardData.set.releaseDate,
      images: {
        symbol: cardData.set.images.symbol,
        logo: cardData.set.images.logo,
      },
    });
  }

  const transformedCard = await transformCard(cardData, set._id);

  await pokemonCardModelWithDb.updateOne(
    { pokemonTcgApiId: transformedCard.pokemonTcgApiId },
    { $set: transformedCard },
    { upsert: true }
  );
}

async function transformCard(
  cardData: any,
  setObjectId: Types.ObjectId
): Promise<PokemonCard> {
  const { id, ...rest } = cardData;

  const nationalPokedexNumber = rest.nationalPokedexNumber
    ? rest.nationalPokedexNumbers[0]
    : undefined;

  return {
    pokemonTcgApiId: id,
    ...rest,
    nationalPokedexNumber,
    set: setObjectId,
  };
}

main();
