/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { Types } from "mongoose";
import { PokemonCard } from "@/mongodb/models/PokemonCard";
import { PokemonSet } from "@/mongodb/models/PokemonSet";

// Define interfaces for better type safety
interface PokemonCardData {
  id: string;
  name: string;
  set: {
    id: string;
    name: string;
  };
  nationalPokedexNumbers?: number[];
  [key: string]: any;
}

interface PokemonSetData {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
  [key: string]: any;
}

interface SetDocument {
  _id: Types.ObjectId;
  pokemonTcgApiId: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
  [key: string]: any;
}

interface SetMetadataStats {
  total: number;
  complete: number;
  missingSymbol: number;
  missingLogo: number;
  missingBoth: number;
}

// Add a helper function to validate and fix image URLs
function validateImageUrl(url: string | undefined): string {
  if (!url) return "";

  // Check if the URL is valid
  try {
    new URL(url);
    return url; // URL is valid
  } catch (e) {
    // Not a valid URL, check if it's a relative path
    if (url.startsWith("/")) {
      return `https://images.pokemontcg.io${url}`;
    }
    // Otherwise, just return empty to avoid broken images
    console.log(`Invalid image URL: ${url}`);
    return "";
  }
}

async function main() {
  try {
    const BATCH_SIZE = 5; // Process multiple pages at once
    let startPage = 1;
    let hasMorePages = true;

    // Cache of known sets to reduce database queries
    const globalSetCache = new Map<string, SetDocument>();

    // Global statistics
    const totalSetsProcessed = 0;
    let totalSetsCreated = 0;
    let totalSetsUpdated = 0;
    let totalCardsProcessed = 0;
    let totalCardsCreated = 0;
    let totalCardsUpdated = 0;

    // Get models once instead of in each iteration
    const PokemonCardModel = await PokemonCard.getMongoModel();
    const PokemonSetModel = await PokemonSet.getMongoModel();

    console.log("=".repeat(80));
    console.log("STARTING POKEMON TCG DATA SCRAPING");
    console.log("=".repeat(80));

    while (hasMorePages) {
      const allCards: PokemonCardData[] = [];
      const pagesToFetch = [];

      // Prepare batch of pages to fetch
      for (let i = 0; i < BATCH_SIZE; i++) {
        pagesToFetch.push(startPage + i);
      }

      console.log(
        `\n📥 Fetching cards from pages ${startPage} to ${
          startPage + BATCH_SIZE - 1
        }...`
      );

      // Fetch multiple pages in parallel
      const cardBatches = await Promise.all(
        pagesToFetch.map((page) => fetchCards(page))
      );

      // Combine all fetched cards
      for (const batch of cardBatches) {
        if (batch.length === 0) {
          hasMorePages = false;
        } else {
          allCards.push(...batch);
        }
      }

      if (allCards.length === 0) {
        console.log("No more cards to fetch.");
        break;
      }

      totalCardsProcessed += allCards.length;
      console.log(`📊 Fetched ${allCards.length} cards total from batch`);

      // Process all cards from multiple pages at once
      const { setsCreated, setsUpdated, cardsCreated, cardsUpdated } =
        await processCardsBatch(
          PokemonCardModel,
          PokemonSetModel,
          allCards,
          globalSetCache
        );

      totalSetsCreated += setsCreated;
      totalSetsUpdated += setsUpdated;
      totalCardsCreated += cardsCreated;
      totalCardsUpdated += cardsUpdated;

      console.log(
        `\n✅ Finished processing batch of pages ${startPage} to ${
          startPage + BATCH_SIZE - 1
        }`
      );
      console.log("-".repeat(50));
      console.log(`📊 Batch Summary:`);
      console.log(`   Sets created: ${setsCreated}`);
      console.log(`   Sets updated: ${setsUpdated}`);
      console.log(`   Cards created: ${cardsCreated}`);
      console.log(`   Cards updated: ${cardsUpdated}`);
      console.log(`   Sets in cache: ${globalSetCache.size}`);
      console.log("-".repeat(50));

      startPage += BATCH_SIZE;
    }

    console.log("\n" + "=".repeat(80));
    console.log("SCRAPING COMPLETED");
    console.log("=".repeat(80));
    console.log(`📊 Final Statistics:`);
    console.log(`   Total sets processed: ${totalSetsProcessed}`);
    console.log(`   Total sets created: ${totalSetsCreated}`);
    console.log(`   Total sets updated: ${totalSetsUpdated}`);
    console.log(`   Total cards processed: ${totalCardsProcessed}`);
    console.log(`   Total cards created: ${totalCardsCreated}`);
    console.log(`   Total cards updated: ${totalCardsUpdated}`);
    console.log(`   Total sets in cache: ${globalSetCache.size}`);
    console.log("=".repeat(80));

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function fetchCards(page: number): Promise<PokemonCardData[]> {
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

    return data as PokemonCardData[];
  } catch (error) {
    console.error(`Error fetching cards from page ${page}:`, error);
    // Return empty array instead of throwing to handle page errors gracefully
    return [];
  }
}

async function processCardsBatch(
  pokemonCardModelWithDb: any,
  pokemonSetModelWithDb: any,
  cards: PokemonCardData[],
  globalSetCache: Map<string, SetDocument>
): Promise<{
  setsCreated: number;
  setsUpdated: number;
  cardsCreated: number;
  cardsUpdated: number;
}> {
  // Extract unique sets from cards
  const setMap = new Map<string, PokemonSetData>();
  cards.forEach((card) => {
    if (!setMap.has(card.set.id)) {
      setMap.set(card.set.id, card.set as unknown as PokemonSetData);
    }
  });

  console.log(`\n🔍 Processing ${setMap.size} unique sets from current batch`);

  // Analyze set metadata completeness
  const setStats: SetMetadataStats = {
    total: setMap.size,
    complete: 0,
    missingSymbol: 0,
    missingLogo: 0,
    missingBoth: 0,
  };

  for (const setData of setMap.values()) {
    const hasSymbol = setData.images?.symbol ? true : false;
    const hasLogo = setData.images?.logo ? true : false;

    if (hasSymbol && hasLogo) {
      setStats.complete++;
    } else if (!hasSymbol && !hasLogo) {
      setStats.missingBoth++;
    } else if (!hasSymbol) {
      setStats.missingSymbol++;
    } else if (!hasLogo) {
      setStats.missingLogo++;
    }
  }

  console.log(`📊 Set Metadata Analysis:`);
  console.log(
    `   Complete sets: ${setStats.complete}/${setStats.total} (${Math.round(
      (setStats.complete / setStats.total) * 100
    )}%)`
  );
  if (setStats.missingSymbol > 0)
    console.log(`   Missing symbol only: ${setStats.missingSymbol}`);
  if (setStats.missingLogo > 0)
    console.log(`   Missing logo only: ${setStats.missingLogo}`);
  if (setStats.missingBoth > 0)
    console.log(`   Missing both symbol and logo: ${setStats.missingBoth}`);

  // Get all set IDs that aren't in our global cache
  const uncachedSetIds = Array.from(setMap.keys()).filter(
    (id) => !globalSetCache.has(id)
  );

  if (uncachedSetIds.length > 0) {
    console.log(
      `🔍 Checking database for ${uncachedSetIds.length} uncached sets`
    );
    // Find existing sets in batch
    const existingSets = await pokemonSetModelWithDb.find({
      pokemonTcgApiId: { $in: uncachedSetIds },
    });

    console.log(
      `   Found ${existingSets.length} sets in database, ${
        uncachedSetIds.length - existingSets.length
      } are new`
    );

    // Add found sets to the global cache
    existingSets.forEach((set: SetDocument) => {
      globalSetCache.set(set.pokemonTcgApiId, set);
    });
  } else {
    console.log(`✅ All sets in this batch are already in cache`);
  }

  // Prepare sets to be created and updates for incomplete sets
  const setsToCreate = [];
  const setUpdateOperations = [];
  const incompleteSetLogs: string[] = [];

  for (const [setId, setData] of setMap.entries()) {
    const hasCompleteImages =
      setData.images && setData.images.symbol && setData.images.logo;

    const setDisplayName = `${setData.id} (${setData.name})`;

    if (!hasCompleteImages) {
      const missingParts = [];
      if (!setData.images?.symbol) missingParts.push("symbol");
      if (!setData.images?.logo) missingParts.push("logo");

      incompleteSetLogs.push(
        `   ⚠️ Set ${setDisplayName} missing: ${missingParts.join(", ")}`
      );
    }

    if (!globalSetCache.has(setId)) {
      setsToCreate.push({
        pokemonTcgApiId: setData.id,
        name: setData.name,
        series: setData.series,
        printedTotal: setData.printedTotal,
        total: setData.total,
        releaseDate: setData.releaseDate,
        images: {
          symbol: validateImageUrl(setData.images?.symbol),
          logo: validateImageUrl(setData.images?.logo),
        },
      });
    } else {
      // Check if existing set needs image update
      const existingSet = globalSetCache.get(setId)!;
      const needsImageUpdate =
        existingSet.images &&
        (!existingSet.images.symbol || !existingSet.images.logo) &&
        hasCompleteImages;

      if (needsImageUpdate) {
        const updatingFields = [];
        if (existingSet.images?.symbol === undefined && setData.images?.symbol)
          updatingFields.push("symbol");
        if (existingSet.images?.logo === undefined && setData.images?.logo)
          updatingFields.push("logo");

        console.log(
          `   🔄 Updating set ${setDisplayName} with missing ${updatingFields.join(
            ", "
          )}`
        );

        setUpdateOperations.push({
          updateOne: {
            filter: { _id: existingSet._id },
            update: {
              $set: {
                "images.symbol": validateImageUrl(setData.images?.symbol),
                "images.logo": validateImageUrl(setData.images?.logo),
              },
            },
          },
        });
      }
    }
  }

  // Display logs for incomplete sets
  if (incompleteSetLogs.length > 0) {
    console.log(
      `\n⚠️ Found ${incompleteSetLogs.length} sets with incomplete metadata:`
    );
    incompleteSetLogs.slice(0, 10).forEach((log) => console.log(log));
    if (incompleteSetLogs.length > 10) {
      console.log(
        `   ... and ${
          incompleteSetLogs.length - 10
        } more sets with incomplete data`
      );
    }
  }

  // Create new sets in batch
  let setsCreated = 0;
  if (setsToCreate.length > 0) {
    console.log(`\n📝 Creating ${setsToCreate.length} new sets`);
    try {
      const createdSets = await pokemonSetModelWithDb.insertMany(setsToCreate);
      setsCreated = createdSets.length;

      createdSets.forEach((set: SetDocument) => {
        globalSetCache.set(set.pokemonTcgApiId, set);
      });
      console.log(`✅ Successfully created ${createdSets.length} new sets`);
    } catch (error: any) {
      console.error(`❌ Error creating sets: ${error.message}`);

      // Log detailed information about the set data
      if (error.name === "ValidationError" && error.errors) {
        console.log("\n🔍 Set validation error details:");
        Object.keys(error.errors).forEach((field) => {
          console.log(`   - ${field}: ${error.errors[field].message}`);
        });

        // Show example of a problematic set - both original and transformed
        if (setsToCreate.length > 0) {
          console.log("\n📋 Original set data from API (first set):");
          const originalSetId = setsToCreate[0].pokemonTcgApiId;
          const originalSet = Array.from(setMap.values()).find(
            (s) => s.id === originalSetId
          );

          console.log(
            JSON.stringify(originalSet, null, 2).substring(0, 500) +
              (JSON.stringify(originalSet, null, 2).length > 500 ? "..." : "")
          );

          console.log("\n📋 Transformed set data (first set):");
          console.log(
            JSON.stringify(setsToCreate[0], null, 2).substring(0, 500) +
              (JSON.stringify(setsToCreate[0], null, 2).length > 500
                ? "..."
                : "")
          );
        }
      }
    }
  }

  // Update sets with incomplete images in batch
  let setsUpdated = 0;
  if (setUpdateOperations.length > 0) {
    console.log(
      `\n🔄 Updating ${setUpdateOperations.length} sets with missing images`
    );
    const bulkResult = await pokemonSetModelWithDb.bulkWrite(
      setUpdateOperations
    );
    setsUpdated = bulkResult.modifiedCount || setUpdateOperations.length;

    console.log(
      `✅ Successfully updated ${setsUpdated} sets with missing images`
    );
  }

  // Get all card IDs to check for existing cards
  const cardIds = cards.map((card) => card.id);

  // Find existing cards in batch
  console.log(`\n🔍 Checking for existing cards among ${cardIds.length} cards`);
  const existingCards = await pokemonCardModelWithDb.find({
    pokemonTcgApiId: { $in: cardIds },
  });

  // Create map of existing card IDs for quick lookup
  const existingCardMap = new Map();
  existingCards.forEach((card: any) => {
    existingCardMap.set(card.pokemonTcgApiId, card);
  });

  console.log(
    `   Found ${existingCards.length} existing cards, ${
      cardIds.length - existingCards.length
    } are new`
  );

  // Prepare new cards to be created and updates for existing cards
  const newCards = [];
  const cardUpdateOperations = [];
  const missingSetWarnings = new Set<string>();
  let cardsUpdated = 0;

  for (const card of cards) {
    // Get the correct set from our cache
    const set = globalSetCache.get(card.set.id);
    if (!set) {
      missingSetWarnings.add(`${card.set.id} (${card.set.name})`);
      continue;
    }

    if (!existingCardMap.has(card.id)) {
      // Card doesn't exist, add a new one
      const transformedCard = await transformCard(card, set._id);
      newCards.push(transformedCard);
    } else {
      // Card exists, check if set needs updating
      const existingCard = existingCardMap.get(card.id);

      // Compare ObjectId strings since direct equality comparison may not work
      if (
        !existingCard.set ||
        existingCard.set.toString() !== set._id.toString()
      ) {
        console.log(
          `🔄 Updating card ${card.id} (${card.name}): set reference from ${
            existingCard.set || "missing"
          } to ${set._id}`
        );

        cardUpdateOperations.push({
          updateOne: {
            filter: { _id: existingCard._id },
            update: { $set: { set: set._id } },
          },
        });

        cardsUpdated++;
      }
    }
  }

  // Log missing set warnings if any
  if (missingSetWarnings.size > 0) {
    console.log(
      `\n⚠️ WARNING: Could not find the following sets in the database:`
    );
    Array.from(missingSetWarnings).forEach((setName) => {
      console.log(`   - ${setName}`);
    });
    console.log(
      `   ${missingSetWarnings.size} cards were skipped due to missing sets`
    );
  }

  // Create new cards in batch
  let cardsCreated = 0;
  if (newCards.length > 0) {
    console.log(`\n📝 Adding ${newCards.length} new cards`);
    try {
      const insertResult = await pokemonCardModelWithDb.insertMany(newCards, {
        rawResult: true,
        ordered: false, // Continue processing remaining cards even if some fail
      });
      cardsCreated = insertResult.insertedCount || newCards.length;

      console.log(`✅ Successfully added ${cardsCreated} new cards`);
    } catch (error: any) {
      // Check if it's a bulk write error with some successful inserts
      if (error.writeErrors && error.insertedDocs) {
        console.log(
          `⚠️ Partially successful card insertion: ${error.insertedDocs.length} added, ${error.writeErrors.length} failed`
        );
        cardsCreated = error.insertedDocs.length;

        // Log sample of validation errors to help debug
        if (error.writeErrors.length > 0) {
          console.log("\n🔍 Sample validation errors:");
          error.writeErrors.slice(0, 3).forEach((err: any, index: number) => {
            console.log(`   Error ${index + 1}: ${err.errmsg || err.message}`);

            // Try to extract card ID from error message to find the original card
            const cardIdMatch = (err.errmsg || err.message).match(
              /pokemonTcgApiId: "(.*?)"/
            );
            if (cardIdMatch && cardIdMatch[1]) {
              const cardId = cardIdMatch[1];
              const originalCard = cards.find((c) => c.id === cardId);
              if (originalCard) {
                console.log(
                  `\n📋 Original card data from API for failed card (${cardId}):`
                );
                console.log(
                  JSON.stringify(originalCard, null, 2).substring(0, 500) +
                    (JSON.stringify(originalCard, null, 2).length > 500
                      ? "..."
                      : "")
                );
              }
            }
          });
          if (error.writeErrors.length > 3) {
            console.log(
              `   ... and ${error.writeErrors.length - 3} more errors`
            );
          }
        }
      } else {
        // Regular error
        console.error("❌ Error adding cards:", error.message);

        // If it's a validation error, show details about the schema issues
        if (error.name === "ValidationError" && error.errors) {
          console.log("\n🔍 Validation error details:");
          Object.keys(error.errors).forEach((field) => {
            console.log(`   - ${field}: ${error.errors[field].message}`);
          });

          // Show example of a problematic card - both original and transformed
          const sampleCard = newCards[0];
          const cardId = sampleCard.pokemonTcgApiId;
          const originalCard = cards.find((c) => c.id === cardId);

          console.log("\n📋 Original card data from API:");
          console.log(
            JSON.stringify(originalCard, null, 2).substring(0, 500) +
              (JSON.stringify(originalCard, null, 2).length > 500 ? "..." : "")
          );

          console.log("\n📋 Transformed card data:");
          console.log(
            JSON.stringify(sampleCard, null, 2).substring(0, 500) +
              (JSON.stringify(sampleCard, null, 2).length > 500 ? "..." : "")
          );
        }
      }
    }
  } else {
    console.log(`\n✅ No new cards to add from this batch`);
  }

  // Update existing cards with correct set references
  if (cardUpdateOperations.length > 0) {
    console.log(
      `\n🔄 Updating ${cardUpdateOperations.length} cards with correct set references`
    );
    try {
      const updateResult = await pokemonCardModelWithDb.bulkWrite(
        cardUpdateOperations
      );
      cardsUpdated = updateResult.modifiedCount || cardUpdateOperations.length;
      console.log(
        `✅ Successfully updated ${cardsUpdated} cards with correct set references`
      );
    } catch (error: any) {
      console.error(`❌ Error updating cards: ${error.message}`);
      // Log detailed information about the error
      console.log(error);
    }
  } else {
    console.log(`\n✅ All existing cards have correct set references`);
  }

  return { setsCreated, setsUpdated, cardsCreated, cardsUpdated };
}

async function transformCard(
  cardData: PokemonCardData,
  setObjectId: Types.ObjectId
): Promise<any> {
  const { id, ...rest } = cardData;

  const nationalPokedexNumber = rest.nationalPokedexNumbers
    ? rest.nationalPokedexNumbers[0]
    : undefined;

  // Log missing required fields for debugging
  const requiredFields = ["name", "artist", "number", "rarity", "supertype"];
  const missingFields = requiredFields.filter((field) => !rest[field]);
  if (missingFields.length > 0) {
    console.log(
      `⚠️ Card ${id} missing required fields: ${missingFields.join(", ")}`
    );
  }

  // Handle potentially missing fields and validate image URLs
  const transformedCard = {
    pokemonTcgApiId: id,
    ...rest,
    nationalPokedexNumber,
    set: setObjectId,
    artist: rest.artist || "Unknown",
    number: rest.number || "0",
    rarity: rest.rarity || "Unknown",
    supertype: rest.supertype || "Unknown",
    images: {
      small: validateImageUrl(rest.images?.small),
      large: validateImageUrl(rest.images?.large),
    },
  };

  return transformedCard;
}

main();
