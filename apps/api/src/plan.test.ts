import { expect, test } from "vite-plus/test"
import { buildApp } from "./app.ts"

test("plan route rejects bad input and foreign origins before calling the LLM", async () => {
  const app = buildApp()
  const bad = await app.inject({ method: "POST", url: "/plan", payload: { role: "" } })
  expect(bad.statusCode).toBe(400)
  const foreign = await app.inject({
    method: "POST",
    url: "/plan",
    headers: { origin: "https://evil.example" },
    payload: { role: "Dev", direction: "X", targetRoles: [], pace: "lean" },
  })
  expect(foreign.statusCode).toBe(403)
})
