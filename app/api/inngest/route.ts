import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { serve } from "inngest/next";
import { updateCardPrices } from "@/inngest/functions/updateCardPrices/updateCardPrices";
// Temporarily removing the puppeteer-based function that's causing build issues
// import { updatePsaPopulation } from "@/inngest/functions/updatePsaPopulation/updatePsaPopulation";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, updateCardPrices], // Removed updatePsaPopulation
});
