import type { FastifyInstance, FastifyRequest } from "fastify"

// Requests per client IP per minute. LLM routes cost money, so they get the tightest limits.
const perMinute: Record<string, number> = {
  "/plan": 5,
  "/onboarding/cv": 5,
  "/navigator/paths": 5,
  "/onboarding/chat": 15,
  "/copilot/chat": 15,
}
const defaultPerMinute = 120
const windowMs = 60_000
const llmRoutes = new Set(Object.keys(perMinute))
// Obvious scripted clients and crawlers; real users reach these routes from the web app.
const botAgent =
  /bot|crawl|spider|slurp|curl|wget|python|httpie|scrapy|go-http|okhttp|java\/|libwww|headless/i

/**
 * Per-IP fixed-window limiter plus a cheap bot screen on the LLM routes.
 * ponytail: in-memory per Cloud Run instance, so limits multiply by instance count; move counters
 * to a shared store (Redis/Firestore) if the API scales out or abuse gets past this.
 */
export function registerRateLimit(app: FastifyInstance) {
  const hits = new Map<string, { start: number; count: number }>()
  app.addHook("onRequest", async (request, reply) => {
    const route = request.routeOptions.url
    if (!route || route === "/health") return
    if (llmRoutes.has(route) && looksAutomated(request))
      return reply.code(403).send({ error: "Automated requests are not allowed." })
    const now = Date.now()
    if (hits.size > 10_000)
      for (const [key, hit] of hits) if (now - hit.start >= windowMs) hits.delete(key)
    const limit = perMinute[route] ?? defaultPerMinute
    const key = `${llmRoutes.has(route) ? route : "*"}|${request.ip}`
    let hit = hits.get(key)
    if (!hit || now - hit.start >= windowMs) hits.set(key, (hit = { start: now, count: 0 }))
    if (++hit.count > limit) {
      const retryAfter = Math.ceil((hit.start + windowMs - now) / 1000)
      return reply
        .code(429)
        .header("Retry-After", String(retryAfter))
        .send({ error: `Too many requests. Try again in ${retryAfter} seconds.` })
    }
  })
}

function looksAutomated(request: FastifyRequest) {
  const agent = request.headers["user-agent"]
  // Browsers mark cross-site fetches; only the web app's same-origin calls should reach LLM routes.
  const site = request.headers["sec-fetch-site"]
  return !agent || botAgent.test(agent) || site === "cross-site"
}
