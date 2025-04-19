"use client";

import { SetGridProps } from "@/lib/types";
import { SetCard } from "./set-card";
import { TablePagination } from "../table/table-pagination";
import { useSearchParams } from "next/navigation";

export default function SetGrid({
  sets,
  currentPage,
  totalSets,
  totalPages,
}: SetGridProps) {
  const searchParams = useSearchParams();
  const setsPerPage = 12;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sets.map((set) => (
          <SetCard key={set._id} set={set} />
        ))}
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={setsPerPage}
        totalItems={totalSets}
      />
    </div>
  );
}
