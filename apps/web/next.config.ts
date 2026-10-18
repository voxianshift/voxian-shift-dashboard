import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Self-contained server for the Cloud Run container (apps/web/Dockerfile)
  output: "standalone",
  // Trace files from the monorepo root so packages/shared is included
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  async redirects() {
    return [{ source: "/", destination: "/onboarding", permanent: false }]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_BASE_URL || "http://127.0.0.1:8080"}/:path*`,
      },
    ]
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Dashboard pages are gated on client-side profile state and can't prerender, so only
    // validate segments that opt in with `export const instant`.
    instantInsights: { validationLevel: "manual-warning" },
  },
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
