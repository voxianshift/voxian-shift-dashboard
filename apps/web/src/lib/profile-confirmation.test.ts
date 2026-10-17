import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, test, vi } from "vite-plus/test"
import { emptyProfile, type CareerProfile } from "@voxian/shared"
import { CareerProfileProvider, useCareerProfile } from "@/components/career-profile-provider"

const state = vi.hoisted(() => ({ value: null as unknown }))
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    useState: (initial: unknown) => {
      if (initial && typeof initial === "object" && "profile" in initial) {
        state.value = initial
        return [
          initial,
          (update: (previous: unknown) => unknown) => {
            state.value = typeof update === "function" ? update(state.value) : update
          },
        ]
      }
      return actual.useState(initial)
    },
  }
})

function context() {
  let profile!: ReturnType<typeof useCareerProfile>
  function Consumer() {
    profile = useCareerProfile()
    return null
  }
  renderToStaticMarkup(createElement(CareerProfileProvider, { children: createElement(Consumer) }))
  return profile
}

test("confirmation atomically applies saved catalogue role without optional preferences", () => {
  const { confirm } = context()
  const saved = {
    ...emptyProfile,
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    occupationNames: { "15-1252.00": "Software Developers" },
  } as CareerProfile
  expect(confirm(saved)).toBe(true)
  expect(state.value).toMatchObject({ profile: saved, confirmed: true })
})

test("confirmation rejects multiple saved roles without a main role and preserves state", () => {
  const { confirm } = context()
  const before = state.value
  expect(confirm({ occupations: ["15-1252.00", "43-4051.00"], primaryOccupation: "" })).toBe(false)
  expect(state.value).toBe(before)
})

afterEach(() => vi.unstubAllGlobals())

for (const scope of ["profile", "all"] as const) {
  test(`${scope} reset clears local profile only after successful server response`, async () => {
    const { confirm, reset } = context()
    confirm({ occupations: ["15-1252.00"], primaryOccupation: "15-1252.00", preferredName: "Test" })
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetch)
    const removeItem = vi.fn()
    vi.stubGlobal("sessionStorage", { removeItem })
    await reset(scope)
    expect(removeItem).toHaveBeenCalledWith("voxian-navigator-v3-prototype1")
    expect(state.value).toEqual({
      profile: emptyProfile,
      confirmed: false,
      onboardingComplete: false,
      skipped: [],
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      `/api/guest/state?scope=${scope}`,
      expect.objectContaining({ method: "DELETE" }),
    )
  })

  test(`${scope} reset keeps local profile when server fails`, async () => {
    const { confirm, reset } = context()
    confirm({ occupations: ["15-1252.00"], primaryOccupation: "15-1252.00" })
    const before = state.value
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })))
    await expect(reset(scope)).rejects.toThrow()
    expect(state.value).toBe(before)
  })
}

test("onboarding requires occupation and schedule before opening dashboard", async () => {
  const { completeOnboarding } = context()
  expect(await completeOnboarding(emptyProfile)).toBe(false)
  const profile = {
    ...emptyProfile,
    preferredName: "Alex",
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    hours: "1–3 hours",
    timeline: "Next 3 months",
  } as CareerProfile
  for (const patch of [{ primaryOccupation: "" }, { hours: "" }, { timeline: "" }]) {
    expect(await completeOnboarding({ ...profile, ...patch })).toBe(false)
  }
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        state: { profile, confirmed: true, onboardingComplete: true, skipped: [] },
      }),
    ),
  )
  expect(await completeOnboarding(profile)).toBe(true)
  expect(state.value).toMatchObject({ onboardingComplete: true, confirmed: true, profile })
})

test("editing preferences preserves onboarding completion", async () => {
  const { completeOnboarding, update } = context()
  const profile = {
    ...emptyProfile,
    preferredName: "Alex",
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    hours: "1–3 hours",
    timeline: "Next 3 months",
  } as CareerProfile
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        state: { profile, confirmed: true, onboardingComplete: true, skipped: [] },
      }),
    ),
  )
  await completeOnboarding(profile)
  update({ preferredName: "Sam" })
  expect(state.value).toMatchObject({
    onboardingComplete: true,
    confirmed: false,
    profile: { preferredName: "Sam" },
  })
})

test("onboarding stays incomplete when database save fails", async () => {
  const { completeOnboarding } = context()
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ error: "Unavailable" }, { status: 503 })),
  )
  await expect(
    completeOnboarding({
      ...emptyProfile,
      occupations: ["15-1252.00"],
      primaryOccupation: "15-1252.00",
      hours: "1–3 hours",
      timeline: "This month",
    }),
  ).rejects.toThrow()
  expect(state.value).toMatchObject({ onboardingComplete: false })
})
