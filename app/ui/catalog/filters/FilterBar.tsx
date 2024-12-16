import { Filters } from "@/app/lib/types";
import { AdvancedFilters } from "./AdvancedFilters";
import { FilterChips } from "./FilterChips";

export function FilterBar({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <FilterChips filters={filters} setFilters={setFilters} />
      <AdvancedFilters filters={filters} setFilters={setFilters} />
    </div>
  );
}
