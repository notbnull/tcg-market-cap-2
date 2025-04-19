import { Filters } from "@/lib/types";
import { FilterChip } from "../../components/filter-chip";

export function FilterChips({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}) {
  const toggleRarity = (rarity: string) => {
    setFilters({
      ...filters,
      rarity: filters.rarity.includes(rarity)
        ? filters.rarity.filter((r: string) => r !== rarity)
        : [...filters.rarity, rarity],
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {["Common", "Uncommon", "Rare", "Ultra Rare"].map((rarity) => (
        <FilterChip
          key={rarity}
          active={filters.rarity.includes(rarity)}
          onClick={() => toggleRarity(rarity)}
        >
          {rarity}
        </FilterChip>
      ))}
    </div>
  );
}
