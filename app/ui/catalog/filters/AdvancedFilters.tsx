/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/collapsible";
import { Label } from "../../components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select";
import { Slider } from "../../components/slider";

interface AdvancedFiltersProps {
  filters: {
    gradeType: "PSA" | "BGS" | "CGC";
    priceRange: {
      min: number;
      max: number;
    };
  };
  setFilters: (filters: any) => void; // TODO: Type this properly based on your Filters type
}

export function AdvancedFilters({ filters, setFilters }: AdvancedFiltersProps) {
  const handlePriceRangeChange = (value: [number, number]) => {
    setFilters({
      ...filters,
      priceRange: {
        min: value[0],
        max: value[1],
      },
    });
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
        Advanced Filters
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Label>Grade Type</Label>
            <Select
              value={filters.gradeType}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  gradeType: value as "PSA" | "BGS" | "CGC",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PSA">PSA</SelectItem>
                <SelectItem value="BGS">BGS</SelectItem>
                <SelectItem value="CGC">CGC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Price Range</Label>
            <Slider
              defaultValue={[filters.priceRange.min, filters.priceRange.max]}
              max={1000000}
              step={1000}
              onValueChange={handlePriceRangeChange}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${filters.priceRange.min.toLocaleString()}</span>
              <span>${filters.priceRange.max.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
