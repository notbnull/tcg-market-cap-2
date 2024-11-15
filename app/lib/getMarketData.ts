import { MarketData } from "./types";

export async function getMarketData(): Promise<MarketData> {
  return {
    totalMarketCap: 10000000000,
    dailyVolume: 50000000,
    topGainer: { name: "Mew", percentage: 15.5 },
    topLoser: { name: "Gyarados", percentage: -8.2 },
    marketCapHistory: [
      { date: "2023-01", value: 8000000000 },
      { date: "2023-02", value: 8500000000 },
      { date: "2023-03", value: 9000000000 },
      { date: "2023-04", value: 9200000000 },
      { date: "2023-05", value: 9800000000 },
      { date: "2023-06", value: 10000000000 },
    ],
    volumeHistory: [
      { date: "2023-01", value: 40000000 },
      { date: "2023-02", value: 42000000 },
      { date: "2023-03", value: 45000000 },
      { date: "2023-04", value: 48000000 },
      { date: "2023-05", value: 47000000 },
      { date: "2023-06", value: 50000000 },
    ],
  };
}
