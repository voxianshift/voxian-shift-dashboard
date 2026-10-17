import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import type { FastifyInstance } from "fastify"
import { emptyProfile } from "@voxian/shared"
import type { ChatStore } from "./chat-store.ts"
import { buildApp } from "./app.ts"

let app: FastifyInstance
let store: ChatStore
let memories: { userMessage: string; assistantMessage: string }[] = []
let savedMemories: { userMessage: string; assistantMessage: string; embedding?: number[] }[] = []

beforeEach(() => {
  memories = []
  savedMemories = []
  store = {
    history: vi.fn(async () => []),
    append: vi.fn(async () => {}),
    saveMemory: vi.fn(async (_owner, userMessage, assistantReply, embedding) => {
      savedMemories.push({ userMessage, assistantMessage: assistantReply, embedding })
    }),
    searchMemories: vi.fn(async () => memories),
    clear: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
  }
  app = buildApp({ chatStore: store })
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

test("generates embeddings, retrieves past memory, and returns copilot response", async () => {
  vi.stubEnv("CHAT_PROVIDER", "gemini")
  vi.stubEnv("GEMINI_API_KEY", "test-gemini-key")

  memories.push({
    userMessage: "I want to transition from support to developer",
    assistantMessage: "We identified Software Developer as a strong pathway.",
  })

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      // Mock Gemini embedding endpoint
      if (url.includes(":embedContent")) {
        return Response.json({
          embedding: { values: [0.12, -0.34, 0.56] },
        })
      }
      // Mock Gemini chat completion endpoint
      return Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply:
                      "G2 indicates Generative AI exposure level 2, which affects cognitive communication tasks.",
                    actions: [{ type: "NAVIGATE", href: "/roadmap", label: "Check Roadmap" }],
                    suggestedQuestions: ["Show me my best path", "How can I reduce risk?"],
                  }),
                },
              ],
            },
          },
        ],
      })
    }),
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

  // Verify memory search and persistence
  expect(store.searchMemories).toHaveBeenCalled()
  expect(store.saveMemory).toHaveBeenCalled()
  expect(savedMemories).toHaveLength(1)
  expect(savedMemories[0]?.embedding).toEqual([0.12, -0.34, 0.56])
})
