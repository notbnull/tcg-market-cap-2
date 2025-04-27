/**
 * Test script for PSA population scraper
 * Tests the ability to paginate through PSA population data
 *
 * Usage:
 *   npx tsx scripts/test-psa-scraper.ts [set-index]
 *   npx tsx scripts/test-psa-scraper.ts --list (show available sets)
 */

import {
  fetchPsaPopulation,
  PsaPopulationCard,
} from "../inngest/functions/updatePsaPopulation/utils";

interface TestSet {
  name: string;
  url: string;
}

async function main() {
  try {
    console.log("Starting PSA population scraper test...");

    // Test sets that should have enough records to test pagination
    const testSets: TestSet[] = [
      {
        name: "Pokemon Neo Discovery",
        url: "https://www.psacard.com/pop/tcg-cards/2000/pokemon-neo-discovery/60078",
      },
    ];

    // Check for --list argument
    if (process.argv.includes("--list")) {
      console.log("\nAvailable test sets:");
      testSets.forEach((set, index) => {
        console.log(`  ${index}: ${set.name} (URL: ${set.url})`);
      });
      return;
    }

    // Default to first test set if no arguments provided
    let targetSet = testSets[0];

    // Allow command line arguments to specify which set to test
    const setArg = process.argv[2];
    if (setArg && !isNaN(parseInt(setArg, 10))) {
      const setIndex = parseInt(setArg, 10);
      if (setIndex >= 0 && setIndex < testSets.length) {
        targetSet = testSets[setIndex];
      } else {
        console.log(
          `Invalid set index ${setIndex}, using default: ${targetSet.name}`
        );
        console.log(`Run with --list to see available sets`);
      }
    }

    console.log(`Testing with set: ${targetSet.name} (URL: ${targetSet.url})`);
    console.log(`Fetching PSA data for set ${targetSet.url}...`);

    const startTime = Date.now();
    const response = await fetchPsaPopulation(targetSet.url);
    const duration = (Date.now() - startTime) / 1000;

    console.log("\n===================== RESULTS =====================");
    console.log(`Set: ${targetSet.name}`);
    console.log(`Total records: ${response.recordsTotal}`);
    console.log(`Records fetched: ${response.data.length}`);
    console.log(`Time taken: ${duration.toFixed(2)} seconds`);

    // Calculate success rate
    const successPercentage =
      response.data.length > 0
        ? ((response.data.length / response.recordsTotal) * 100).toFixed(2)
        : "0.00";
    console.log(`Success rate: ${successPercentage}%`);

    // Count unique variants
    const variants = new Set<string>();
    (response.data as PsaPopulationCard[]).forEach((card) => {
      if (card.variant) variants.add(card.variant);
    });
    console.log(
      `Variant types found: ${
        variants.size > 0 ? Array.from(variants).join(", ") : "None"
      }`
    );

    // Log some sample data
    if (response.data.length > 0) {
      console.log("\nSample data (first 5 records):");
      const sampleData = response.data.slice(0, 5);
      sampleData.forEach((card, index) => {
        console.log(
          `[${index + 1}] Card: ${card.description}${
            card.variant ? ` (${card.variant})` : ""
          }, Number: ${card.certification_number}, Population: ${
            card.population
          }`
        );
      });

      // Also show a middle and end record if available
      if (response.data.length > 10) {
        const middleIndex = Math.floor(response.data.length / 2);
        console.log(`\nMiddle record (#${middleIndex + 1}):`);
        const middleCard = response.data[middleIndex];
        console.log(
          `Card: ${middleCard.description}${
            middleCard.variant ? ` (${middleCard.variant})` : ""
          }, Number: ${middleCard.certification_number}, Population: ${
            middleCard.population
          }`
        );
      }

      if (response.data.length > 5) {
        console.log(`\nLast record (#${response.data.length}):`);
        const lastCard = response.data[response.data.length - 1];
        console.log(
          `Card: ${lastCard.description}${
            lastCard.variant ? ` (${lastCard.variant})` : ""
          }, Number: ${lastCard.certification_number}, Population: ${
            lastCard.population
          }`
        );
      }
    }

    console.log("\nTest completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error running PSA scraper test:", error);
    process.exit(1);
  }
}

main().catch(console.error);
