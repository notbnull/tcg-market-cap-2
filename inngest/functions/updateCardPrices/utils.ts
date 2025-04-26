// Define interfaces for better type safety

import { PokemonCard } from "@/mongodb/models/PokemonCard/PokemonCard";
import { CardMarketPriceHistory } from "@/mongodb/models/PriceHistory/CardMarketPriceHistory/CardMarketPriceHistory";
import { TCGPlayerPriceHistory } from "@/mongodb/models/PriceHistory/TCGPlayerPriceHistory/TCGPlayerPriceHistory";
import { ReturnModelType } from "@typegoose/typegoose";
import { PokemonCardData, CardDocument } from "./types";

/**
 * Utility function to create a delay
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches cards from the PokemonTCG API with retry logic and exponential backoff
 */
export async function fetchCards(
  page: number,
  retries = 3,
  initialBackoff = 1000
): Promise<PokemonCardData[]> {
  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?page=${page}`,
      {
        method: "GET",
        // Add API key header if available
        headers: process.env.POKEMON_TCG_API_KEY
          ? { "X-Api-Key": process.env.POKEMON_TCG_API_KEY }
          : undefined,
      }
    );

    // If rate limited, implement exponential backoff
    if (response.status === 429 && retries > 0) {
      const backoffTime = initialBackoff * Math.pow(2, 3 - retries);
      console.warn(
        `Rate limited for page ${page}. Retrying in ${backoffTime}ms...`
      );
      await delay(backoffTime);
      return fetchCards(page, retries - 1, initialBackoff);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data as PokemonCardData[];
  } catch (error) {
    console.error(`Error fetching cards from page ${page}:`, error);
    return [];
  }
}

export async function processCardBatch(
  cards: PokemonCardData[],
  pokemonCardModel: ReturnModelType<typeof PokemonCard>,
  tcgPlayerPriceHistoryModel: ReturnModelType<typeof TCGPlayerPriceHistory>,
  cardMarketPriceHistoryModel: ReturnModelType<typeof CardMarketPriceHistory>
) {
  const cardIds = cards.map((card) => card.id);

  console.log(`🔍 Looking up ${cardIds.length} cards in database`);

  // Find existing cards in the database
  const existingCards = await pokemonCardModel.find({
    pokemonTcgApiId: { $in: cardIds },
  });

  console.log(`✅ Found ${existingCards.length} cards in database`);

  // Create map of existing cards for quick lookup
  const cardMap = new Map<string, CardDocument>();
  existingCards.forEach((card: CardDocument) => {
    cardMap.set(card.pokemonTcgApiId, card);
  });

  const tcgPlayerDocuments = [];
  const cardMarketDocuments = [];

  // Prepare operations for each card
  for (const card of cards) {
    // Skip cards that don't exist in our database
    if (!cardMap.has(card.id)) {
      continue;
    }

    const cardDoc = cardMap.get(card.id)!;

    // Process TCGPlayer prices if available
    if (
      card.tcgplayer &&
      card.tcgplayer.prices &&
      Object.keys(card.tcgplayer.prices).length > 0
    ) {
      tcgPlayerDocuments.push({
        card: cardDoc._id,
        lastDayUpdated: card.tcgplayer.updatedAt,
        url: card.tcgplayer.url,
        price: card.tcgplayer.prices,
      });
    }

    // Process Cardmarket prices if available
    if (
      card?.cardmarket &&
      card?.cardmarket?.prices &&
      Object.keys(card?.cardmarket?.prices)?.length > 0
    ) {
      cardMarketDocuments.push({
        card: cardDoc._id,
        lastDayUpdated: card.cardmarket.updatedAt,
        url: card.cardmarket.url,
        prices: card.cardmarket.prices,
      });
    }
  }

  let tcgPlayerUpdates = 0;
  let cardMarketUpdates = 0;

  // Bulk insert TCGPlayer price history documents
  if (tcgPlayerDocuments.length > 0) {
    try {
      const result = await tcgPlayerPriceHistoryModel.insertMany(
        tcgPlayerDocuments
      );
      tcgPlayerUpdates = result.length;
    } catch (error) {
      console.error(`Error bulk saving TCGPlayer prices:`, error);
    }
  }

  // Bulk insert CardMarket price history documents
  if (cardMarketDocuments.length > 0) {
    try {
      const result = await cardMarketPriceHistoryModel.insertMany(
        cardMarketDocuments
      );
      cardMarketUpdates = result.length;
    } catch (error) {
      console.error(`Error bulk saving CardMarket prices:`, error);
    }
  }

  return { tcgPlayerUpdates, cardMarketUpdates };
}

/**
 * Processes cards in batches to optimize database operations
 */
export async function processBatchedCards(
  allCards: PokemonCardData[],
  pokemonCardModel: ReturnModelType<typeof PokemonCard>,
  tcgPlayerPriceHistoryModel: ReturnModelType<typeof TCGPlayerPriceHistory>,
  cardMarketPriceHistoryModel: ReturnModelType<typeof CardMarketPriceHistory>,
  batchSize = 100
) {
  let totalTCGPlayerUpdates = 0;
  let totalCardMarketUpdates = 0;

  // Process cards in smaller batches to avoid memory issues
  for (let i = 0; i < allCards.length; i += batchSize) {
    const cardBatch = allCards.slice(i, i + batchSize);

    const { tcgPlayerUpdates, cardMarketUpdates } = await processCardBatch(
      cardBatch,
      pokemonCardModel,
      tcgPlayerPriceHistoryModel,
      cardMarketPriceHistoryModel
    );

    totalTCGPlayerUpdates += tcgPlayerUpdates;
    totalCardMarketUpdates += cardMarketUpdates;

    console.log(
      `Processed batch ${i / batchSize + 1}/${Math.ceil(
        allCards.length / batchSize
      )}`
    );
  }

  return {
    tcgPlayerUpdates: totalTCGPlayerUpdates,
    cardMarketUpdates: totalCardMarketUpdates,
  };
}
