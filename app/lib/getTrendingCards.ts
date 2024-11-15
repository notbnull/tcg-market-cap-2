import { TrendingCard } from "./types";

export async function getTrendingCards(): Promise<TrendingCard[]> {
  return [
    {
      id: 1,
      name: "Charizard",
      set: "Base Set",
      year: 1999,
      image: "/placeholder.svg?height=200&width=150",
      popularityRank: 1,
      marketCap: { PSA: 1500000, BGS: 1200000, CGC: 1000000 },
      priceChange: 5.2,
    },
    {
      id: 2,
      name: "Pikachu",
      set: "Jungle",
      year: 1999,
      image: "/placeholder.svg?height=200&width=150",
      popularityRank: 2,
      marketCap: { PSA: 800000, BGS: 750000, CGC: 700000 },
      priceChange: -2.1,
    },
    {
      id: 3,
      name: "Lugia",
      set: "Neo Genesis",
      year: 2000,
      image: "/placeholder.svg?height=200&width=150",
      popularityRank: 3,
      marketCap: { PSA: 600000, BGS: 550000, CGC: 500000 },
      priceChange: 1.8,
    },
    {
      id: 4,
      name: "Blastoise",
      set: "Base Set",
      year: 1999,
      image: "/placeholder.svg?height=200&width=150",
      popularityRank: 4,
      marketCap: { PSA: 400000, BGS: 350000, CGC: 300000 },
      priceChange: 0.5,
    },
  ];
}
