import {
  createOccupationCatalogue,
  registerOccupations,
  type OccupationCatalogue,
} from "./occupation-catalogue.ts"
import Fastify from "fastify"
import { registerOnboarding } from "./onboarding.ts"
import { createChatStore, type ChatStore } from "./chat-store.ts"
import { SCORING_VERSION } from "@voxian/shared"

export function buildApp(options: { chatStore?: ChatStore; catalogue?: OccupationCatalogue } = {}) {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" })

  // not /healthz: Cloud Run reserves paths ending in "z"
  app.get("/health", async () => ({ ok: true, scoringVersion: SCORING_VERSION }))

  const store =
    options.chatStore ??
    (process.env.DATABASE_URL ? createChatStore(process.env.DATABASE_URL) : undefined)
  if (store) app.addHook("onClose", () => store.close())
  const catalogue =
    options.catalogue ??
    (process.env.DATABASE_URL ? createOccupationCatalogue(process.env.DATABASE_URL) : undefined)
  if (catalogue) app.addHook("onClose", () => catalogue.close())
  registerOccupations(app, catalogue)
  registerOnboarding(app, store, catalogue)

  return app
}
