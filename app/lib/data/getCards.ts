import { Card } from "@/app/lib/types";

export const getCards = async () => {
  const mockCards: Card[] = Array(100)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      name: `Pokémon ${index + 1}`,
      set: `Set ${Math.floor(index / 10) + 1}`,
      number: `${index + 1}/${150}`,
      rarity: ["Common", "Uncommon", "Rare", "Ultra Rare"][
        Math.floor(Math.random() * 4)
      ],
      marketCap: {
        PSA: Math.floor(Math.random() * 1000000) + 10000,
        BGS: Math.floor(Math.random() * 900000) + 9000,
        CGC: Math.floor(Math.random() * 800000) + 8000,
      },
      lastSold: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
    }));

  return mockCards;
};
