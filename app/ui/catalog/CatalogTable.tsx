"use client";

import { useState } from "react";
import { FilterBar } from "./filters/FilterBar";
import { CardList } from "./table/card-list";
import { TablePagination } from "./table/table-pagination";
import { getCards } from "@/app/lib/data/getCards";
import { Card, CatalogTableProps, Filters } from "@/app/lib/types";

const mockCards = await getCards();

// const uniqueSets = Array.from(new Set(mockCards.map((card) => card.set)));
// const uniqueRarities = Array.from(
//   new Set(mockCards.map((card) => card.rarity))
// );

export default function CatalogTable({
  query,
  currentPage,
}: CatalogTableProps) {
  const [filters, setFilters] = useState<Filters>({
    search: query || "",
    rarity: [],
    sets: [],
    priceRange: { min: 0, max: 1000000 },
    gradeType: "PSA",
  });

  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const cardsPerPage = 25;

  const filteredCards = mockCards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.set.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.number.includes(filters.search);

    const matchesRarity =
      filters.rarity.length === 0 || filters.rarity.includes(card.rarity);
    const matchesSets =
      filters.sets.length === 0 || filters.sets.includes(card.set);

    return matchesSearch && matchesRarity && matchesSets;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    const compareValue = sortDirection === "asc" ? 1 : -1;

    if (sortColumn.startsWith("marketCap")) {
      const grade = sortColumn.replace(
        "marketCap",
        ""
      ) as keyof typeof a.marketCap;
      return (a.marketCap[grade] - b.marketCap[grade]) * compareValue;
    }

    return (
      String(a[sortColumn as keyof Card]).localeCompare(
        String(b[sortColumn as keyof Card])
      ) * compareValue
    );
  });

  const currentCards = sortedCards.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} setFilters={setFilters} />
      <CardList
        cards={currentCards}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={(column) => {
          setSortDirection((prev) =>
            sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "asc"
          );
          setSortColumn(column);
        }}
      />
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredCards.length / cardsPerPage)}
        itemsPerPage={cardsPerPage}
        totalItems={filteredCards.length}
      />
    </div>
  );
}
