import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  logging: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.ophim.live",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
