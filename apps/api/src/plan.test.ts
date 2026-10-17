import { expect, test, vi } from "vite-plus/test"
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

test("flight plan keeps only modules copied from the supplied courses", async () => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only")
  vi.stubEnv("DATABASE_URL", "")
  const phase = (module: string) => ({
    title: "Phase",
    days: "Days 1–30",
    focus: "Focus",
    actions: ["One", "Two"],
    deliverable: "Thing",
    flightPlan: [
      { days: "D1–D15", focus: "Learn", module },
      { days: "D16–D30", focus: "Apply" },
    ],
  })
  const plan = {
    summary: "S",
    phases: [phase("Kaggle Learn"), phase("Invented Course"), phase("Kaggle Learn")],
    firstStep: "Start",
  }
  const fetch = vi
    .fn()
    .mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify(plan) } }] }))
  vi.stubGlobal("fetch", fetch)
  const app = buildApp()
  try {
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: {
        role: "Dev",
        direction: "Quality",
        targetRoles: [],
        pace: "lean",
        courses: ["Kaggle Learn"],
      },
    })
    expect(response.statusCode).toBe(200)
    const phases = response.json().plan.phases
    expect(phases[0].flightPlan[0].module).toBe("Kaggle Learn")
    expect(phases[1].flightPlan[0].module).toBeUndefined()
    const input = JSON.parse(
      JSON.parse(fetch.mock.calls[0]![1]!.body as string).messages[1].content,
    )
    expect(input.courses).toEqual(["Kaggle Learn"])
  } finally {
    await app.close()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  }
})
