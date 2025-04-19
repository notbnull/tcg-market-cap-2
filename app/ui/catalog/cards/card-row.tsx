"use client";

import Link from "next/link";
import { Card } from "@/lib/types";
import { Card as CardUI, CardContent } from "@/app/ui/components/card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import CardThumbnail from "@/app/ui/components/cards/card-thumbnail";

interface CardRowProps {
  cards: Card[];
}

export function CardRow({ cards }: CardRowProps) {
  return (
    <CardUI className="border-0 bg-gray-900 shadow-xl">
      <CardContent className="p-0">
        <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
          {cards.map((card) => (
            <Link
              key={card._id}
              href={`/dashboard/catalog/cards/${
                card.pokemonTcgApiId || card._id
              }`}
            >
              <div className="relative cursor-pointer hover:bg-gray-800 transition-colors duration-200">
                <div className="p-4 flex items-center">
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
                      <p className="font-medium truncate mr-2">{card.name}</p>
                      <span className="text-xs text-gray-400">
                        #{card.number}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{card.rarity}</p>
                  </div>

                  {/* PSA Value */}
                  <div className="text-right px-3 min-w-[120px]">
                    <p className="text-green-500 font-medium">
                      ${card.marketCap?.PSA || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">PSA</p>
                  </div>

                  {/* Raw Value (using estimated market value or another field) */}
                  <div className="text-right px-3 min-w-[120px]">
                    <p className="text-blue-400 font-medium">
                      $
                      {card.marketCap?.PSA
                        ? (card.marketCap.PSA * 0.4).toFixed(2)
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">Raw</p>
                  </div>

                  {/* Last Sold or Set Name */}
                  <div className="text-right px-3 min-w-[80px]">
                    <p className="text-gray-300 font-medium truncate">
                      {card.lastSold || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">Last Sold</p>
                  </div>

                  {/* Chevron */}
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </CardUI>
  );
}
