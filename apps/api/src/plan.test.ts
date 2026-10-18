import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import {
  emptyProfile,
  navigatorContext,
  flightPlanSchema,
  validatePlanSchedule,
  commitmentSchema,
} from "@voxian/shared"
import { lookupPathways } from "./navigator-pathways.ts"
import { buildApp } from "./app.ts"
import type { OccupationCatalogue } from "./occupation-catalogue.ts"

const occupation = {
  code: "15-1252.00",
  title: "Software Developers",
  description: "Design and maintain software.",
  category: "Computing",
  sourceVersion: "31.0",
  baselineId: null,
  reason: "Exact code",
}
const catalogue: OccupationCatalogue = {
  search: async (code) => (code === occupation.code ? [occupation] : []),
  selections: async () => ({ occupations: [], primaryOccupation: "" }),
  select: async () => {},
  close: async () => {},
}
const request = () => ({
  occupationCode: occupation.code,
  strategyId: "pivot",
  destinationId: lookupPathways(occupation.code).pivot!.destinations[0]!.id,
  pace: "lean",
  profile: navigatorContext({
    ...emptyProfile,
    occupations: [occupation.code],
    primaryOccupation: occupation.code,
    strengths: ["Coding"],
    goals: ["Stability"],
    hours: "1–3 hours",
    risk: "Small changes",
  }),
  schedule: {
    startDate: "2026-10-19",
    timeZone: "Asia/Kuala_Lumpur",
    weeklyMinutes: 60,
    studyDays: [1, 3, 5],
    sessionLimitMinutes: 45,
  },
})
function narrative(input: any) {
  return {
    summary: "A small reviewed project within available time.",
    firstStep: "Review one small sample in your first scheduled session.",
    phases: Object.fromEntries(
      input.phases.map((phase: any) => [
        phase.id,
        {
          actions: ["Review a small sample.", "Record feedback."],
          deliverable: "One reviewed sample.",
        },
      ]),
    ),
    tasks: input.activeDays.map((day: any) => ({
      id: day.id,
      task: "Practice one skill and record feedback.",
      doneWhen: "One page of feedback notes saved.",
      resourceId: "learn",
    })),
    milestones: input.milestones.map((entry: any) => ({
      id: entry.id,
      action: "Improve one part of the sample.",
      doneWhen: "A revised sample saved.",
      resourceId: "learn",
    })),
    goals: [30, 60, 90].map((day) => ({
      id: `day-${day}`,
      outcome: "Produce a reviewed practice sample.",
    })),
  }
}
function mockProvider(change?: (draft: any, input: any) => void) {
  const fetch = vi.fn().mockImplementation((_url, options) => {
    const input = JSON.parse(JSON.parse(options.body).messages[1].content)
    const draft = narrative(input)
    change?.(draft, input)
    return Response.json({ choices: [{ message: { content: JSON.stringify(draft) } }] })
  })
  vi.stubGlobal("fetch", fetch)
  return fetch
}
beforeEach(() => {
  vi.stubEnv("CHAT_PROVIDER", "rootsys")
  vi.stubEnv("ROOTSYS_API_KEY", "test-only")
  vi.stubEnv("DATABASE_URL", "")
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test("all four strategies use grounded destinations and code-owned schedule/content boundaries", async () => {
  const fetch = mockProvider((draft) => {
    draft.phases = Object.fromEntries(Object.entries(draft.phases).reverse())
    draft.tasks.reverse()
    draft.milestones.reverse()
    draft.goals.reverse()
    draft.horizonDays = 999
    draft.firstMonth = [{ minutes: 9999 }]
  })
  const app = buildApp({ catalogue })
  try {
    for (const strategyId of ["automate", "hybrid", "pivot", "create"] as const) {
      const response = await app.inject({
        method: "POST",
        url: "/plan",
        payload: {
          ...request(),
          strategyId,
          destinationId: lookupPathways(occupation.code)[strategyId]!.destinations[0]!.id,
        },
        remoteAddress: `127.0.0.${fetch.mock.calls.length + 1}`,
      })
      expect(response.statusCode).toBe(200)
      const plan = flightPlanSchema.parse(response.json().plan)
      const saved = commitmentSchema.parse({
        version: 1,
        pathId: strategyId,
        direction: "Selected path",
        role: plan.selectedRole,
        sprint: false,
        hours: "1–3 hours",
        timeOfDay: "morning",
        days: "weekdays",
        startDate: plan.schedule.startDate,
        completed: [],
        plan: response.json(),
      })
      expect(saved.plan?.plan).toEqual(plan)
      expect(() => validatePlanSchedule(plan)).not.toThrow()
      expect(plan.strategyId).toBe(strategyId)
      expect(plan.horizonDays).toBe(120)
      expect(plan.phases).toHaveLength(4)
      expect(plan.firstMonth).toHaveLength(30)
      expect(plan.selectedRole).not.toBeNull()
      expect(plan.firstMonth.filter((d) => d.kind === "task").every((d) => d.minutes === 20)).toBe(
        true,
      )
      const input = JSON.parse(JSON.parse(fetch.mock.calls.at(-1)![1]!.body).messages[1].content)
      expect(input.evidence.tasks.length).toBeGreaterThan(0)
      expect(input.skillContext.userStatedStrengths).toEqual(["Coding"])
      expect(input.profile.goals).toEqual(["Stability"])
      expect(input.occupation.title).toBe(occupation.title)
      if (strategyId === "pivot") expect(input.phases[0].focus).toContain("Validate adjacent")
      if (strategyId === "create") expect(input.phases[0].focus).toContain("governance")
    }
  } finally {
    await app.close()
  }
})

test("90-day plan handles one minute per week and has no work on rest days", async () => {
  mockProvider()
  const app = buildApp({ catalogue })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: {
        ...request(),
        pace: "intensive",
        schedule: { ...request().schedule, weeklyMinutes: 1, studyDays: [0, 1, 2, 3, 4, 5, 6] },
      },
    })
    expect(response.statusCode).toBe(200)
    const plan = flightPlanSchema.parse(response.json().plan)
    expect(plan.phases.map((p) => [p.startDay, p.endDay])).toEqual([
      [1, 22],
      [23, 45],
      [46, 67],
      [68, 90],
    ])
    expect(
      plan.firstMonth
        .filter((d) => d.kind === "rest")
        .every((d) => d.task === null && d.minutes === 0),
    ).toBe(true)
    expect(plan.goals.map((g) => g.day)).toEqual([30, 60, 90])
    expect(() =>
      validatePlanSchedule({
        ...plan,
        firstMonth: plan.firstMonth.map((d, i) => (i ? d : { ...d, minutes: 999 })),
      }),
    ).toThrow()
  } finally {
    await app.close()
  }
})

