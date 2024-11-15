import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
  },
  images: {
    unoptimized: true, // This will disable image optimization
  },
};

export default nextConfig;
