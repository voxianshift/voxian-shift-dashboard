import {
  createOccupationCatalogue,
  registerOccupations,
  type OccupationCatalogue,
} from "./occupation-catalogue.ts"
import Fastify from "fastify"
import { registerCv } from "./cv.ts"
import { registerOnboarding } from "./onboarding.ts"
import { registerPlan } from "./plan.ts"
import { registerNavigator } from "./navigator.ts"
import { registerCopilot } from "./copilot.ts"
import { registerRateLimit } from "./rate-limit.ts"
import { createChatStore, type ChatStore } from "./chat-store.ts"
import { SCORING_VERSION } from "@voxian/shared"
import { createGuestStore, registerGuest, type GuestStore } from "./guest-store.ts"
import { createCvVectorStore, type CvVectorStore } from "./cv-vector-store.ts"

export function buildApp(
  options: {
    chatStore?: ChatStore
    catalogue?: OccupationCatalogue
    guestStore?: GuestStore
    cvVectorStore?: CvVectorStore
  } = {},
) {
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
  registerCv(app, catalogue)
  registerOnboarding(app, store, catalogue)
  registerPlan(app, catalogue)
  const cvVectors =
    options.cvVectorStore ??
    (process.env.DATABASE_URL && ["shadow", "active"].includes(process.env.CV_VECTOR_MODE ?? "")
      ? createCvVectorStore(process.env.DATABASE_URL)
      : undefined)
  if (cvVectors) app.addHook("onClose", () => cvVectors.close())
  registerNavigator(app, catalogue, cvVectors)
  registerCopilot(app, catalogue, store)
  const guestStore =
    options.guestStore ??
    (process.env.DATABASE_URL ? createGuestStore(process.env.DATABASE_URL) : undefined)
  if (guestStore) app.addHook("onClose", () => guestStore.close())
  registerGuest(app, guestStore)

  return app
}