for (const failure of [
  "missing-task",
  "duplicate-task",
  "rest-task",
  "milestone-gap",
  "phase-id",
  "goal-id",
  "resource",
  "provider",
]) {
  test(`invalid ${failure} output is rejected without returning an unvalidated plan`, async () => {
    const fetch = mockProvider((draft, input) => {
      if (failure === "missing-task") draft.tasks.pop()
      if (failure === "duplicate-task") draft.tasks[1].id = draft.tasks[0].id
      if (failure === "rest-task")
        draft.tasks.push({
          id: input.restDayIds[0],
          task: "Do work on rest day",
          doneWhen: "Done.",
        })
      if (failure === "milestone-gap") draft.milestones.pop()
      if (failure === "phase-id") delete draft.phases.foundation
      if (failure === "goal-id") draft.goals[1].id = "day-30"
      if (failure === "resource") draft.tasks[0].resourceId = "https://invented.example"
    })
    if (failure === "provider") fetch.mockResolvedValue(new Response(null, { status: 500 }))
    const app = buildApp({ catalogue })
    try {
      const r = await app.inject({ method: "POST", url: "/plan", payload: request() })
      expect(r.statusCode).toBe(502)
      expect(r.json()).not.toHaveProperty("plan")
      expect(fetch).toHaveBeenCalledTimes(failure === "provider" ? 1 : 2)
    } finally {
      await app.close()
    }
  })
}

test("invalid destination, occupation, schedule and legacy free-text requests fail before provider", async () => {
  const fetch = mockProvider()
  const app = buildApp({ catalogue })
  try {
    const cases = [
      {},
      { ...request(), destinationId: "invented" },
      {
        ...request(),
        strategyId: "create",
        destinationId: lookupPathways(occupation.code).pivot!.destinations[0]!.id,
      },
      { ...request(), occupationCode: "11-1011.00" },
      { ...request(), schedule: { ...request().schedule, startDate: "2026-02-30" } },
      { ...request(), schedule: { ...request().schedule, timeZone: "invalid" } },
      { ...request(), schedule: { ...request().schedule, weeklyMinutes: 0 } },
      {
        ...request(),
        profile: { ...request().profile, flexibility: "Short sessions only" },
        schedule: { ...request().schedule, sessionLimitMinutes: 90 },
      },
      { role: "Dev", direction: "X", targetRoles: [], pace: "lean" },
    ]
    for (const [i, payload] of cases.entries())
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/plan",
            payload,
            remoteAddress: `127.0.0.${i + 1}`,
          })
        ).statusCode,
      ).toBe(400)
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/plan",
          headers: { origin: "https://evil.example" },
          payload: request(),
        })
      ).statusCode,
    ).toBe(403)
    expect(fetch).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})

