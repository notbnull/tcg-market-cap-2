import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ["images.pokemontcg.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
        pathname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
