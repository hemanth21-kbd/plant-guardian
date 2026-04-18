import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_THUNDERFOREST_API_KEY: process.env.THUNDERFOREST_API_KEY,
    NEXT_PUBLIC_MAP_PROVIDER: process.env.MAP_PROVIDER,
  },
};

export default nextConfig;