test("strategy-level selection is grounded without inventing a target and preserves profile revision", async () => {
  const fetch = mockProvider()
  const app = buildApp({ catalogue })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: { ...request(), destinationId: null },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().plan).toMatchObject({ destinationId: null, selectedRole: null })
    expect(response.json().plan.profileRevision).toMatch(/^[a-f0-9]{64}$/)
    const input = JSON.parse(JSON.parse(fetch.mock.calls[0]![1]!.body).messages[1].content)
    expect(input.pathway.destinations.length).toBeGreaterThan(1)
  } finally {
    await app.close()
  }
})

test("known but unoffered courses cannot be silently added to a plan", async () => {
  mockProvider((draft) => {
    draft.tasks[0].resourceId = "web"
  })
  const app = buildApp({ catalogue })
  try {
    expect(
      (await app.inject({ method: "POST", url: "/plan", payload: request() })).statusCode,
    ).toBe(502)
  } finally {
    await app.close()
  }
})

test("missing occupational task evidence stays unknown instead of blocking a reviewed pathway", async () => {
  mockProvider((_draft, input) => {
    expect(input.evidence).toMatchObject({
      status: "unavailable",
      mapping: null,
      gradient: null,
      tasks: [],
    })
    expect(input.skillContext.curatedRequirements.length).toBeGreaterThan(0)
  })
  const app = buildApp({
    catalogue: { ...catalogue, search: async (code) => [{ ...occupation, code }] },
  })
  try {
    const profile = {
      ...request().profile,
      occupations: ["13-1199.06"],
      primaryOccupation: "13-1199.06",
    }
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: { ...request(), occupationCode: "13-1199.06", profile, destinationId: null },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().isco).toBeNull()
  } finally {
    await app.close()
  }
})

test("missing configuration and catalogue have explicit service errors", async () => {
  vi.stubEnv("ROOTSYS_API_KEY", "")
  const app = buildApp({ catalogue })
  const missing = buildApp()
  try {
    expect(
      (await app.inject({ method: "POST", url: "/plan", payload: request() })).statusCode,
    ).toBe(503)
    expect(
      (await missing.inject({ method: "POST", url: "/plan", payload: request() })).statusCode,
    ).toBe(503)
  } finally {
    await app.close()
    await missing.close()
  }
})

test("one bounded schema repair can recover an extra phase without weakening coverage checks", async () => {
  let attempts = 0
  const fetch = mockProvider((draft) => {
    if (++attempts === 1) draft.phases.extra = { ...draft.phases.foundation }
  })
  const app = buildApp({ catalogue })
  try {
    const response = await app.inject({ method: "POST", url: "/plan", payload: request() })
    expect(response.statusCode).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(2)
    const second = JSON.parse(fetch.mock.calls[1]![1]!.body)
    expect(second.messages[0].content).toContain("Repair the previous schema/coverage failure")
    expect(response.json().plan.phases).toHaveLength(4)
    expect(() => validatePlanSchedule(response.json().plan)).not.toThrow()
  } finally {
    await app.close()
  }
})

test("thin resource coverage gets one repair, then the plan is accepted as-is", async () => {
  const fetch = mockProvider((draft) => {
    for (const item of [...draft.tasks, ...draft.milestones]) delete item.resourceId
  })
  const app = buildApp({ catalogue })
  try {
    const response = await app.inject({ method: "POST", url: "/plan", payload: request() })
    expect(response.statusCode).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(2)
    const second = JSON.parse(fetch.mock.calls[1]![1]!.body)
    expect(second.messages[0].content).toContain("at least 60% of tasks and milestones")
    const task = response.json().plan.firstMonth.find((day: any) => day.kind === "task")
    expect(task.doneWhen).toBe("One page of feedback notes saved.")
  } finally {
    await app.close()
  }
})

test("prototype occupation destinations generate validated plans in every strategy", async () => {
  mockProvider()
  const support = { ...occupation, code: "43-4051.00", title: "Customer Service Representatives" }
  const app = buildApp({
    catalogue: { ...catalogue, search: async (code) => (code === support.code ? [support] : []) },
  })
  try {
    for (const strategyId of ["automate", "hybrid", "pivot", "create"] as const) {
      const base = request()
      const response = await app.inject({
        method: "POST",
        url: "/plan",
        payload: {
          ...base,
          occupationCode: support.code,
          strategyId,
          destinationId: lookupPathways(support.code)[strategyId]!.destinations.at(-1)!.id,
          profile: {
            ...base.profile,
            occupations: [support.code],
            primaryOccupation: support.code,
          },
        },
      })
      expect(response.statusCode).toBe(200)
      const plan = flightPlanSchema.parse(response.json().plan)
      expect(plan.occupationCode).toBe(support.code)
      expect(plan.destinationId).toBe(
        lookupPathways(support.code)[strategyId]!.destinations.at(-1)!.id,
      )
      expect(() => validatePlanSchedule(plan)).not.toThrow()
    }
  } finally {
    await app.close()
  }
})

