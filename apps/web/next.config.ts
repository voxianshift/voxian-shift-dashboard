import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Static export: served as Cloudflare Workers static assets (free tier).
  // No server actions, route handlers or SSR; data comes from apps/api.
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
