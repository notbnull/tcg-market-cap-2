import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/app/ui/components/card";
import { PokemonSet } from "@/mongodb/models/PokemonSet";
import { PokemonCard } from "@/mongodb/models/PokemonCard";
import { Button } from "@/app/ui/components/button";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import logger from "@/lib/utils/Logger";
import { env } from "@/env/config";
import setupMongo from "@/mongodb/setup";
import ChartContainer from "@/app/ui/components/charts/chart-container";
import CardThumbnail from "@/app/ui/components/cards/card-thumbnail";

async function getSet(id: string) {
  const PokemonSetModel = await PokemonSet.getMongoModel();
  const set = await PokemonSetModel.findOne({ pokemonTcgApiId: id }).lean();
  logger.info(`Set: ${JSON.stringify(set)}`);
  if (!set) {
    return null;
  }

  return {
    ...set,
    _id: set._id.toString(),
  };
}

async function getCardsBySetId(setId: string) {
  try {
    // Add diagnostics for MongoDB connection
    logger.info("Starting MongoDB diagnostics...");
    logger.info(`Environment MONGODB_DB_NAME: ${env.MONGODB_DB_NAME}`);

    // Get a direct connection
    const directConnection = await setupMongo();
    logger.info(
      `Direct connection db name: ${directConnection.db?.databaseName}`
    );

    // Get the PokemonCard model using the updated getMongoModel method
    const PokemonCardModel = await PokemonCard.getMongoModel();
    logger.info(`Model collection name: ${PokemonCardModel.collection.name}`);
    logger.info(
      `Model collection db: ${PokemonCardModel.collection.conn.db?.databaseName}`
    );

    logger.info(`Looking for cards with set ID: ${setId} (ObjectId: ${setId})`);

    // Check if any cards exist at all
    const totalCardsInCollection =
      await PokemonCardModel.estimatedDocumentCount();
    logger.info(`Total cards in collection: ${totalCardsInCollection}`);

    // Query for cards with the set ID
    const cards = await PokemonCardModel.find({ set: setId })
      .sort({ number: 1 }) // Sort by card number ascending
      .limit(500)
      .collation({ locale: "en", numericOrdering: true }) // Use numeric ordering
      .lean();

    logger.info(`Query returned ${cards.length} cards for this set`);

    if (cards.length > 0) {
      logger.info(`Sample card: ${JSON.stringify(cards[0])}`);
    } else {
      logger.info("No cards found for this set");

      // If we have cards in the collection but none match this set,
      // try to find what set IDs are being used
      if (totalCardsInCollection > 0) {
        const sampleCards = await PokemonCardModel.find({}).limit(5).lean();

        if (sampleCards.length > 0) {
          logger.info("Sample cards from collection:");
          sampleCards.forEach((card, index) => {
            logger.info(
              `Card ${index + 1} - Name: ${card.name}, Set: ${card.set}`
            );
          });
        }
      }
    }

    // Transform the cards to the expected format
    const transformedCards = cards.map((card) => ({
      _id: card._id.toString(),
      pokemonTcgApiId: card.pokemonTcgApiId,
      name: card.name,
      set: card.set ? card.set.toString() : "",
      number: card.number,
      rarity: card.rarity,
      artist: card.artist,
      marketCap: {
        PSA10: (Math.random() * 200 + 50).toFixed(2),
        PSA9: (Math.random() * 100 + 20).toFixed(2),
        Raw: (Math.random() * 50 + 5).toFixed(2),
      }, // Added mock PSA values
      lastSold: `${Math.floor(Math.random() * 30) + 1}d ago`,
      images: card.images
        ? {
            small: card.images.small,
            large: card.images.large,
          }
        : undefined,
    }));

    return { cards: transformedCards, totalCards: cards.length };
  } catch (error) {
    logger.error(`Error in direct card query: ${error}`);
    return { cards: [], totalCards: 0 };
  }
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const set = await getSet(resolvedParams.id);

  if (!set) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set not found</h1>
          <p className="mt-2">
            We couldn&apos;t find the set you&apos;re looking for.
          </p>
          <Link href="/dashboard/catalog">
            <Button className="mt-4">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cardData = await getCardsBySetId(set._id);

  // Mock market data for the set
  const marketData = {
    totalMarketCap: "$1,245,780",
    change24h: 2.4,
    change7d: -1.2,
    change30d: 15.3,
    volume24h: "$42,350",
    highestValueCard: {
      name: cardData.cards[0]?.name || "Unknown",
      value: "$560.25",
    },
  };

  // Generate mock chart data for a month (30 days)
  const mockChartData = Array.from({ length: 30 }, (_, i) => {
    // Start with a base value and add some randomization
    const baseValue = 1200000;
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));

    // Create a somewhat realistic price movement
    const value = baseValue * (1 + Math.sin(i / 3) / 10 + Math.random() * 0.05);

    return {
      date: date.toISOString().split("T")[0],
      value: Math.round(value),
    };
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto py-6 px-6">
        <Link
          href="/dashboard/catalog"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Sets
        </Link>

        {/* Header Section */}
        <div className="mb-10">
          {/* Set Title and Logo */}
          <div className="mb-6">
            {set.images?.logo ? (
              <div className="mb-3">
                <img
                  src={set.images.logo}
                  alt={`${set.name} logo`}
                  className="h-12 object-contain"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold mb-2">{set.name}</h1>
            )}

            <div className="flex items-center gap-3">
              <div className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                {set.series} Series
              </div>
              <div className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                {set.total} cards
              </div>
            </div>
          </div>

          {/* Market Data and Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Market Cap */}
            <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
              <p className="text-gray-400 text-sm mb-1">Market Cap</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl font-bold">
                  {marketData.totalMarketCap}
                </h2>
                <div
                  className={`flex items-center text-sm ${
                    marketData.change24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {marketData.change24h >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(marketData.change24h)}%
                </div>
              </div>
            </div>

            {/* 24h Volume */}
            <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
              <p className="text-gray-400 text-sm mb-1">24h Volume</p>
              <p className="text-2xl font-medium">{marketData.volume24h}</p>
            </div>

            {/* Performance */}
            <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
              <p className="text-gray-400 text-sm mb-2">Performance</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">7d</p>
                <p
                  className={`text-sm font-medium flex items-center ${
                    marketData.change7d >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {marketData.change7d >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(marketData.change7d)}%
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">30d</p>
                <p
                  className={`text-sm font-medium flex items-center ${
                    marketData.change30d >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {marketData.change30d >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(marketData.change30d)}%
                </p>
              </div>
            </div>

            {/* Highest Value Card Section */}
            <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
              <p className="text-gray-400 text-sm mb-2">Highest Value Card</p>
              <div className="flex items-center">
                {cardData.cards[0]?.images?.small && (
                  <CardThumbnail
                    smallImageUrl={cardData.cards[0].images.small}
                    largeImageUrl={cardData.cards[0].images.large}
                    altText={marketData.highestValueCard.name}
                    className="w-8 h-11 mr-3 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs mb-1 truncate">
                    {marketData.highestValueCard.name}
                  </p>
                  <p className="text-green-500 font-semibold text-base">
                    {marketData.highestValueCard.value}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="w-full">
            <ChartContainer data={mockChartData} />
          </div>
        </div>

        {/* Cards List - Vertical Layout */}
        <Card className="border-0 bg-gray-900 shadow-xl">
          <CardContent className="p-0">
            <Suspense
              fallback={<div className="p-6 text-center">Loading cards...</div>}
            >
              <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                {cardData.cards.map((card) => (
                  <div
                    key={card._id}
                    className="relative cursor-pointer hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="p-4 flex items-center">
                      {/* Card Image Thumbnail with Hover using the new component */}
                      {card.images?.small && (
                        <CardThumbnail
                          smallImageUrl={card.images.small}
                          largeImageUrl={card.images.large}
                          altText={card.name}
                          className="mr-4"
                        />
                      )}

                      {/* Card Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="font-medium truncate mr-2">
                            {card.name}
                          </p>
                          <span className="text-xs text-gray-400">
                            #{card.number}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{card.rarity}</p>
                      </div>

                      {/* PSA 10 Value */}
                      <div className="text-right px-3 min-w-[120px]">
                        <p className="text-green-500 font-medium">
                          ${card.marketCap.PSA10}
                        </p>
                        <p className="text-xs text-gray-400">PSA 10</p>
                      </div>

                      {/* Raw Value */}
                      <div className="text-right px-3 min-w-[120px]">
                        <p className="text-blue-400 font-medium">
                          ${card.marketCap.Raw}
                        </p>
                        <p className="text-xs text-gray-400">Raw</p>
                      </div>

                      {/* Last Sold */}
                      <div className="text-right px-3 min-w-[80px]">
                        <p className="text-gray-300 font-medium">
                          {card.lastSold}
                        </p>
                        <p className="text-xs text-gray-400">Last Sold</p>
                      </div>

                      {/* Chevron */}
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
