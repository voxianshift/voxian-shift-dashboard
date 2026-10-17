import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import {
  emptyProfile,
  navigatorContext,
  navigatorResultSchema,
  navigatorResources,
} from "@voxian/shared"
import { buildApp } from "./app.ts"
import type { OccupationCatalogue } from "./occupation-catalogue.ts"

const developer = {
  code: "15-1252.00",
  title: "Software Developers",
  description: "Design, test and maintain software.",
  category: "Computing",
  sourceVersion: "31.0",
  baselineId: null,
  reason: "Exact code",
}
const admin = { ...developer, code: "43-6011.00", title: "Executive Assistants" }
const context = navigatorContext({
  ...emptyProfile,
  preferredName: "Private name",
  occupations: [developer.code, admin.code],
  primaryOccupation: developer.code,
  hours: "1–2 hours",
  strengths: ["Solving problems"],
  goals: ["Stability"],
  risk: "Small changes",
  timeline: "Within a year",
  anxieties: "Limited time",
  flexibility: "Stay near home",
})
const draft = () => ({
  summary: "Directions for software development with limited study time.",
  recommendedPathId: "automate",
  paths: (["automate", "hybrid", "pivot", "create"] as const).map((id) => ({
    id,
    title: `Software ${id}`,
    focus: "Development experience",
    description: "Build from existing software work.",
    why: "Fits limited available study time.",
    skills: ["Testing", "Communication", "Coding"],
    roles: [`${id} Developer`, `${id} Analyst`, `${id} Specialist`],
    project: "Build a small tool using synthetic data.",
    firstStep: "Map a recurring workflow.",
    resourceIds: ["web"],
    roleResourceIds: [["istqb"], ["kaggle", "web", "https://invented.example"], ["sre"]],
  })),
})
function catalogue(): OccupationCatalogue {
  return {
    search: vi.fn(async (code) => [developer, admin].filter((role) => role.code === code)),
    selections: async () => ({ occupations: [], primaryOccupation: "" }),
    select: async () => {},
    close: async () => {},
  }
}
function completion(body: unknown) {
  return Response.json({ choices: [{ message: { content: JSON.stringify(body) } }] })
}
beforeEach(() => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only")
  vi.stubEnv("DATABASE_URL", "")
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test("Navigator uses authoritative occupations and complete profile constraints, with reviewed resource URLs", async () => {
  const fetch = vi.fn().mockResolvedValue(completion(draft()))
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: context },
    })
    expect(response.statusCode).toBe(200)
    const result = navigatorResultSchema.parse(response.json())
    expect(result.paths.map((path) => path.id)).toEqual(["automate", "hybrid", "pivot", "create"])
    expect(result.paths.map((path) => path.colorToken)).toEqual([
      "chart-3",
      "tertiary",
      "warning",
      "success",
    ])
    expect(result.paths.map((path) => path.label)).toEqual([
      "Automate",
      "Hybrid",
      "Pivot",
      "Create",
    ])
    expect(result).toMatchObject({
      roleTitle: developer.title,
      occupationCode: developer.code,
      recommendedPathId: null,
      contractVersion: 2,
      recommendation: { strategyId: null, reasonCode: "insufficient_preferences" },
    })
    expect(result.paths[0]!.resources[0]!.href).toBe(navigatorResources.web.href)
    // Role picks keep catalogue IDs only; the invented one is dropped.
    expect(result.paths[0]!.roleResources[1]!.map((r) => r.href)).toEqual([
      navigatorResources.kaggle.href,
      navigatorResources.web.href,
    ])
    const request = JSON.parse(fetch.mock.calls[0]![1]!.body as string)
    const input = JSON.parse(request.messages[1].content)
    expect(input.profile).toEqual(context)
    expect(input.occupations.map((role: { title: string }) => role.title)).toEqual([
      developer.title,
      admin.title,
    ])
    expect(input.tasks.length).toBeGreaterThan(0)
    expect(JSON.stringify(input)).not.toContain("Private name")
    expect(response.headers["cache-control"]).toBe("no-store")
  } finally {
    await app.close()
  }
})

