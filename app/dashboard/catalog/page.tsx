import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/search-bar";
import CatalogTable from "@/app/ui/catalog/CatalogTable";
import { Card, CardContent, CardHeader } from "@/app/ui/components/card";
import { fetchCards } from "@/app/lib/data/fetchCards";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    limit?: string;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 25;
  const sortColumn = searchParams?.sortColumn || "name";
  const sortDirection = searchParams?.sortDirection || "asc";

  // // Fetch data on the server
  const cardData = await fetchCards({
    page: currentPage,
    limit,
    sortColumn,
    sortDirection,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-7xl mx-auto ">
        <CardHeader></CardHeader>
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
            <CatalogTable
              cards={cardData.cards}
              query={query}
              currentPage={currentPage}
              totalCards={cardData.totalCards}
              totalPages={Math.ceil(cardData.totalCards / limit)}
            />
          </Suspense>
          {/* <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
