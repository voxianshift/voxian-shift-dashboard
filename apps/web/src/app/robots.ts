import type { MetadataRoute } from "next"

// Keep crawlers off the API proxy; the LLM-backed routes are also rate limited in apps/api.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/api/" } }
}
