import { Suspense } from "react";
import { getMarketData } from "@/lib/getMarketData";
import MarketOverview from "@/app/ui/dashboard/market-overview";
import TrendingCards from "@/app/ui/dashboard/trending-cards";
import MarketTrends from "@/app/ui/dashboard/market-trends";
import { getTrendingCards } from "../../lib/getTrendingCards";

export default async function Dashboard() {
  const marketDataPromise = getMarketData();
  const trendingCardsPromise = getTrendingCards();

  // Fetch data on the server
  const [marketData, trendingCards] = await Promise.all([
    marketDataPromise,
    trendingCardsPromise,
  ]);

  return (
    <>
      {/* Market Trends */}
      <Suspense fallback={<div>Loading market overview...</div>}>
        <MarketOverview data={marketData} />
      </Suspense>

      <Suspense fallback={<div>Loading market trends...</div>}>
        <MarketTrends data={marketData} />
      </Suspense>

      {/* Trending Cards */}
      <Suspense fallback={<div>Loading trending cards...</div>}>
        <TrendingCards data={trendingCards} />
      </Suspense>
    </>
  );
}
