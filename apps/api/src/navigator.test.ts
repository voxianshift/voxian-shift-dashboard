import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import { emptyProfile, navigatorContext, navigatorResultSchema, pathIdSchema } from "@voxian/shared"
import { buildApp } from "./app.ts"
import type { OccupationCatalogue } from "./occupation-catalogue.ts"
import { lookupPathways } from "./navigator-pathways.ts"

const developer = {
  code: "15-1252.00",
  title: "Software Developers",
  description: "Design and maintain software.",
  category: "Computing",
  sourceVersion: "31.0",
  baselineId: null,
  reason: "Exact code",
}
const admin = { ...developer, code: "43-6011.00", title: "Executive Assistants" }
const unknownMapping = { ...developer, code: "11-1011.00", title: "Chief Executives" }
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
function catalogue(): OccupationCatalogue {
  return {
    search: vi.fn(async (code) =>
      [developer, admin, unknownMapping].filter((role) => role.code === code),
    ),
    selections: async () => ({ occupations: [], primaryOccupation: "" }),
    select: async () => {},
    close: async () => {},
  }
}
function completion(body: unknown) {
  return Response.json({ choices: [{ message: { content: JSON.stringify(body) } }] })
}
function draft() {
  const mappings = lookupPathways(developer.code)
  return {
    summary: "Explore your supplied pathways within available time.",
    paths: pathIdSchema.options.map((id) => ({
      id,
      destinationIds: mappings[id]?.destinations.map((role) => role.id) ?? [],
      focus: "Practical domain work",
      description: "Build on existing experience.",
      why: "Explore using a small sample.",
      humanEdge: "Review ambiguous outcomes.",
      tradeoff: "Training and feedback are needed.",
      skills: ["Testing", "Communication", "Coding"],
      project: "Build a small sample using synthetic data.",
      firstStep: "Review one workflow.",
      resourceIds: ["web"],
      destinationResources: (mappings[id]?.destinations ?? []).map((role) => ({
        destinationId: role.id,
        resourceIds: ["learn"],
      })),
    })),
  }
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

test("destinations and titles are backend lookups while narrative uses confirmed context", async () => {
  const result = { ...draft(), recommendedPathId: "create" }
  const fetch = vi.fn().mockImplementation(() => completion(result))
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: context, movementPreference: "change" },
    })
    expect(response.statusCode).toBe(200)
    const body = navigatorResultSchema.parse(response.json())
    expect(body.contractVersion).toBe(3)
    expect(body.generationStatus).toBe("personalized")
    expect(body.recommendedPathId).toBeNull()
    expect(body.paths.map((path) => path.id)).toEqual(pathIdSchema.options)
    expect(body.paths[0]!.destinations).toEqual(
      lookupPathways(developer.code).automate!.destinations,
    )
    expect(body.paths[0]!.title).toBe(lookupPathways(developer.code).automate!.title)
    expect(body.paths[3]).toMatchObject({
      coverage: "available",
      title: "AI Safety & Red Team Lead",
    })
    expect(body.paths[3]!.roleResources[0]![0]!.href).toBe(
      "https://learn.microsoft.com/en-us/training/",
    )
    expect(body.paths[3]!.destinations).toEqual(lookupPathways(developer.code).create!.destinations)
    const input = JSON.parse(
      JSON.parse(fetch.mock.calls[0]![1]!.body as string).messages[1].content,
    )
    expect(input.profile).toEqual(context)
    expect(input.occupationalEvidence.status).toBe("available")
    expect(input.occupationalEvidence.mapping.isco).toMatch(/^\d{4}$/)
    expect(input.occupationalEvidence.tasks.length).toBeGreaterThan(0)
    expect(
      input.occupationalEvidence.tasks.every(
        (task: { exposure: number }) => task.exposure >= 0 && task.exposure <= 1,
      ),
    ).toBe(true)
    expect(input.transferableSkills.userStatedStrengths).toEqual(context.strengths)
    expect(input.transferableSkills.byStrategy[3].skills).toEqual(
      lookupPathways(developer.code).create!.skills,
    )
    expect(input.pathways[0].destinationIds).toEqual(
      body.paths[0]!.destinations.map((role) => role.id),
    )
    expect(JSON.stringify(input)).not.toContain("Private name")
    expect(response.headers["cache-control"]).toBe("no-store")
  } finally {
    await app.close()
  }
})

for (const failure of [
  "invented",
  "reordered",
  "duplicate",
  "url",
  "malformed",
  "provider",
] as const) {
  test(`provider ${failure} output never changes reviewed roles`, async () => {
    const result = draft()
    if (failure === "invented") result.paths[0]!.destinationIds = ["invented-job"]
    if (failure === "reordered") result.paths[0]!.destinationIds.reverse()
    if (failure === "duplicate") result.paths[1]!.id = result.paths[0]!.id
    if (failure === "url") result.paths[0]!.resourceIds = ["https://invented.example"]
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          failure === "provider"
            ? new Response(null, { status: 500 })
            : completion(failure === "malformed" ? {} : result),
        ),
    )
    const app = buildApp({ catalogue: catalogue() })
    try {
      const response = await app.inject({
        method: "POST",
        url: "/navigator/paths",
        payload: { profile: context },
      })
      expect(response.statusCode).toBe(200)
      const body = navigatorResultSchema.parse(response.json())
      expect(body.generationStatus).toBe("unavailable")
      expect(body.paths[0]!.destinations).toEqual(
        lookupPathways(developer.code).automate!.destinations,
      )
      expect(body.paths[0]!.roles).not.toContain("invented-job")
    } finally {
      await app.close()
    }
  })
}

