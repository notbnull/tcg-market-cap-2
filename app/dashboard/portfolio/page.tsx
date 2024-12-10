import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/search-bar";
import { getMarketData } from "@/app/lib/getMarketData";
import { getTrendingCards } from "@/app/lib/getTrendingCards";
import MarketOverview from "@/app/ui/dashboard/market-overview";
import TrendingCards from "@/app/ui/dashboard/trending-cards";
import MarketTrends from "@/app/ui/dashboard/market-trends";

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
      {/* Search Bar */}
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchBar />
      </Suspense>
    </>
  );
}
