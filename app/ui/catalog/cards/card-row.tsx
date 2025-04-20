"use client";

import Link from "next/link";
import { Card } from "@/lib/types";
import { Card as CardUI, CardContent } from "@/app/ui/components/card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import CardThumbnail from "@/app/ui/components/cards/card-thumbnail";
import { PokemonSet } from "@/mongodb/models/PokemonSet/PokemonSet";

interface CardRowProps {
  cards: Card[];
}

export function CardRow({ cards }: CardRowProps) {
  return (
    <CardUI className="border-0">
      <CardContent className="p-0">
        <div className="divide-y divide-gray-800 h-[300px] overflow-y-auto overscroll-contain">
          {cards.map((card) => (
            <Link
              key={card._id}
              href={`/dashboard/catalog/cards/${
                card.pokemonTcgApiId || card._id
              }`}
            >
              <div className="relative cursor-pointer hover:bg-gray-900 transition-colors duration-200">
                <div className="p-2 flex items-center">
                  {/* Card Image Thumbnail with Hover */}
                  {card.images?.small && (
                    <CardThumbnail
                      smallImageUrl={card.images.small}
                      largeImageUrl={card.images.large}
                      altText={card.name}
                      className="mr-4"
                    />
                  )}

                  {/* Card Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="font-medium truncate mr-2 text-white">
                        {card.name}{" "}
                      </p>
                      <span className="text-xs text-gray-400">
                        {(card.set as unknown as PokemonSet).name} #
                        {card.number}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400"></p>
                    <p className="text-xs text-gray-400">{card.rarity}</p>
                  </div>

                  {/* PSA Value */}
                  <div className="text-right px-3 min-w-[120px]">
                    <p className="text-green-400 font-medium">
                      ${card.marketCap?.PSA || "N/A"}
                    </p>
                    <p className="text-xs text-gray-300">PSA</p>
                  </div>

                  {/* Raw Value (using estimated market value or another field) */}
                  <div className="text-right px-3 min-w-[120px]">
                    <p className="text-blue-400 font-medium">
                      $
                      {card.marketCap?.PSA
                        ? (card.marketCap.PSA * 0.4).toFixed(2)
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-300">Raw</p>
                  </div>

                  {/* Last Sold or Set Name */}
                  <div className="text-right px-3 min-w-[80px]">
                    <p className="text-gray-200 font-medium truncate">
                      {card.lastSold || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-300">Last Sold</p>
                  </div>

                  {/* Chevron */}
                  <ChevronRightIcon className="w-5 h-5 text-gray-300 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </CardUI>
  );
}
