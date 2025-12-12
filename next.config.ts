import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  experimental: {
    // @ts-expect-error - turbo is experimental
    // turbo: {
    //   resolveAlias: {
    //     "pino-pretty": path.resolve(__dirname, "src/lib/noop.ts"),
    //     "lokijs": path.resolve(__dirname, "src/lib/noop.ts"),
    //     "encoding": path.resolve(__dirname, "src/lib/noop.ts"),
    //   },
    // },
  },
};

export default nextConfig;
