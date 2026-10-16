import { expect, test } from "vite-plus/test"
import { buildApp } from "./app.ts"

test("GET /healthz", async () => {
  const res = await buildApp().inject({ method: "GET", url: "/healthz" })
  expect(res.statusCode).toBe(200)
  expect(res.json()).toEqual({ ok: true, scoringVersion: "1" })
})
