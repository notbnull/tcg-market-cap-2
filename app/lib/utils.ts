import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Revenue } from "./definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US"
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If total pages is 7 or less, show all pages
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If current page is among the first 3 pages
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If current page is among the last 3 pages
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If current page is somewhere in the middle
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate the highest revenue value
  const yAxisValues = revenue.map((month) => month.revenue);
  const maxRevenue = Math.max(...yAxisValues);
  const topLabel = Math.ceil(maxRevenue / 1000) * 1000;

  // Create an array of values from 0 to the topLabel
  const steps = 4;
  const yAxisLabels = [];
  for (let i = 0; i <= steps; i++) {
    yAxisLabels.push((topLabel / steps) * i);
  }

  return {
    yAxisLabels,
    topLabel,
  };
};
