import { Filters } from "@/app/lib/types";
import { Input } from "../../components/input";
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
      <Input
        placeholder="Search by name, set, or number..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="w-full"
      />
      <FilterChips filters={filters} setFilters={setFilters} />
      <AdvancedFilters filters={filters} setFilters={setFilters} />
    </div>
  );
}
