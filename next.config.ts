import type { NextConfig } from "next";


interface NextConfigWithTurbo extends NextConfig {
  turbo?: {
    resolveAlias?: Record<string, string>;
    resolveExtensions?: string[];
  };
}

const nextConfig: NextConfigWithTurbo = {
  // Keep webpack as fallback for production builds
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "tap", "tape", "why-is-node-running");
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty', 'thread-stream']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;