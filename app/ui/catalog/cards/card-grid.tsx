"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, PokemonSet } from "@/lib/types";
import { Card as CardUI, CardContent } from "@/app/ui/components/card";

interface CardGridProps {
  cards: Card[];
}

export function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Link
          key={card._id}
          href={`/dashboard/catalog/cards/${card.pokemonTcgApiId || card.id}`}
          className="transition-transform hover:scale-[1.03]"
        >
          <CardUI className="h-full overflow-hidden hover:shadow-md border-0">
            <div className="relative aspect-[2.5/3.5] w-full bg-gray-100 dark:bg-black">
              {card.images && (card.images.small || card.images.large) && (
                <Image
                  src={card.images.small || card.images.large}
                  alt={`${card.name} card`}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              )}
              {(!card.images || (!card.images.small && !card.images.large)) && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-300">
                  No image
                </div>
              )}
            </div>
            <CardContent className="p-2 bg-gray-50 dark:bg-black">
              <div className="text-xs font-medium truncate text-gray-900 dark:text-white flex justify-between">
                <span className="truncate">{card.name}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
                  {card.number}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>{(card.set as unknown as PokemonSet).name}</span>
                <span>{card.rarity}</span>
              </div>
            </CardContent>
          </CardUI>
        </Link>
      ))}
    </div>
  );
}
