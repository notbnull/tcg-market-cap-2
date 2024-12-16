import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
  },
  images: {
    unoptimized: true, // This will disable image optimization
  },
  expireTime: 300,
};

export default nextConfig;
