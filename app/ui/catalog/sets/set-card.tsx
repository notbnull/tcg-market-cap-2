"use client";

import Image from "next/image";
import Link from "next/link";
import { PokemonSet } from "@/lib/types";
import { Card, CardContent } from "@/app/ui/components/card";
import { format } from "date-fns";

interface SetCardProps {
  set: PokemonSet;
}

export function SetCard({ set }: SetCardProps) {
  const releaseDate = new Date(set.releaseDate);
  const releaseDateFormatted = format(releaseDate, "MMM yyyy");

  return (
    <Link href={`/dashboard/catalog/sets/${set.pokemonTcgApiId}`}>
      <Card className="h-[220px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-xl flex flex-col border border-gray-800 dark:border-gray-800">
        {/* Fixed height header */}
        <div className="relative h-[110px] overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-black">
          {/* Set logo container with aspect ratio preservation */}
          <div className="relative h-full w-full flex items-center justify-center p-4 z-10">
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <Image
                src={set.images.logo.toString()}
                alt={`${set.name} logo`}
                width={200}
                height={80}
                style={{
                  objectFit: "contain",
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "80px",
                }}
                unoptimized
                loading="eager"
                className="drop-shadow-lg z-10"
                onError={(e) => {
                  console.error(`Failed to load image: ${set.images.logo}`, e);
                  const imgElement = e.currentTarget as HTMLImageElement;
                  imgElement.style.display = "none";
                  imgElement.parentElement?.parentElement
                    ?.querySelector(".fallback-name")
                    ?.classList.remove("hidden");
                }}
              />
            </div>

            {/* Fallback for logo */}
            <div className="fallback-name hidden text-gray-900 dark:text-white text-xl font-bold p-4 text-center drop-shadow-lg z-10">
              {set.name}
            </div>
          </div>

          {/* Set symbol positioned in the top right */}
          <div className="absolute top-3 right-3 w-8 h-8 z-20 bg-black/10 dark:bg-white/20 backdrop-blur-md rounded-full p-1 flex items-center justify-center shadow-lg">
            <Image
              src={set.images.symbol}
              alt={`${set.name} symbol`}
              width={24}
              height={24}
              unoptimized
              loading="eager"
              className="object-contain"
              onError={(e) => {
                console.error(`Failed to load symbol: ${set.images.symbol}`, e);
                const imgElement = e.currentTarget as HTMLImageElement;
                imgElement.style.display = "none";
                imgElement.parentElement
                  ?.querySelector(".fallback-symbol")
                  ?.classList.remove("hidden");
              }}
            />
            <div className="fallback-symbol hidden text-gray-900 dark:text-white text-xs font-bold">
              {set.name.substring(0, 1)}
            </div>
          </div>
        </div>

        {/* Content area */}
        <CardContent className="p-4 bg-gray-50 dark:bg-black flex flex-col h-[110px] overflow-hidden">
          <h3 className="font-semibold text-lg truncate text-gray-900 dark:text-white">
            {set.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
            {set.series} Series
          </p>

          <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{set.total}</span>
              <span className="ml-1">cards</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Released {releaseDateFormatted}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
