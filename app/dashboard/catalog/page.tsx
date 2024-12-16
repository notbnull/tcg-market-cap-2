import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/search-bar";
import CatalogTable from "@/app/ui/catalog/CatalogTable";
import { Card, CardContent, CardHeader } from "@/app/ui/components/card";
// import { getMarketData } from "@/app/lib/getMarketData";
// import { getTrendingCards } from "@/app/lib/getTrendingCards";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  // const marketDataPromise = getMarketData();
  // const trendingCardsPromise = getTrendingCards();

  // // Fetch data on the server
  // const [marketData, trendingCards] = await Promise.all([
  //   marketDataPromise,
  //   trendingCardsPromise,
  // ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-7xl mx-auto ">
        <CardHeader>
          {/* <CardTitle className="text-2xl font-bold">
            Catalog
          </CardTitle> */}
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <Suspense fallback={<div>Loading search...</div>}>
            <SearchBar placeholder="Search Pokémon cards..." />
          </Suspense>

          {/* Catalog */}
          <Suspense
            key={query + currentPage}
            fallback={<div>Loading table...</div>}
          >
            <CatalogTable query={query} currentPage={currentPage} />
          </Suspense>
          {/* <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
