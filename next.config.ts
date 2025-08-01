import type { NextConfig } from "next";

import { fileURLToPath } from "url";
// import path from "path";
import createJiti from "jiti";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add this for monorepo support
  // outputFileTracingRoot: path.resolve(__dirname, "../../"),
  images: {
    domains: ["localhost", "supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Webpack config to handle module resolution issues and SVG imports
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "drizzle-zod": require.resolve("drizzle-zod"),
    };

    // Handle SVG imports as React components - make it more specific
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Configure optimizations (removed Turbo config)
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
