"use server";

import { inngest } from "../../client";
import { fetchPsaPopulation } from "./utils";

/**
 * Updates PSA population data for Pokémon cards
 */
export const updatePsaPopulation = inngest.createFunction(
  { id: "update-psa-population", name: "Update PSA Population" },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ event }) => {
    try {
      // Example: Fetch PSA population for Neo Discovery set
      const url =
        "https://www.psacard.com/pop/tcg-cards/1999/pokemon-jungle/58977";

      console.log(`Fetching PSA population data for url ${url}`);
      const psaData = await fetchPsaPopulation(url);

      // Validate response data
      if (!psaData || !psaData.data || !Array.isArray(psaData.data)) {
        console.error("Invalid response format from PSA scraping:", psaData);
        return {
          success: false,
          error: "Invalid response format from PSA scraping",
          receivedData: psaData,
        };
      }

      console.log(
        `Successfully retrieved ${psaData.data.length} PSA population records`
      );

      // Log some example data to verify
      if (psaData.data.length > 0) {
        console.log("Example card data:", psaData.data[0]);
      }

      return {
        success: true,
        message: `Successfully fetched PSA population data for ${psaData.data.length} cards`,
        sample: psaData.data.slice(0, 3), // Return first 3 cards as sample
      };
    } catch (error) {
      console.error("Error fetching PSA population:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
);
