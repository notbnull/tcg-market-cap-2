import { MongoDbModels } from "@/mongodb";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const { PokemonSetModel } = await MongoDbModels();

  const sets = await PokemonSetModel.find({}).select("name series");
  const condensedSets = sets.map((set) => ({
    _id: set._id,
    name: set.name,
    series: set.series,
    psaPopulationUrl: null,
  }));
  const outputDir = path.join(__dirname, "output");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, "allSets.json");
  fs.writeFileSync(outputFile, JSON.stringify(condensedSets, null, 2));

  console.log(`Wrote ${condensedSets.length} sets to ${outputFile}`);
  process.exit(0);
}

// Self-executing async function to properly await main
(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
