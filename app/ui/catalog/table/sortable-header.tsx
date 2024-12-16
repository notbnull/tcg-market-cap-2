"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead } from "../../components/table";

interface SortableHeaderProps {
  column: string;
  children: React.ReactNode;
  className?: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export const SortableHeader = ({
  column,
  children,
  className = "",
  sortColumn,
  sortDirection,
  onSort,
}: SortableHeaderProps) => (
  <TableHead className={className}>
    <div
      onClick={() => onSort(column)}
      className="flex items-center cursor-pointer hover:text-primary transition-colors group"
    >
      {children}
      {sortColumn === column ? (
        sortDirection === "asc" ? (
          <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ChevronUp className="ml-1 h-3 w-3 opacity-30 group-hover:opacity-70 transition-opacity" />
      )}
    </div>
  </TableHead>
);
