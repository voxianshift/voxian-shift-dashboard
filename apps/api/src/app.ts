import {
  createOccupationCatalogue,
  registerOccupations,
  type OccupationCatalogue,
} from "./occupation-catalogue.ts"
import Fastify from "fastify"
import { registerOnboarding } from "./onboarding.ts"
import { registerPlan } from "./plan.ts"
import { registerNavigator } from "./navigator.ts"
import { registerRateLimit } from "./rate-limit.ts"
import { createChatStore, type ChatStore } from "./chat-store.ts"
import { SCORING_VERSION } from "@voxian/shared"

export function buildApp(options: { chatStore?: ChatStore; catalogue?: OccupationCatalogue } = {}) {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
    // On Cloud Run (K_SERVICE set) traffic arrives via the web app's Next rewrite, so
    // X-Forwarded-For ends with "<client>, <web egress>"; trust two hops to rate-limit the client.
    trustProxy: process.env.K_SERVICE ? (_address: string, hop: number) => hop < 2 : false,
  })
  registerRateLimit(app)

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
  registerPlan(app, catalogue)
  registerNavigator(app, catalogue)

  return app
}
