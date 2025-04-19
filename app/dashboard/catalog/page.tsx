import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/search-bar";
import { fetchSets } from "@/lib/data/fetchSets";
import { fetchCards } from "@/lib/data/fetchCards";
import SetGrid from "@/app/ui/catalog/sets/set-grid";
import { CardGrid } from "@/app/ui/catalog/cards/card-grid";
import { CardRow } from "@/app/ui/catalog/cards/card-row";
import { Card, PokemonSet } from "@/lib/types";
import { TablePagination } from "@/app/ui/catalog/table/table-pagination";
import {
  Squares2X2Icon as ViewGridIcon,
  ListBulletIcon as ViewListIcon,
} from "@heroicons/react/24/outline";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    limit?: string;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
    view?: string;
    cardLayout?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const view = searchParams?.view || "sets"; // Default to sets view
  const cardLayout = searchParams?.cardLayout || "row"; // Default to row layout for cards

  // Set different default limits for sets and cards
  const limit = Number(searchParams?.limit) || (view === "sets" ? 12 : 24);

  // Different default sort options for sets and cards
  const defaultSortColumn = view === "sets" ? "releaseDate" : "name";
  const sortColumn = searchParams?.sortColumn || defaultSortColumn;
  const sortDirection = searchParams?.sortDirection || "desc";

  // Fetch data based on the selected view
  let setsData: { sets: PokemonSet[]; totalSets: number } = {
    sets: [],
    totalSets: 0,
  };
  let cardsData: { cards: Card[]; totalCards: number } = {
    cards: [],
    totalCards: 0,
  };

  if (view === "sets") {
    setsData = await fetchSets({
      page: currentPage,
      limit,
      sortColumn,
      sortDirection,
      query,
    });
  } else {
    cardsData = await fetchCards({
      page: currentPage,
      limit,
      sortColumn,
      sortDirection,
      filter: { name: { $regex: query, $options: "i" } },
    });
  }

  // Create URLs for tab switching that preserve other parameters but not query
  // This ensures that the search bar is reset when switching tabs
  const getTabUrl = (tabView: string) => {
    const params = new URLSearchParams();
    params.set("view", tabView);
    // Preserve other params except query
    for (const [key, value] of Object.entries(searchParams || {})) {
      if (key !== "view" && key !== "query" && typeof value === "string") {
        params.set(key, value);
      }
    }
    return `/dashboard/catalog?${params.toString()}`;
  };

  // Create URLs for layout switching that preserve all parameters
  const getLayoutUrl = (layout: string) => {
    const params = new URLSearchParams();
    params.set("cardLayout", layout);
    // Preserve other params
    for (const [key, value] of Object.entries(searchParams || {})) {
      if (key !== "cardLayout" && typeof value === "string") {
        params.set(key, value);
      }
    }
    return `/dashboard/catalog?${params.toString()}`;
  };

  return (
    <div className="bg-black h-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">Pokémon TCG Catalog</h2>

          {/* View Selector similar to header navigation */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2 space-x-4">
              <a
                href={getTabUrl("sets")}
                className={`text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                  view === "sets"
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : ""
                }`}
              >
                Sets
              </a>
              <a
                href={getTabUrl("cards")}
                className={`text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                  view === "cards"
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : ""
                }`}
              >
                Cards
              </a>
            </div>

            {/* Layout toggle for cards view */}
            {view === "cards" && (
              <div className="flex gap-2 bg-gray-800 p-1 rounded-md">
                <a
                  href={getLayoutUrl("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    cardLayout === "grid"
                      ? "bg-blue-900 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <ViewGridIcon className="w-5 h-5" />
                </a>
                <a
                  href={getLayoutUrl("row")}
                  className={`p-1.5 rounded-md transition-colors ${
                    cardLayout === "row"
                      ? "bg-blue-900 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="List View"
                >
                  <ViewListIcon className="w-5 h-5" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="py-4">
            <Suspense
              fallback={<div className="text-white">Loading search...</div>}
            >
              <SearchBar
                placeholder={
                  view === "sets"
                    ? "Search Pokémon sets..."
                    : "Search Pokémon cards..."
                }
              />
            </Suspense>
          </div>

          {/* Content Display Based on Selected View */}
          {view === "sets" ? (
            <Suspense
              key={`sets-${query}-${currentPage}`}
              fallback={<div className="text-white">Loading sets...</div>}
            >
              <SetGrid
                sets={setsData.sets}
                currentPage={currentPage}
                totalSets={setsData.totalSets}
                totalPages={Math.ceil(setsData.totalSets / limit)}
              />
            </Suspense>
          ) : (
            <Suspense
              key={`cards-${query}-${currentPage}`}
              fallback={<div className="text-white">Loading cards...</div>}
            >
              <div className="space-y-4">
                {/* Show either CardGrid or CardRow based on the cardLayout parameter */}
                {cardLayout === "grid" ? (
                  <CardGrid cards={cardsData.cards} />
                ) : (
                  <CardRow cards={cardsData.cards} />
                )}

                {/* Pagination for Cards */}
                <TablePagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(cardsData.totalCards / limit)}
                  itemsPerPage={limit}
                  totalItems={cardsData.totalCards}
                />
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
