/* eslint-disable @typescript-eslint/no-explicit-any */
import { PokemonCard } from "@/mongodb/models/PokemonCard";
import { PokemonSet } from "@/mongodb/models/PokemonSet";
import mongoose from "mongoose";

// Helper function to validate and fix image URLs
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
    // MongoDB connection
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pokemon-tcg"
    );
    console.log("Connected to MongoDB");

    console.log("=".repeat(80));
    console.log("STARTING IMAGE URL FIX SCRIPT");
    console.log("=".repeat(80));

    // Get models
    const PokemonSetModel = await PokemonSet.getMongoModel();
    const PokemonCardModel = await PokemonCard.getMongoModel();

    // Fix set image URLs
    console.log("\n🔍 Checking set image URLs...");
    const sets = await PokemonSetModel.find({});
    console.log(`Found ${sets.length} sets to check`);

    let setsFixed = 0;
    const setUpdateOps: any[] = [];

    for (const set of sets) {
      const symbolNeedsUpdate =
        set.images?.symbol && !set.images.symbol.startsWith("http");
      const logoNeedsUpdate =
        set.images?.logo && !set.images.logo.startsWith("http");

      if (symbolNeedsUpdate || logoNeedsUpdate) {
        console.log(
          `⚠️ Set ${set.pokemonTcgApiId} (${set.name}) has invalid image URLs`
        );
        if (symbolNeedsUpdate) console.log(`   Symbol: ${set.images?.symbol}`);
        if (logoNeedsUpdate) console.log(`   Logo: ${set.images?.logo}`);

        setUpdateOps.push({
          updateOne: {
            filter: { _id: set._id },
            update: {
              $set: {
                "images.symbol": symbolNeedsUpdate
                  ? validateImageUrl(set.images?.symbol)
                  : set.images?.symbol,
                "images.logo": logoNeedsUpdate
                  ? validateImageUrl(set.images?.logo)
                  : set.images?.logo,
              },
            },
          },
        });
        setsFixed++;
      }
    }

    if (setUpdateOps.length > 0) {
      console.log(
        `\n🔄 Fixing ${setUpdateOps.length} sets with invalid image URLs`
      );
      const result = await PokemonSetModel.bulkWrite(setUpdateOps);
      console.log(`✅ Successfully updated ${result.modifiedCount} sets`);
    } else {
      console.log("✅ No sets need image URL fixes");
    }

    // Fix card image URLs (in batches to avoid memory issues)
    console.log("\n🔍 Checking card image URLs...");
    const totalCards = await PokemonCardModel.countDocuments();
    console.log(`Found ${totalCards} cards to check`);

    const BATCH_SIZE = 1000;
    let processed = 0;
    let cardsFixed = 0;

    while (processed < totalCards) {
      const cards = await PokemonCardModel.find({})
        .skip(processed)
        .limit(BATCH_SIZE);

      const cardUpdateOps: any[] = [];

      for (const card of cards) {
        const smallNeedsUpdate =
          card.images?.small && !card.images.small.startsWith("http");
        const largeNeedsUpdate =
          card.images?.large && !card.images.large.startsWith("http");

        if (smallNeedsUpdate || largeNeedsUpdate) {
          cardUpdateOps.push({
            updateOne: {
              filter: { _id: card._id },
              update: {
                $set: {
                  "images.small": smallNeedsUpdate
                    ? validateImageUrl(card.images?.small)
                    : card.images?.small,
                  "images.large": largeNeedsUpdate
                    ? validateImageUrl(card.images?.large)
                    : card.images?.large,
                },
              },
            },
          });
          cardsFixed++;
        }
      }

      if (cardUpdateOps.length > 0) {
        console.log(
          `\n🔄 Fixing batch of ${cardUpdateOps.length} cards with invalid image URLs`
        );
        const result = await PokemonCardModel.bulkWrite(cardUpdateOps);
        console.log(`✅ Updated ${result.modifiedCount} cards in this batch`);
      }

      processed += cards.length;
      console.log(
        `Progress: ${processed}/${totalCards} cards processed (${Math.round(
          (processed / totalCards) * 100
        )}%)`
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log("IMAGE URL FIX COMPLETED");
    console.log("=".repeat(80));
    console.log(`📊 Final Statistics:`);
    console.log(`   Total sets fixed: ${setsFixed}`);
    console.log(`   Total cards fixed: ${cardsFixed}`);
    console.log("=".repeat(80));

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
