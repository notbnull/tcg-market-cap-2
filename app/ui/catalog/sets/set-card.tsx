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
      <Card className="h-[320px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl flex flex-col">
        {/* Fixed height header */}
        <div className="relative h-[160px] overflow-hidden flex-shrink-0">
          {/* Background gradient with subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 opacity-80"></div>

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:12px_12px] opacity-30"></div>

          {/* Set logo container with aspect ratio preservation */}
          <div className="relative h-full w-full flex items-center justify-center p-4 z-10">
            <div className="relative w-auto h-auto max-w-[85%] max-h-[85%]">
              <Image
                src={set.images.logo.toString()}
                alt={`${set.name} logo`}
                width={240}
                height={80}
                style={{ objectFit: "contain", width: "auto", height: "auto" }}
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
            <div className="fallback-name hidden text-white text-xl font-bold p-4 text-center drop-shadow-lg z-10">
              {set.name}
            </div>
          </div>

          {/* Set symbol positioned in the top right */}
          <div className="absolute top-3 right-3 w-8 h-8 z-20 bg-white/10 backdrop-blur-md rounded-full p-1 flex items-center justify-center shadow-lg">
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
            <div className="fallback-symbol hidden text-white text-xs font-bold">
              {set.name.substring(0, 1)}
            </div>
          </div>
        </div>

        {/* Fixed height content area */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between h-[160px]">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg truncate text-white">
              {set.name}
            </h3>
            <p className="text-sm text-gray-300 font-medium">
              {set.series} Series
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-700/50 mt-auto">
            <div className="flex items-center text-sm text-gray-400">
              <span className="font-medium">{set.total}</span>
              <span className="ml-1">cards</span>
            </div>
            <span className="text-sm text-gray-400">
              Released {releaseDateFormatted}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