test("family options use same resolver in Navigator and Plan and reject another occupation's IDs", async () => {
  const fetch = mockProvider()
  const family = { ...occupation, code: "11-9199.00", title: "Managers, All Other" }
  const app = buildApp({
    catalogue: { ...catalogue, search: async (code) => (code === family.code ? [family] : []) },
  })
  try {
    for (const strategyId of ["automate", "hybrid", "pivot", "create"] as const) {
      const base = request()
      const payload = {
        ...base,
        occupationCode: family.code,
        strategyId,
        destinationId: `family-${family.code}-${strategyId}-1`,
        profile: { ...base.profile, occupations: [family.code], primaryOccupation: family.code },
      }
      const response = await app.inject({ method: "POST", url: "/plan", payload })
      expect(response.statusCode).toBe(200)
      const plan = flightPlanSchema.parse(response.json().plan)
      expect(plan.destinationId).toBe(payload.destinationId)
      const input = JSON.parse(JSON.parse(fetch.mock.calls.at(-1)![1]!.body).messages[1].content)
      expect(input.pathway.limitation).toContain("Family-level exploration template")
      const wrong = await app.inject({
        method: "POST",
        url: "/plan",
        payload: { ...payload, destinationId: `family-29-1142.00-${strategyId}-1` },
        remoteAddress: `127.0.1.${fetch.mock.calls.length + 1}`,
      })
      expect(wrong.statusCode).toBe(400)
    }
  } finally {
    await app.close()
  }
})

test("family prefix never bypasses verification against actual occupation catalogue", async () => {
  const fetch = mockProvider()
  const app = buildApp({ catalogue })
  try {
    const base = request()
    const code = "15-9999.00"
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: {
        ...base,
        occupationCode: code,
        strategyId: "create",
        destinationId: `family-${code}-create-1`,
        profile: { ...base.profile, occupations: [code], primaryOccupation: code },
      },
    })
    expect(response.statusCode).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})

test("custom daily allocation survives generation with four named phase sections", async () => {
  const fetch = mockProvider()
  const app = buildApp({ catalogue })
  try {
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: {
        ...request(),
        schedule: {
          ...request().schedule,
          weeklyMinutes: 240,
          studyDays: [6, 0],
          sessionLimitMinutes: 180,
          dayMinutes: { 6: 90, 0: 150 },
        },
      },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().plan.schedule.dayMinutes).toEqual({ 6: 90, 0: 150 })
    expect(() => validatePlanSchedule(response.json().plan)).not.toThrow()
    const provider = JSON.parse(fetch.mock.calls[0]![1]!.body)
    expect(provider.messages[0].content).toContain(
      "Return phases as an object with exactly four keys",
    )
    expect(response.json().plan.phases.map((phase: any) => phase.id)).toEqual([
      "foundation",
      "intermediate",
      "advanced",
      "leadership",
    ])
  } finally {
    await app.close()
  }
})

test("reviewed CV evidence reaches planning while low-confidence input is rejected before generation", async () => {
  const fetch = mockProvider()
  const app = buildApp({ catalogue })
  const cv = {
    confidence: 0.9,
    reviewed: true,
    jobTitles: ["Software Developer"],
    skills: ["TypeScript"],
    keywords: ["TypeScript", "code review"],
    workHistory: [
      {
        title: "Software Developer",
        employerContext: "software team",
        duties: ["Build applications"],
      },
    ],
  }
  try {
    const response = await app.inject({
      method: "POST",
      url: "/plan",
      payload: { ...request(), profile: { ...request().profile, cvContext: cv } },
    })
    expect(response.statusCode).toBe(200)
    const sent = JSON.parse(JSON.parse(fetch.mock.calls[0]![1]!.body).messages[1].content)
    expect(sent.skillContext.cvKeywords).toEqual(cv.keywords)
    expect(sent.skillContext.reviewedCvExperience).toEqual(cv.workHistory)
    expect(sent.skillContext.userStatedStrengths).toEqual(request().profile.strengths)
    expect(sent.profile).not.toHaveProperty("rawCvText")
    fetch.mockClear()
    const invalid = await app.inject({
      method: "POST",
      url: "/plan",
      payload: {
        ...request(),
        profile: { ...request().profile, cvContext: { ...cv, confidence: 0.4 } },
      },
    })
    expect(invalid.statusCode).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  } finally {
    await app.close()
  }
})
