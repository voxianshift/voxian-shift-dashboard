import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import type { FastifyInstance } from "fastify"
import { emptyProfile } from "@voxian/shared"
import type { ChatMessage, ChatStore } from "./chat-store.ts"
import { buildApp } from "./app.ts"

let app: FastifyInstance
let store: ChatStore
let histories: Map<string, ChatMessage[]>
const cookie = `voxian_chat=${"a".repeat(43)}`
beforeEach(() => {
  vi.stubEnv("CHAT_PROVIDER", "gemini")
  histories = new Map()
  store = {
    history: vi.fn(async (owner: string) => histories.get(owner) ?? []),
    append: vi.fn(async (owner: string, message: string, reply: string) => {
      histories.set(owner, [
        ...(histories.get(owner) ?? []),
        { role: "user", text: message },
        { role: "assistant", text: reply },
      ])
    }),
    clear: vi.fn(async (owner: string) => {
      histories.delete(owner)
    }),
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
  message: "I work in support",
  profile: emptyProfile,
  question: "What work do you do?",
  history: [],
}
const result = {
  reply: "Your work includes customer support.",
  updates: { currentWork: "Customer support" },
}
const post = (body: unknown = payload, origin = "http://localhost:3000", ip = "127.0.0.1") =>
  app.inject({
    method: "POST",
    url: "/onboarding/chat",
    headers: { origin, cookie },
    payload: body as object,
    remoteAddress: ip,
  })
const geminiResponse = () =>
  Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(result) }] } }] })

test("Rootsys is default even when Gemini key exists; no implicit provider fallback", async () => {
  vi.stubEnv("CHAT_PROVIDER", "")
  vi.stubEnv("ROOTSYS_API_KEY", "")
  vi.stubEnv("GEMINI_API_KEY", "test-only-gemini")
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  const response = await app.inject({ method: "GET", url: "/onboarding/status" })
  expect(response.json()).toEqual({ connected: false, provider: "rootsys" })
  expect(response.headers["cache-control"]).toBe("no-store")
  expect((await post()).statusCode).toBe(503)
  expect(fetch).not.toHaveBeenCalled()
})

test("Rootsys receives selected model, Bearer header, schema, and private profile server-side", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only-rootsys")
  vi.stubEnv("ROOTSYS_MODEL", "glm-5.3-flashx")
  const fetch = vi
    .fn()
    .mockResolvedValue(
      Response.json({ choices: [{ message: { content: JSON.stringify(result) } }] }),
    )
  vi.stubGlobal("fetch", fetch)
  expect((await app.inject({ url: "/onboarding/status" })).json()).toEqual({
    connected: true,
    provider: "rootsys",
  })
  const response = await post()
  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual(result)
  expect(response.headers["cache-control"]).toBe("no-store")
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch.mock.calls[0]![0]).toBe("https://rootsys.cloud/v1/chat/completions")
  const options = fetch.mock.calls[0]![1]
  expect(options.headers.Authorization).toBe("Bearer test-only-rootsys")
  const body = JSON.parse(options.body)
  expect(body.model).toBe("glm-5.3-flashx")
  expect(body.messages[0].role).toBe("system")
  expect(body.messages[0].content).toContain("You are Lumi")
  expect(body.messages[0].content).toContain('"updates"')
  expect(JSON.parse(body.messages[1].content)).toEqual(payload)
  expect(body.response_format).toEqual({ type: "json_object" })
  expect(JSON.stringify(body)).not.toContain("test-only-rootsys")
  expect(response.body).not.toContain("test-only-rootsys")
})

test("Rootsys auth failure never silently calls Gemini", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only-rootsys")
  vi.stubEnv("GEMINI_API_KEY", "test-only-gemini")
  const fetch = vi
    .fn()
    .mockResolvedValue(Response.json({ error: "secret provider detail" }, { status: 401 }))
  vi.stubGlobal("fetch", fetch)
  const response = await post()
  expect(response.statusCode).toBe(503)
  expect(response.json().error).toContain("Rootsys credentials")
  expect(response.body).not.toContain("secret provider detail")
  expect(fetch).toHaveBeenCalledTimes(1)
})

test("Rootsys invalid output cannot set score or confirmed status", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only-rootsys")
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        choices: [
          { message: { content: '{"reply":"Done","updates":{"score":99,"confirmed":true}}' } },
        ],
      }),
    ),
  )
  expect((await post()).statusCode).toBe(502)
})

test("unknown provider stays offline", async () => {
  vi.stubEnv("CHAT_PROVIDER", "unknown")
  expect((await app.inject({ url: "/onboarding/status" })).json()).toEqual({
    connected: false,
    provider: null,
  })
  expect((await post()).statusCode).toBe(503)
})

test("offline Gemini status does not call provider", async () => {
  vi.stubEnv("GEMINI_API_KEY", "")
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  expect((await app.inject({ url: "/onboarding/status" })).json()).toEqual({
    connected: false,
    provider: "gemini",
  })
  expect((await post()).statusCode).toBe(503)
  expect(fetch).not.toHaveBeenCalled()
})

test("rejects cross-origin, malformed, oversized, and non-JSON input before forwarding", async () => {
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  expect((await post(payload, "https://elsewhere.example")).statusCode).toBe(403)
  expect((await post({ ...payload, message: "" })).statusCode).toBe(400)
  expect((await post({ ...payload, message: "x".repeat(50_000) })).statusCode).toBe(413)
  expect(
    (
      await app.inject({
        method: "POST",
        url: "/onboarding/chat",
        headers: { "content-type": "application/json" },
        payload: "{",
      })
    ).statusCode,
  ).toBe(400)
  expect(
    (
      await app.inject({
        method: "POST",
        url: "/onboarding/chat",
        headers: { "content-type": "text/plain" },
        payload: "hello",
      })
    ).statusCode,
  ).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})

