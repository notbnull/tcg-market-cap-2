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
