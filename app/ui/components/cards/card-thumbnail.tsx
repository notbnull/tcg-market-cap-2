"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CardThumbnailProps {
  smallImageUrl: string;
  largeImageUrl?: string;
  altText: string;
  className?: string;
  aspectRatio?: number; // Optional aspect ratio override (width/height)
}

export default function CardThumbnail({
  smallImageUrl,
  largeImageUrl,
  altText,
  className = "",
  aspectRatio = 2.5 / 3.5, // Standard trading card ratio (2.5" x 3.5")
}: CardThumbnailProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`relative h-12 w-10 ${className}`}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {/* Small thumbnail image */}
      <div className="h-full w-full">
        <img
          src={smallImageUrl}
          alt={altText}
          className="object-contain h-full w-auto rounded"
        />
      </div>

      {/* Large preview image - shows on hover (with preserved aspect ratio) */}
      {largeImageUrl && showPreview && (
        <div
          className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none bg-black/50"
          style={{ opacity: showPreview ? 1 : 0 }}
        >
          <div
            className="rounded-lg overflow-hidden shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800"
            style={{
              width: "350px",
              maxWidth: "90vw",
              maxHeight: "85vh",
              position: "relative",
            }}
          >
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  paddingBottom: `${(1 / aspectRatio) * 100}%`,
                }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />

                {/* Shimmer effect */}
                <div className="absolute inset-0">
                  <div
                    className="h-full w-full animate-shimmer"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </div>

                {/* Card-like skeleton structure */}
              </div>
            )}
            <div
              className="relative w-full"
              style={{
                paddingBottom: `${(1 / aspectRatio) * 100}%`, // Aspect ratio trick using padding
              }}
            >
              <Image
                src={largeImageUrl}
                alt={altText}
                fill
                sizes="(max-width: 768px) 90vw, 350px"
                className="object-contain"
                unoptimized
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
