import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/app/ui/components/card";
import { Button } from "@/app/ui/components/button";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import logger from "@/lib/utils/Logger";
import ChartContainer from "@/app/ui/components/charts/chart-container";
import { MongoDbModels } from "@/mongodb";
// Define types for our card data
interface CardMarketCap {
  PSA10: string;
  PSA9: string;
  Raw: string;
}

interface CardSetData {
  _id: string;
  pokemonTcgApiId: string;
  name: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
}

interface CardData {
  _id: string;
  pokemonTcgApiId: string;
  name: string;
  number: string;
  rarity: string;
  artist: string;
  nationalPokedexNumber?: number;
  set: CardSetData | null;
  marketCap: CardMarketCap;
  lastSold: string;
  images: {
    small: string;
    large: string;
  };
}

async function getCard(id: string): Promise<CardData | null> {
  try {
    // The MongoDB connection is now entirely handled by the lazy-loaded model
    // Just use PokemonCardModel directly - it will initialize the connection if needed
    logger.info(`Fetching card with ID: ${id}`);

    try {
      const { PokemonCardModel } = await MongoDbModels();
      const card = await PokemonCardModel.findOne({ pokemonTcgApiId: id })
        .populate("set")
        .lean();

      if (!card) {
        logger.info(`Card with ID ${id} not found`);
        return null;
      }

      logger.info(`Found card: ${JSON.stringify(card)}`);

      // Generate mock market cap data
      const mockMarketCap = {
        PSA10: (Math.random() * 200 + 50).toFixed(2),
        PSA9: (Math.random() * 100 + 20).toFixed(2),
        Raw: (Math.random() * 50 + 5).toFixed(2),
      };

      // Create a properly typed set object if it exists
      let setData: CardSetData | null = null;
      if (card.set && typeof card.set === "object") {
        // Since we're using lean(), the result might not match our exact types
        // Use a Record type to access properties safely
        const setObj = card.set as Record<string, unknown>;

        // Get the _id value and ensure it's properly converted to string
        let idValue = "";
        if (setObj._id) {
          const id = setObj._id;
          idValue =
            typeof id === "object" && id.toString ? id.toString() : String(id);
        }

        setData = {
          _id: idValue,
          pokemonTcgApiId: (setObj.pokemonTcgApiId as string) || "",
          name: (setObj.name as string) || "",
          series: setObj.series as string,
          printedTotal: setObj.printedTotal as number,
          total: setObj.total as number,
          releaseDate: setObj.releaseDate as string,
          images: setObj.images as { symbol?: string; logo?: string },
        };
      }

      // Transform the card to the expected format with proper type handling
      return {
        _id: card._id?.toString() || "",
        pokemonTcgApiId: card.pokemonTcgApiId || "",
        name: card.name || "",
        number: card.number || "",
        rarity: card.rarity || "",
        artist: card.artist || "",
        nationalPokedexNumber: card.nationalPokedexNumber,
        set: setData,
        marketCap: mockMarketCap,
        lastSold: `${Math.floor(Math.random() * 30) + 1}d ago`,
        images: card.images || { small: "", large: "" },
        // Include any other card properties here
      };
    } catch (dbError) {
      logger.error(`Database query error: ${dbError}`);
      return null;
    }
  } catch (error) {
    logger.error(`Error fetching card: ${error}`);
    return null;
  }
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const card = await getCard(resolvedParams.id);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Card not found</h1>
          <p className="mt-2">
            We couldn&apos;t find the card you&apos;re looking for.
          </p>
          <Link href="/dashboard/catalog">
            <Button className="mt-4">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock price history data (30 days)
  const mockPriceHistory = Array.from({ length: 30 }, (_, i) => {
    const basePrice = parseFloat(card.marketCap.PSA10);
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    // Create a realistic price movement with some volatility
    const price =
      basePrice * (1 + Math.sin(i / 4) / 8 + (Math.random() - 0.5) * 0.03);
    return {
      date: date.toISOString().split("T")[0],
      value: parseFloat(price.toFixed(2)), // Convert to number for PriceData interface compatibility
    };
  });

  // Calculate price changes
  const currentPrice = parseFloat(
    mockPriceHistory[mockPriceHistory.length - 1].value.toString()
  );
  const yesterdayPrice = parseFloat(
    mockPriceHistory[mockPriceHistory.length - 2].value.toString()
  );
  const weekAgoPrice = parseFloat(
    mockPriceHistory[mockPriceHistory.length - 8].value.toString()
  );
  const monthAgoPrice = parseFloat(mockPriceHistory[0].value.toString());

  const change24h = (
    ((currentPrice - yesterdayPrice) / yesterdayPrice) *
    100
  ).toFixed(2);
  const change7d = (
    ((currentPrice - weekAgoPrice) / weekAgoPrice) *
    100
  ).toFixed(2);
  const change30d = (
    ((currentPrice - monthAgoPrice) / monthAgoPrice) *
    100
  ).toFixed(2);

  // Mock sales data
  const mockRecentSales = [
    {
      date: "2 days ago",
      condition: "PSA 10",
      price: "$" + (parseFloat(card.marketCap.PSA10) * 0.98).toFixed(2),
    },
    {
      date: "5 days ago",
      condition: "PSA 9",
      price: "$" + (parseFloat(card.marketCap.PSA9) * 1.02).toFixed(2),
    },
    {
      date: "1 week ago",
      condition: "Raw",
      price: "$" + (parseFloat(card.marketCap.Raw) * 0.95).toFixed(2),
    },
    {
      date: "2 weeks ago",
      condition: "PSA 10",
      price: "$" + (parseFloat(card.marketCap.PSA10) * 1.05).toFixed(2),
    },
    {
      date: "3 weeks ago",
      condition: "PSA 9",
      price: "$" + (parseFloat(card.marketCap.PSA9) * 0.97).toFixed(2),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* Back Button */}
        {card.set && (
          <Link
            href={`/dashboard/catalog/sets/${card.set.pokemonTcgApiId}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to {card.set.name}
          </Link>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Card Image */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              {card.images?.large && (
                <img
                  src={card.images.large}
                  alt={card.name}
                  className="w-full rounded-xl shadow-lg"
                />
              )}
            </div>

            {/* Card Details */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-gray-900 px-6 py-4">
                <h3 className="text-lg font-medium">Card Details</h3>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Set</p>
                    <p className="font-medium">{card.set?.name || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Number</p>
                    <p className="font-medium">#{card.number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Rarity</p>
                    <p className="font-medium">{card.rarity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Artist</p>
                    <p className="font-medium">{card.artist}</p>
                  </div>
                  {card.nationalPokedexNumber && (
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Pokédex #</p>
                      <p className="font-medium">
                        {card.nationalPokedexNumber}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Market Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Name and Market Value */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl font-bold text-green-500">
                  ${card.marketCap.PSA10}
                </h2>
                <div
                  className={`flex items-center text-lg ${
                    parseFloat(change24h) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {parseFloat(change24h) >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(parseFloat(change24h))}%
                </div>
                <p className="text-gray-400">PSA 10</p>
              </div>
            </div>

            {/* Price by Condition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-green-500 text-lg font-bold">
                    ${card.marketCap.PSA10}
                  </p>
                  <p className="text-sm text-gray-400">PSA 10</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-yellow-500 text-lg font-bold">
                    ${card.marketCap.PSA9}
                  </p>
                  <p className="text-sm text-gray-400">PSA 9</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-blue-400 text-lg font-bold">
                    ${card.marketCap.Raw}
                  </p>
                  <p className="text-sm text-gray-400">Raw</p>
                </CardContent>
              </Card>
            </div>

            {/* Price Performance */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-gray-900 px-6 py-4">
                <h3 className="text-lg font-medium">Price Performance</h3>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">24h</p>
                  <p
                    className={`text-lg font-bold flex items-center ${
                      parseFloat(change24h) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {parseFloat(change24h) >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(parseFloat(change24h))}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">7d</p>
                  <p
                    className={`text-lg font-bold flex items-center ${
                      parseFloat(change7d) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {parseFloat(change7d) >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(parseFloat(change7d))}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">30d</p>
                  <p
                    className={`text-lg font-bold flex items-center ${
                      parseFloat(change30d) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {parseFloat(change30d) >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(parseFloat(change30d))}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Price History Chart */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-gray-900 px-6 py-4">
                <h3 className="text-lg font-medium">Price History (PSA 10)</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <ChartContainer data={mockPriceHistory} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-gray-900 px-6 py-4">
                <h3 className="text-lg font-medium">Recent Sales</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-800">
                  {mockRecentSales.map((sale, index) => (
                    <div
                      key={index}
                      className="p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{sale.date}</p>
                        <p className="text-sm text-gray-400">
                          {sale.condition}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-bold">{sale.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
