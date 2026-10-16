import { expect, test } from "vite-plus/test"
import { buildApp } from "./app.ts"

test("GET /health", async () => {
  const res = await buildApp().inject({ method: "GET", url: "/health" })
  expect(res.statusCode).toBe(200)
  expect(res.json()).toEqual({ ok: true, scoringVersion: "1" })
})