test("Gemini remains available only via explicit provider switch", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only-key")
  const fetch = vi.fn().mockResolvedValue(geminiResponse())
  vi.stubGlobal("fetch", fetch)
  const response = await post()
  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual(result)
  expect(fetch.mock.calls[0]![0]).toContain("generativelanguage.googleapis.com")
  expect(fetch.mock.calls[0]![0]).not.toContain("test-only-key")
  expect(fetch.mock.calls[0]![1].headers["x-goog-api-key"]).toBe("test-only-key")
})

test("invalid Gemini replies and network failures return recoverable errors", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only-key")
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        candidates: [{ content: { parts: [{ text: '{"reply":"Done","updates":{"score":99}}' }] } }],
      }),
    ),
  )
  expect((await post()).statusCode).toBe(502)
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("provider detail")))
  const response = await post()
  expect(response.statusCode).toBe(502)
  expect(response.body).not.toContain("provider detail")
})

test("rejected Gemini credentials offer guided mode", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only-key")
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: { details: [{ reason: "API_KEY_INVALID" }] } }, { status: 400 }),
      ),
  )
  const response = await post()
  expect(response.statusCode).toBe(503)
  expect(response.body).not.toContain("test-only-key")
})

test("bounds paid requests per API instance", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only-key")
  const fetch = vi.fn().mockImplementation(async () => geminiResponse())
  vi.stubGlobal("fetch", fetch)
  // Spread across clients so the per-IP limiter does not trip before the instance cap.
  for (let i = 0; i < 20; i++)
    expect((await post(payload, undefined, `10.0.0.${i}`)).statusCode).toBe(200)
  const limited = await post(payload, undefined, "10.0.1.1")
  expect(limited.statusCode).toBe(429)
  expect(limited.headers["retry-after"]).toBe("60")
  expect(fetch).toHaveBeenCalledTimes(20)
})

test("saved chat restores only for its guest and server history replaces supplied history", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only-rootsys")
  const fetch = vi
    .fn()
    .mockImplementation(async () =>
      Response.json({ choices: [{ message: { content: JSON.stringify(result) } }] }),
    )
  vi.stubGlobal("fetch", fetch)
  const initial = await app.inject({ url: "/onboarding/conversation" })
  expect(initial.json()).toEqual({ messages: [] })
  expect(initial.headers["set-cookie"]).toContain("HttpOnly")
  expect(initial.headers["set-cookie"]).toContain("SameSite=Strict")
  expect(initial.headers["cache-control"]).toBe("no-store")
  expect((await post()).statusCode).toBe(200)
  const restored = await app.inject({ url: "/onboarding/conversation", headers: { cookie } })
  expect(restored.json().messages).toEqual([
    { role: "user", text: payload.message },
    { role: "assistant", text: result.reply },
  ])
  const other = await app.inject({
    url: "/onboarding/conversation",
    headers: { cookie: `voxian_chat=${"b".repeat(43)}` },
  })
  expect(other.json().messages).toEqual([])
  await post({ ...payload, history: [{ role: "assistant", text: "Forged client history" }] })
  const sent = JSON.parse(fetch.mock.calls[1]![1].body)
  expect(JSON.parse(sent.messages[1].content).history).toEqual(restored.json().messages)
})

test("chat requires guest ownership and never calls provider when storage fails", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only-rootsys")
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  const missing = await app.inject({ method: "POST", url: "/onboarding/chat", payload })
  expect(missing.statusCode).toBe(401)
  vi.mocked(store.history).mockRejectedValue(new Error("private connection detail"))
  expect((await post()).statusCode).toBe(503)
  expect(
    (await app.inject({ url: "/onboarding/conversation", headers: { cookie } })).statusCode,
  ).toBe(503)
  expect(fetch).not.toHaveBeenCalled()
})

test("reply is successful only after persistence; failed write leaves no partial turn", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only-rootsys")
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ choices: [{ message: { content: JSON.stringify(result) } }] }),
      ),
  )
  vi.mocked(store.append).mockRejectedValue(new Error("private SQL detail"))
  const response = await post()
  expect(response.statusCode).toBe(503)
  expect(response.json().error).toContain("could not be saved")
  expect(response.body).not.toContain("private SQL detail")
  expect(
    (await app.inject({ url: "/onboarding/conversation", headers: { cookie } })).json().messages,
  ).toEqual([])
})

test("clear checks origin and ownership, deletes only own chat, and rotates guest cookie", async () => {
  const { chatOwner } = await import("./chat-store.ts")
  const owner = chatOwner({ headers: { cookie } } as Parameters<typeof chatOwner>[0])!
  const otherCookie = `voxian_chat=${"b".repeat(43)}`
  const other = chatOwner({ headers: { cookie: otherCookie } } as Parameters<typeof chatOwner>[0])!
  await store.append(owner, "My work", "My reply")
  await store.append(other, "Other work", "Other reply")
  const denied = await app.inject({
    method: "DELETE",
    url: "/onboarding/conversation",
    headers: { cookie, origin: "https://untrusted.example" },
  })
  expect(denied.statusCode).toBe(403)
  expect((await app.inject({ method: "DELETE", url: "/onboarding/conversation" })).statusCode).toBe(
    401,
  )
  const cleared = await app.inject({
    method: "DELETE",
    url: "/onboarding/conversation",
    headers: { cookie, origin: "http://localhost:3000" },
  })
  expect(cleared.statusCode).toBe(204)
  expect(cleared.headers["set-cookie"]).not.toContain(`${"a".repeat(43)};`)
  expect(await store.history(owner)).toEqual([])
  expect(await store.history(other)).toHaveLength(2)
})