test("Navigator rejects missing, foreign-origin and unknown occupations without asking provider", async () => {
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/navigator/paths",
          payload: { profile: navigatorContext(emptyProfile) },
        })
      ).statusCode,
    ).toBe(400)
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/navigator/paths",
          headers: { origin: "https://foreign.example" },
          payload: { profile: context },
        })
      ).statusCode,
    ).toBe(403)
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/navigator/paths",
          payload: {
            profile: { ...context, occupations: ["15-9999.00"], primaryOccupation: "15-9999.00" },
          },
        })
      ).statusCode,
    ).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})

for (const failure of ["url", "duplicate", "malformed", "provider"] as const) {
  test(`Navigator rejects ${failure} response instead of returning sample paths`, async () => {
    const result = draft()
    if (failure === "url") result.paths[0]!.resourceIds = ["https://untrusted.example/course"]
    if (failure === "duplicate") result.paths[1]!.id = result.paths[0]!.id
    const fetch = vi
      .fn()
      .mockResolvedValue(
        failure === "provider"
          ? new Response(null, { status: 500 })
          : completion(failure === "malformed" ? { paths: [] } : result),
      )
    vi.stubGlobal("fetch", fetch)
    const app = buildApp({ catalogue: catalogue() })
    try {
      const response = await app.inject({
        method: "POST",
        url: "/navigator/paths",
        payload: { profile: context },
      })
      expect(response.statusCode).toBe(502)
      expect(response.json()).toEqual({
        error: "Your career paths could not be prepared. Try again.",
      })
    } finally {
      await app.close()
    }
  })
}

test("missing provider key has explicit setup error", async () => {
  vi.stubEnv("ROOTSYS_API_KEY", "")
  const app = buildApp({ catalogue: catalogue() })
  try {
    expect(
      (await app.inject({ method: "POST", url: "/navigator/paths", payload: { profile: context } }))
        .statusCode,
    ).toBe(503)
  } finally {
    await app.close()
  }
})

test("plan generation receives the actual selected target and optional profile answers", async () => {
  const plan = {
    summary: "Practical software plan.",
    phases: [1, 2, 3].map((phase) => ({
      title: `Phase ${phase}`,
      days: "Days 1–30",
      focus: "Practical project",
      actions: ["Map work", "Review evidence"],
      deliverable: "A reviewed project",
      flightPlan: [
        { days: "D1–D15", focus: "Learn" },
        { days: "D16–D30", focus: "Apply" },
      ],
    })),
    firstStep: "Map one task.",
  }
  const fetch = vi.fn().mockResolvedValue(completion(plan))
  vi.stubGlobal("fetch", fetch)
  const app = buildApp()
  try {
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: {
        role: developer.title,
        occupationCode: developer.code,
        direction: "Developer Tooling",
        targetRoles: ["Developer Tools Engineer"],
        pace: "lean",
        goals: context.goals,
        hours: context.hours,
        profile: context,
      },
    })
    expect(response.statusCode).toBe(200)
    const input = JSON.parse(
      JSON.parse(fetch.mock.calls[0]![1]!.body as string).messages[1].content,
    )
    expect(input).toMatchObject({
      role: developer.title,
      targetRoles: ["Developer Tools Engineer"],
      profile: context,
      goals: ["Stability"],
      hours: "1–2 hours",
    })
  } finally {
    await app.close()
  }
})

test("backend owns recommendation and canonical order even when provider disagrees", async () => {
  const providerDraft = draft()
  providerDraft.paths.reverse()
  const fetch = vi.fn().mockImplementation(() => completion(providerDraft))
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    for (const [preferences, expected] of [
      [{ movementPreference: "change" }, "pivot"],
      [{ movementPreference: "stay", selectedStrategyId: "create" }, "create"],
      [{}, null],
    ] as const) {
      const response = await app.inject({
        method: "POST",
        url: "/navigator/paths",
        payload: { profile: { ...context, direction: "change careers" }, ...preferences },
      })
      expect(response.statusCode).toBe(200)
      expect(response.json().recommendedPathId).toBe(expected)
      expect(response.json().recommendation.strategyId).toBe(expected)
      expect(response.json().paths.map((path: { id: string }) => path.id)).toEqual([
        "automate",
        "hybrid",
        "pivot",
        "create",
      ])
    }
    const bad = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: context, selectedStrategyId: "quality" },
    })
    expect(bad.statusCode).toBe(400)
    expect(fetch).toHaveBeenCalledTimes(3)
  } finally {
    await app.close()
  }
})
