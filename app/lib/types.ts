export type MarketData = {
  totalMarketCap: number;
  dailyVolume: number;
  topGainer: { name: string; percentage: number };
  topLoser: { name: string; percentage: number };
  marketCapHistory: { date: string; value: number }[];
  volumeHistory: { date: string; value: number }[];
};

export type TrendingCard = {
  id: number;
  name: string;
  set: string;
  year: number;
  image: string;
  popularityRank: number;
  marketCap: { PSA: number; BGS: number; CGC: number };
  priceChange: number;
};

export interface Card {
  id: number;
  name: string;
  set: string;
  number: string;
  rarity: string;
  marketCap: {
    PSA: number;
    BGS: number;
    CGC: number;
  };
  lastSold: string;
}

export interface Filters {
  search: string;
  rarity: string[];
  sets: string[];
  priceRange: {
    min: number;
    max: number;
  };
  gradeType: "PSA" | "BGS" | "CGC";
}

export interface CatalogTableProps {
  query: string;
  currentPage: number;
}

export type SortDirection = "asc" | "desc";
export type GradeType = "PSA" | "BGS" | "CGC";
