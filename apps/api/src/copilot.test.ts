import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import type { FastifyInstance } from "fastify"
import { emptyProfile } from "@voxian/shared"
import { buildApp } from "./app.ts"

let app: FastifyInstance
beforeEach(() => {
  app = buildApp()
})
afterEach(async () => {
  await app.close()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

const payload = {
  message: "What does G2 mean on this page?",
  route: "/meter",
  profile: emptyProfile,
  history: [],
}

test("rejects request without origin or malformed body", async () => {
  const badBody = await app.inject({
    method: "POST",
    url: "/copilot/chat",
    headers: { origin: "http://localhost:3000" },
    payload: { message: "" },
  })
  expect(badBody.statusCode).toBe(400)
})

test("returns 503 when AI provider key is not configured (Option B strict behavior)", async () => {
  vi.stubEnv("CHAT_PROVIDER", "gemini")
  vi.stubEnv("GEMINI_API_KEY", "")
  const res = await app.inject({
    method: "POST",
    url: "/copilot/chat",
    headers: { origin: "http://localhost:3000" },
    payload,
  })
  expect(res.statusCode).toBe(503)
  expect(JSON.parse(res.body).error).toContain("AI copilot is not configured")
})

test("returns parsed copilot result with actions and suggestions when AI responds", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-key")
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                reply:
                  "G2 indicates Generative AI exposure level 2, which affects cognitive communication tasks.",
                actions: [{ type: "NAVIGATE", href: "/roadmap", label: "Check Roadmap" }],
                suggestedQuestions: ["Show me my best path", "How can I reduce risk?"],
              }),
            },
          },
        ],
      }),
    ),
  )

  const res = await app.inject({
    method: "POST",
    url: "/copilot/chat",
    headers: { origin: "http://localhost:3000" },
    payload,
  })
  expect(res.statusCode).toBe(200)
  const body = JSON.parse(res.body)
  expect(body.reply).toContain("G2 indicates")
  expect(body.actions).toHaveLength(1)
  expect(body.actions[0].type).toBe("NAVIGATE")
  expect(body.suggestedQuestions).toContain("Show me my best path")
})
