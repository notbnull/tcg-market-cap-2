"use client";

import { useState } from "react";
import { FilterBar } from "./filters/FilterBar";
import { CardList } from "./table/card-list";
import { TablePagination } from "./table/table-pagination";
import { CatalogTableProps, Filters } from "@/app/lib/types";

export default function CatalogTable({
  query,
  currentPage,
  cards,
  totalCards,
  totalPages,
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

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} setFilters={setFilters} />
      <CardList
        cards={cards}
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
        totalPages={totalPages}
        itemsPerPage={cardsPerPage}
        totalItems={totalCards}
      />
    </div>
  );
}
