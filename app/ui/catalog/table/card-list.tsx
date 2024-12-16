"use client";

import { Card } from "@/app/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/table";
import { SortableHeader } from "./sortable-header";

interface CardListProps {
  cards: Card[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function CardList({
  cards,
  sortColumn,
  sortDirection,
  onSort,
}: CardListProps) {
  return (
    <Table className="w-full text-xs">
      <TableHeader>
        <TableRow>
          <SortableHeader
            column="name"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Name
          </SortableHeader>
          <SortableHeader
            column="set"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="md:table-cell"
          >
            Set
          </SortableHeader>
          <SortableHeader
            column="number"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="lg:table-cell"
          >
            Number
          </SortableHeader>
          <SortableHeader
            column="rarity"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="sm:table-cell"
          >
            Rarity
          </SortableHeader>
          <SortableHeader
            column="marketCapPSA"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="lg:table-cell"
          >
            Market Cap (PSA)
          </SortableHeader>
          <SortableHeader
            column="marketCapBGS"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="lg:table-cell"
          >
            Market Cap (BGS)
          </SortableHeader>
          <SortableHeader
            column="marketCapCGC"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="lg:table-cell"
          >
            Market Cap (CGC)
          </SortableHeader>
          <SortableHeader
            column="lastSold"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            className="text-right sm:table-cell"
          >
            Last Sold
          </SortableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow key={card._id} className="hover:bg-muted/50">
            <TableCell className="font-medium py-2">{card.name}</TableCell>
            <TableCell className="md:table-cell py-2">{card.set}</TableCell>
            <TableCell className="sm:table-cell py-2">{card.number}</TableCell>
            <TableCell className="sm:table-cell py-2">{card.rarity}</TableCell>
            <TableCell className="py-2">
              ${card.marketCap?.PSA?.toLocaleString() || "N/A"}
            </TableCell>
            <TableCell className="py-2">
              ${card.marketCap?.BGS?.toLocaleString() || "N/A"}
            </TableCell>
            <TableCell className="py-2">
              ${card.marketCap?.CGC?.toLocaleString() || "N/A"}
            </TableCell>
            <TableCell className="text-right sm:table-cell py-2">
              {card.lastSold}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
