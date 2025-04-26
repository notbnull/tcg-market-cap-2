import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { serve } from "inngest/next";
import { updateCardPrices } from "@/inngest/functions/updateCardPrices/updateCardPrices";
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, updateCardPrices],
});
