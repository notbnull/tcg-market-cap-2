"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../../components/pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
}: TablePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    // Preserve existing search params
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page") {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`);
  };

  // Calculate range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Show ellipsis after first page if needed
    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="text-xs text-gray-400 text-center">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
      <Pagination>
        <PaginationContent className="flex flex-wrap justify-center gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer text-white hover:bg-gray-700"
              }
              aria-disabled={currentPage <= 1}
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) => (
            <PaginationItem
              key={`${page}-${index}`}
              className="sm:inline-block"
            >
              {page === "ellipsis" ? (
                <PaginationEllipsis className="text-gray-400" />
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => handlePageChange(page)}
                  className={`cursor-pointer ${
                    currentPage === page
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "text-white hover:bg-gray-700"
                  }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer text-white hover:bg-gray-700"
              }
              aria-disabled={currentPage >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
