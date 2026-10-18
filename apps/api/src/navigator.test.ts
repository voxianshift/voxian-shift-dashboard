import { skillRequirements } from "./skill-requirements.ts"
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
const familyOnly = { ...developer, code: "11-9199.00", title: "Managers, All Other" }
const support = { ...developer, code: "43-4051.00", title: "Customer Service Representatives" }
const admin = { ...developer, code: "43-6011.00", title: "Executive Assistants" }
const unknownMapping = { ...developer, code: "99-9999.00", title: "Unclassified test occupation" }
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
      [developer, admin, support, familyOnly, unknownMapping].filter((role) => role.code === code),
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
    expect(body.paths[0]!.requiredSkills).toEqual(lookupPathways(developer.code).automate!.skills)
    expect(body.paths[0]!.skills).toEqual(["Testing", "Communication", "Coding"])
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

test("prototype occupation returns fixed coverage for all four strategies without an LLM", async () => {
  vi.stubEnv("ROOTSYS_API_KEY", "")
  const app = buildApp({ catalogue: catalogue() })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: {
        profile: { ...context, occupations: [support.code], primaryOccupation: support.code },
      },
    })
    expect(response.statusCode).toBe(200)
    const result = navigatorResultSchema.parse(response.json())
    expect(result.occupationCode).toBe(support.code)
    for (const path of result.paths) {
      expect(path.coverage).toBe("available")
      expect(path.destinations).toEqual(lookupPathways(support.code)[path.id]!.destinations)
      expect(path.destinations.length).toBeGreaterThanOrEqual(3)
    }
    expect(result.paths[3]!.title).toBe("Enterprise AI Ethics Auditor")
  } finally {
    await app.close()
  }
})

test("family-only occupation gets transparent fixed exploration options without provider", async () => {
  vi.stubEnv("ROOTSYS_API_KEY", "")
  const app = buildApp({ catalogue: catalogue() })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: {
        profile: { ...context, occupations: [familyOnly.code], primaryOccupation: familyOnly.code },
      },
    })
    expect(response.statusCode).toBe(200)
    const body = navigatorResultSchema.parse(response.json())
    expect(body.generationStatus).toBe("reviewed_only")
    for (const path of body.paths) {
      expect(path.coverage).toBe("available")
      expect(path.mappingLevel).toBe("family")
      expect(path.mappingRationale).toContain("Family-level exploration template")
      expect(path.mappingSource).toContain("SOC major groups")
      expect(path.destinations).toEqual(lookupPathways(familyOnly.code)[path.id]!.destinations)
    }
    expect(body.paths[2]!.description).toContain("not yet validated")
  } finally {
    await app.close()
  }
})

test("semantic matches retain only fixed requirements backed by reviewed CV evidence", async () => {
  const skill = lookupPathways(developer.code).automate!.skills[0]!
  const result = draft()
  const requirements = skillRequirements(developer.code, "automate")
  const matches = [
    {
      requirementId: requirements[0]!.id,
      status: "supported",
      evidence: "Reviewed tool experience",
      reason: "Equivalent tool experience",
    },
    {
      requirementId: "invented",
      status: "supported",
      evidence: "Reviewed tool experience",
      reason: "Not a requirement",
    },
    {
      requirementId: requirements[1]!.id,
      status: "supported",
      evidence: "Invented evidence",
      reason: "Missing evidence",
    },
    {
      requirementId: requirements[2]!.id,
      status: "related",
      evidence: "Reviewed tool experience",
      reason: "Adjacent, not sufficient",
    },
  ]
  Object.assign(result.paths[0]!, { cvAssessments: matches })
  const fetch = vi.fn().mockImplementation(() => completion(result))
  vi.stubGlobal("fetch", fetch)
  const app = buildApp({ catalogue: catalogue() })
  const cvContext = {
    reviewed: true,
    confidence: 0.9,
    jobTitles: ["Developer"],
    skills: ["Reviewed tool experience"],
    keywords: ["Development"],
    workHistory: [],
  }
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: { ...context, cvContext } },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().paths[0].cvMatches).toEqual([
      { skill, evidence: "Reviewed tool experience", reason: "Equivalent tool experience" },
    ])
    const input = JSON.parse(
      JSON.parse(fetch.mock.calls[0]![1]!.body as string).messages[1].content,
    )
    expect(input.cvEvidence).toEqual(["Reviewed tool experience", "Development"])
    const noCv = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      payload: { profile: context },
    })
    expect(noCv.json().paths[0].cvMatches).toEqual([])
  } finally {
    await app.close()
  }
})

test("vector candidates constrain active evidence; failures retain exhaustive CV context", async () => {
  vi.stubEnv("CV_VECTOR_MODE", "active")
  const requirement = skillRequirements(developer.code, "automate")[0]!
  const result = draft()
  Object.assign(result.paths[0]!, {
    cvAssessments: [
      {
        requirementId: requirement.id,
        status: "supported",
        evidence: "Used Cursor",
        reason: "AI coding tool",
      },
    ],
  })
  const fetch = vi.fn().mockImplementation(() => completion(result))
  vi.stubGlobal("fetch", fetch)
  const candidates = vi.fn(async () => ({
    model: "test",
    evidenceCount: 2,
    byRequirement: { [requirement.id]: ["Used Cursor"] },
  }))
  const app = buildApp({
    catalogue: catalogue(),
    cvVectorStore: { candidates, seed: async () => 0, close: async () => {} },
  })
  const profile = {
    ...context,
    cvContext: {
      reviewed: true,
      confidence: 0.9,
      jobTitles: ["Developer"],
      skills: ["Used Cursor"],
      keywords: ["Unrelated evidence"],
      workHistory: [],
    },
  }
  try {
    const response = await app.inject({
      method: "POST",
      url: "/navigator/paths",
      headers: { cookie: `voxian_chat=${"a".repeat(43)}` },
      payload: { profile },
    })
    expect(response.statusCode).toBe(200)
    const input = JSON.parse(
      JSON.parse(fetch.mock.calls[0]![1]!.body as string).messages[1].content,
    )
    expect(candidates).toHaveBeenCalledOnce()
    expect(input.profile).not.toHaveProperty("cvContext")
    expect(input.cvEvidence).toEqual(["Used Cursor"])
    expect(response.json().paths[0].cvMatches).toHaveLength(1)
    candidates.mockRejectedValueOnce(new Error("Unavailable"))
    await app.inject({
      method: "POST",
      url: "/navigator/paths",
      headers: { cookie: `voxian_chat=${"a".repeat(43)}` },
      payload: { profile },
    })
    const fallback = JSON.parse(
      JSON.parse(fetch.mock.calls[1]![1]!.body as string).messages[1].content,
    )
    expect(fallback.profile.cvContext).toEqual(profile.cvContext)
    expect(fallback.cvEvidence).toContain("Unrelated evidence")
  } finally {
    await app.close()
  }
})
