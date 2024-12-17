import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
    serverComponentsExternalPackages: ["mongoose"], // <-- and this
  },
  images: {
    unoptimized: true, // This will disable image optimization
  },
};

export default nextConfig;
