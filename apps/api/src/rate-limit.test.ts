import { afterEach, expect, test, vi } from "vite-plus/test"
import { buildApp } from "./app.ts"

const browser =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/141 Safari/537.36"
const post = (app: ReturnType<typeof buildApp>, headers: Record<string, string>, ip = "1.1.1.1") =>
  app.inject({ method: "POST", url: "/plan", payload: {}, headers, remoteAddress: ip })

afterEach(() => vi.unstubAllEnvs())

test("LLM routes reject obvious bots and cross-site browser calls", async () => {
  const app = buildApp()
  try {
    expect((await post(app, { "user-agent": "curl/8.7.1" })).statusCode).toBe(403)
    expect((await post(app, { "user-agent": "python-requests/2.32" })).statusCode).toBe(403)
    expect((await post(app, { "user-agent": "" })).statusCode).toBe(403)
    expect(
      (await post(app, { "user-agent": browser, "sec-fetch-site": "cross-site" })).statusCode,
    ).toBe(403)
    // Passes the guard; fails validation instead.
    expect(
      (await post(app, { "user-agent": browser, "sec-fetch-site": "same-origin" })).statusCode,
    ).toBe(400)
  } finally {
    await app.close()
  }
})

test("each client IP gets its own per-minute budget on LLM routes", async () => {
  const app = buildApp()
  try {
    for (let i = 0; i < 5; i++)
      expect((await post(app, { "user-agent": browser })).statusCode).toBe(400)
    const limited = await post(app, { "user-agent": browser })
    expect(limited.statusCode).toBe(429)
    expect(Number(limited.headers["retry-after"])).toBeGreaterThan(0)
    expect((await post(app, { "user-agent": browser }, "2.2.2.2")).statusCode).toBe(400)
    // Health checks are never limited.
    for (let i = 0; i < 130; i++)
      expect((await app.inject({ url: "/health", remoteAddress: "1.1.1.1" })).statusCode).toBe(200)
  } finally {
    await app.close()
  }
})

test("on Cloud Run the client is read from the proxy chain, so spoofed entries do not help", async () => {
  vi.stubEnv("K_SERVICE", "voxian-api")
  const app = buildApp()
  try {
    // "<spoofed>, <real client>, <web egress>": only the real client counts.
    const call = (spoof: string) =>
      post(app, { "user-agent": browser, "x-forwarded-for": `${spoof}, 9.9.9.9, 10.0.0.1` })
    for (let i = 0; i < 5; i++) expect((await call(`5.5.5.${i}`)).statusCode).toBe(400)
    expect((await call("5.5.5.99")).statusCode).toBe(429)
  } finally {
    await app.close()
  }
})
