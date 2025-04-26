import { inngest } from "../../client";
import { MongoDbModels } from "@/mongodb";
import { ReturnModelType } from "@typegoose/typegoose";
import { TCGPlayerPriceHistory } from "@/mongodb/models/PriceHistory/TCGPlayerPriceHistory/TCGPlayerPriceHistory";
import { CardMarketPriceHistory } from "@/mongodb/models/PriceHistory/CardMarketPriceHistory/CardMarketPriceHistory";
import { fetchCards, processBatchedCards, delay } from "./utils";
import { PokemonCardData } from "./types";

export const updateCardPrices = inngest.createFunction(
  { id: "update-card-prices", name: "Update Card Prices" },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ event }) => {
    let totalTCGPlayerUpdates = 0;
    let totalCardMarketUpdates = 0;
    let currentPage = 1;
    let hasMorePages = true;
    const BATCH_SIZE = 5; // Number of pages to process in each batch
    const PROCESSING_BATCH_SIZE = 200; // Cards to process in a batch
    const REQUEST_DELAY = 2000; // Milliseconds to wait between API requests

    // Get models
    const {
      PokemonCardModel,
      TCGPlayerPriceHistoryModel,
      CardMarketPriceHistoryModel,
    } = await MongoDbModels();

    console.log("=".repeat(80));
    console.log("STARTING POKEMON TCG PRICE UPDATE");
    console.log("=".repeat(80));

    while (hasMorePages) {
      const allCards: PokemonCardData[] = [];

      console.log(
        `\n📥 Processing pages ${currentPage} to ${
          currentPage + BATCH_SIZE - 1
        }...`
      );

      // Fetch pages sequentially with delays to avoid rate limits
      for (let i = 0; i < BATCH_SIZE; i++) {
        const pageToFetch = currentPage + i;
        console.log(`Fetching page ${pageToFetch}...`);

        const cards = await fetchCards(pageToFetch);

        if (cards.length === 0) {
          hasMorePages = false;
          break;
        }

        allCards.push(...cards);

        // Add delay between requests to avoid rate limits
        if (i < BATCH_SIZE - 1 && cards.length > 0) {
          console.log(`Waiting ${REQUEST_DELAY}ms before next request...`);
          await delay(REQUEST_DELAY);
        }
      }

      if (allCards.length === 0) {
        console.log("No more cards to fetch.");
        break;
      }

      console.log(`📊 Fetched ${allCards.length} cards total from batch`);

      // Process the batch of cards using optimized bulk operations
      const { tcgPlayerUpdates, cardMarketUpdates } = await processBatchedCards(
        allCards,
        PokemonCardModel,
        TCGPlayerPriceHistoryModel as ReturnModelType<
          typeof TCGPlayerPriceHistory
        >,
        CardMarketPriceHistoryModel as ReturnModelType<
          typeof CardMarketPriceHistory
        >,
        PROCESSING_BATCH_SIZE
      );

      totalTCGPlayerUpdates += tcgPlayerUpdates;
      totalCardMarketUpdates += cardMarketUpdates;

      console.log(
        `\n✅ Finished processing batch of pages ${currentPage} to ${
          currentPage + BATCH_SIZE - 1
        }`
      );
      console.log("-".repeat(50));
      console.log(`📊 Batch Summary:`);
      console.log(`   TCGPlayer price updates: ${tcgPlayerUpdates}`);
      console.log(`   CardMarket price updates: ${cardMarketUpdates}`);
      console.log("-".repeat(50));

      currentPage += BATCH_SIZE;
    }

    console.log("\n" + "=".repeat(80));
    console.log("PRICE UPDATE COMPLETED");
    console.log("=".repeat(80));
    console.log(`📊 Final Statistics:`);
    console.log(`   Total TCGPlayer price updates: ${totalTCGPlayerUpdates}`);
    console.log(`   Total CardMarket price updates: ${totalCardMarketUpdates}`);
    console.log("=".repeat(80));

    return {
      tcgPlayerUpdates: totalTCGPlayerUpdates,
      cardMarketUpdates: totalCardMarketUpdates,
    };
  }
);
