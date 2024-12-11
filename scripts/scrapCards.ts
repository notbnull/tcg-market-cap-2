// lets scrape the cards from the api and save them to the database
import {PokemonCardModel} from '@/app/mongodb/models/PokemonCard';
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MongoDB URI not found in environment variables");
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

    const { data, count, totalCount } = await response.json();

    return [...data];
  } catch (error) {
    console.error(`Error fetching cards from page ${page}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Fetch all cards
    console.log("Starting to fetch cards...");
    const page = 1;
    const cards = await fetchCards(page);

    // console.log(`Fetched ${cards.length} cards total`);

    // // // Clear existing cards
    // await PokemonCardModel.deleteMany({});
    // console.log("Cleared existing cards from database");

    // Insert new cards
    await PokemonCardModel.insertMany(cards);
    console.log("Successfully inserted all cards into database");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
