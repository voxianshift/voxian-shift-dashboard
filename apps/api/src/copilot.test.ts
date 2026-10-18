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
  expect(store.append).toHaveBeenCalled()
  expect(savedMemories).toHaveLength(1)
  expect(savedMemories[0]?.embedding).toEqual([0.12, -0.34, 0.56])
})

test("fetches and deletes copilot chat history", async () => {
  const cookie = "voxian_chat=abcdefghijklmnopqrstuvwxyz12345678901234567"
  ;(store.history as any).mockResolvedValueOnce([
    { role: "user", text: "Hello Lumi" },
    { role: "assistant", text: "Hi! How can I help?" },
  ])

  const getRes = await app.inject({
    method: "GET",
    url: "/copilot/history",
    headers: { cookie },
  })
  expect(getRes.statusCode).toBe(200)
  const getData = JSON.parse(getRes.body)
  expect(getData.history).toHaveLength(2)
  expect(getData.history[0].text).toBe("Hello Lumi")

  const delRes = await app.inject({
    method: "DELETE",
    url: "/copilot/history",
    headers: { cookie },
  })
  expect(delRes.statusCode).toBe(200)
  expect(store.clear).toHaveBeenCalled()
})

test("handles multi-step tool execution loop for occupation tasks", async () => {
  vi.stubEnv("CHAT_PROVIDER", "gemini")
  vi.stubEnv("GEMINI_API_KEY", "test-gemini-key")

  let callCount = 0
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes(":embedContent")) {
        return Response.json({ embedding: { values: [0.1, 0.2] } })
      }
      callCount++
      if (callCount === 1) {
        // Step 1: Model requests a tool call to inspect tasks for 15-1252.00
        return Response.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      toolCall: {
                        name: "get_occupation_tasks",
                        parameters: { code: "15-1252.00" },
                      },
                    }),
                  },
                ],
              },
            },
          ],
        })
      }
      // Step 2: Model returns final answer after observing tool output
      return Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply:
                      "For Software Developers (15-1252.00), writing code has 68% exposure, while problem solving is a resilient moat.",
                    actions: [
                      {
                        type: "PICK_TARGET_ROLE",
                        occupationId: "15-1252.00",
                        title: "Software Developer",
                        explanation: "High-value resilient destination",
                      },
                    ],
                    suggestedQuestions: ["Show transition steps", "What skills are needed?"],
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
    payload: {
      message: "What are the tasks and exposure for Software Developer?",
      route: "/meter",
      profile: emptyProfile,
      history: [],
    },
  })

  expect(res.statusCode).toBe(200)
  const body = JSON.parse(res.body)
  expect(body.reply).toContain("Software Developers")
  expect(body.actions[0].type).toBe("PICK_TARGET_ROLE")
  expect(callCount).toBe(2)
})

test("streams SSE events when Accept is text/event-stream", async () => {
  vi.stubEnv("CHAT_PROVIDER", "gemini")
  vi.stubEnv("GEMINI_API_KEY", "test-gemini-key")

  let callCount = 0
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes(":embedContent")) {
        return Response.json({ embedding: { values: [0.1, 0.2] } })
      }
      callCount++
      if (callCount === 1) {
        return Response.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      toolCall: {
                        name: "search_occupations",
                        parameters: { query: "developer" },
                      },
                    }),
                  },
                ],
              },
            },
          ],
        })
      }
      return Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: "Here are developer pathways tailored for you.",
                    actions: [{ type: "NAVIGATE", href: "/roadmap", label: "Roadmap" }],
                    suggestedQuestions: ["Next steps?"],
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
    headers: {
      origin: "http://localhost:3000",
      accept: "text/event-stream",
    },
    payload: {
      message: "Find developer jobs",
      route: "/home",
      profile: emptyProfile,
      history: [],
    },
  })

  expect(res.statusCode).toBe(200)
  expect(res.headers["content-type"]).toContain("text/event-stream")
  expect(res.body).toContain("event: tool_call")
  expect(res.body).toContain('"name":"search_occupations"')
  expect(res.body).toContain("event: tool_result")
  expect(res.body).toContain("event: delta")
  expect(res.body).toContain("event: final")
  expect(res.body).toContain("event: done")
})
