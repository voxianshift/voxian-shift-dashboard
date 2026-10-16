import Fastify from "fastify"
import { SCORING_VERSION } from "@voxian/shared"

export function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" })

  app.get("/healthz", async () => ({ ok: true, scoringVersion: SCORING_VERSION }))

  return app
}