test("provider title injection is stripped and repeated generation preserves destinations", async () => {
  const fetch = vi.fn().mockImplementation(() =>
    completion({
      ...draft(),
      paths: draft().paths.map((path) => ({
        ...path,
        roles: ["Invented occupation"],
        title: "Invented title",
      })),
    }),
  )
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    const results = []
    for (let i = 0; i < 2; i++)
      results.push(
        (
          await app.inject({
            method: "POST",
            url: "/navigator/paths",
            payload: { profile: context, selectedStrategyId: "automate" },
          })
        ).json(),
      )
    expect(results[0].paths.map((p: { destinations: unknown }) => p.destinations)).toEqual(
      results[1].paths.map((p: { destinations: unknown }) => p.destinations),
    )
    expect(results[0].recommendedPathId).toBe("automate")
    expect(results[0].paths[0].title).not.toBe("Invented title")
    expect(results[0].paths[0].roles).not.toContain("Invented occupation")
  } finally {
    await app.close()
  }
})

test("no key retains reviewed roles; missing mapping makes no AI call and invents nothing", async () => {
  vi.stubEnv("ROOTSYS_API_KEY", "")
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: context },
    })
    expect(response.json().generationStatus).toBe("reviewed_only")
    expect(response.json().paths[0].destinations).toEqual(
      lookupPathways(developer.code).automate!.destinations,
    )
    vi.stubEnv("ROOTSYS_API_KEY", "test-only")
    const missing = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: {
        profile: {
          ...context,
          occupations: [unknownMapping.code],
          primaryOccupation: unknownMapping.code,
        },
        selectedStrategyId: "create",
      },
    })
    const body = navigatorResultSchema.parse(missing.json())
    expect(
      body.paths.every((p) => p.coverage === "unsupported" && p.destinations.length === 0),
    ).toBe(true)
    expect(body.recommendedPathId).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})

test("invalid or foreign requests never call provider", async () => {
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  try {
    for (const [payload, headers, status] of [
      [{ profile: navigatorContext(emptyProfile) }, {}, 400],
      [{ profile: context }, { origin: "https://foreign.example" }, 403],
      [
        { profile: { ...context, occupations: ["15-9999.00"], primaryOccupation: "15-9999.00" } },
        {},
        400,
      ],
      [{ profile: context, selectedStrategyId: "quality" }, {}, 400],
    ] as const)
      expect(
        (await app.inject({ method: "POST", url: "/navigator/paths", payload, headers }))
          .statusCode,
      ).toBe(status)
    expect(fetch).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})
test("all reviewed source mappings return valid grounded fallback results without provider", async () => {
  vi.stubEnv("ROOTSYS_API_KEY", "")
  const { default: data } = await import("../data/navigator-pathways.json", {
    with: { type: "json" },
  })
  const store = catalogue()
  store.search = async (code) => [{ ...developer, code }]
  const app = buildApp({ catalogue: store })
  try {
    for (const [index, code] of Object.keys(data.occupations).entries()) {
      const response = await app.inject({
        method: "POST",
        url: "/navigator/paths",
        payload: { profile: { ...context, occupations: [code], primaryOccupation: code } },
        remoteAddress: `127.0.0.${index + 1}`,
      })
      expect(response.statusCode, code).toBe(200)
      expect(
        response
          .json()
          .paths.every(
            (path: { coverage: string; destinations: unknown[] }) =>
              path.coverage === "available" && path.destinations.length > 0,
          ),
        code,
      ).toBe(true)
      expect(navigatorResultSchema.safeParse(response.json()).success, code).toBe(true)
    }
  } finally {
    await app.close()
  }
})

test("missing task evidence stays unknown while reviewed Create remains available", async () => {
  const fetch = vi.fn().mockImplementation((_url, options) => {
    const input = JSON.parse(JSON.parse(options.body).messages[1].content)
    expect(input.occupationalEvidence).toMatchObject({
      status: "unavailable",
      mapping: null,
      gradient: null,
      tasks: [],
    })
    expect(input.transferableSkills.byStrategy[3].skills.length).toBeGreaterThan(0)
    return completion({
      ...draft(),
      paths: draft().paths.map((path, index) => ({
        ...path,
        destinationIds: input.pathways[index].destinationIds,
        destinationResources: [],
      })),
    })
  })
  vi.stubGlobal("fetch", fetch)
  const store = catalogue()
  store.search = async (code) => [{ ...developer, code }]
  const app = buildApp({ catalogue: store })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: {
        profile: { ...context, occupations: ["13-1199.06"], primaryOccupation: "13-1199.06" },
      },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().generationStatus).toBe("personalized")
    expect(response.json().paths[3].coverage).toBe("available")
    expect(fetch).toHaveBeenCalledOnce()
  } finally {
    await app.close()
  }
})

test("invented destination-specific resource IDs cannot bypass grounded lookup", async () => {
  const result = draft()
  result.paths[0]!.destinationResources[0]!.destinationId = "invented-destination"
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(completion(result)))
  const app = buildApp({ catalogue: catalogue() })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: context },
    })
    expect(response.json().generationStatus).toBe("unavailable")
    expect(response.json().paths[0].destinations).toEqual(
      lookupPathways(developer.code).automate!.destinations,
    )
  } finally {
    await app.close()
  }
})
