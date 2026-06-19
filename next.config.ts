import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'opitkttpjlxmdmqfvuew.supabase.co' },
    ],
  },
  experimental: {
    staleTimes: { dynamic: 0, static: 30 },
  },
};

export default nextConfig;
