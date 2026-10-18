import { randomBytes } from "node:crypto"
import { expect, test, vi } from "vite-plus/test"
import { commitmentSchema, emptyProfile, type ProfileState } from "@voxian/shared"
import { buildApp } from "./app.ts"
import { createGuestStore, type GuestStore } from "./guest-store.ts"
import { createOccupationCatalogue } from "./occupation-catalogue.ts"

const state: ProfileState = {
  profile: {
    ...emptyProfile,
    preferredName: "Guest",
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    hours: "1–3 hours",
    timeline: "Next 3 months",
  },
  confirmed: true,
  onboardingComplete: true,
  skipped: ["anxieties"],
}
const commitment = commitmentSchema.parse({
  version: 1,
  pathId: "hybrid",
  direction: "Work with AI",
  role: "Platform Engineer",
  sprint: true,
  hours: "1–3 hours",
  timeOfDay: "morning",
  days: "weekdays",
  startDate: "2026-10-19",
  completed: ["2026-10-19"],
  shortSessions: true,
  plan: {
    provider: "test",
    plan: {
      summary: "Personal plan",
      firstStep: "Learn",
      phases: [
        {
          title: "Learn",
          days: "D1–D30",
          focus: "Practice",
          actions: ["Build"],
          deliverable: "Demo",
          flightPlan: [{ days: "D1–D15", focus: "Try" }],
        },
      ],
    },
  },
})

function memoryStore(): GuestStore {
  const profiles = new Map<string, ProfileState>()
  const plans = new Map<string, typeof commitment>()
  return {
    profile: async (owner) => profiles.get(owner) ?? null,
    saveProfile: vi.fn(async (owner, next) => {
      profiles.set(owner, next)
      return next
    }),
    commitment: async (owner) => plans.get(owner) ?? null,
    saveCommitment: async (owner, next) => {
      if (next) plans.set(owner, next)
      else plans.delete(owner)
    },
    reset: async (owner, scope) => {
      profiles.delete(owner)
      if (scope === "all") plans.delete(owner)
    },
    close: async () => {},
  }
}

test("guest routes persist profile and plan by cookie, validate input, and isolate guests", async () => {
  const store = memoryStore()
  const app = buildApp({ guestStore: store })
  const cookie = `voxian_chat=${"a".repeat(43)}`
  const headers = { cookie, origin: "http://localhost:3000" }
  try {
    const first = await app.inject({ url: "/guest/profile" })
    expect(first.headers["set-cookie"]).toContain("HttpOnly")
    expect(first.headers["cache-control"]).toBe("no-store")
    expect(first.json()).toEqual({ state: null })
    expect(
      (await app.inject({ method: "PUT", url: "/guest/profile", payload: state })).statusCode,
    ).toBe(401)
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/guest/profile",
          headers: { ...headers, origin: "https://other.example" },
          payload: state,
        })
      ).statusCode,
    ).toBe(403)
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/guest/profile",
          headers,
          payload: { ...state, profile: { ...state.profile, hours: "x".repeat(801) } },
        })
      ).statusCode,
    ).toBe(400)
    expect(
      (await app.inject({ method: "PUT", url: "/guest/profile", headers, payload: state }))
        .statusCode,
    ).toBe(200)
    expect((await app.inject({ url: "/guest/profile", headers })).json()).toEqual({ state })
    expect(
      (
        await app.inject({
          url: "/guest/profile",
          headers: { cookie: `voxian_chat=${"b".repeat(43)}` },
        })
      ).json(),
    ).toEqual({ state: null })
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/guest/commitment",
          headers,
          payload: { ...commitment, completed: ["2026-02-30"] },
        })
      ).statusCode,
    ).toBe(400)
    expect(
      (await app.inject({ method: "PUT", url: "/guest/commitment", headers, payload: commitment }))
        .statusCode,
    ).toBe(200)
    expect((await app.inject({ url: "/guest/commitment", headers })).json()).toEqual({ commitment })
    expect(
      (await app.inject({ method: "DELETE", url: "/guest/state?scope=profile", headers }))
        .statusCode,
    ).toBe(204)
    expect((await app.inject({ url: "/guest/profile", headers })).json()).toEqual({ state: null })
    expect((await app.inject({ url: "/guest/commitment", headers })).json()).toEqual({ commitment })
    expect(
      (await app.inject({ method: "DELETE", url: "/guest/state?scope=all", headers })).statusCode,
    ).toBe(204)
    expect((await app.inject({ url: "/guest/commitment", headers })).json()).toEqual({
      commitment: null,
    })
  } finally {
    await app.close()
  }
})

test("guest storage failures report unavailable instead of successful saves", async () => {
  const store = memoryStore()
  store.saveProfile = async () => {
    throw new Error("Database offline")
  }
  const app = buildApp({ guestStore: store })
  try {
    const result = await app.inject({
      method: "PUT",
      url: "/guest/profile",
      headers: { cookie: `voxian_chat=${"a".repeat(43)}` },
      payload: state,
    })
    expect(result.statusCode).toBe(503)
    expect(result.body).not.toContain("Database offline")
  } finally {
    await app.close()
  }
})

test.skipIf(!process.env.TEST_DATABASE_URL)(
  "Postgres restores full guest state across connections, keeps role selection atomic, and resets only this owner",
  async () => {
    const url = process.env.TEST_DATABASE_URL!
    const owner = randomBytes(32).toString("hex")
    const other = randomBytes(32).toString("hex")
    const first = createGuestStore(url)
    try {
      await first.saveProfile(owner, {
        ...state,
        profile: {
          ...state.profile,
          cvContext: {
            confidence: 0.9,
            reviewed: true,
            jobTitles: ["Software Developer"],
            skills: ["TypeScript"],
            keywords: ["TypeScript"],
            workHistory: [
              {
                title: "Software Developer",
                employerContext: "software team",
                duties: ["Build applications"],
              },
            ],
          },
        },
      })
      await first.saveCommitment(owner, commitment)
      await first.saveProfile(other, {
        ...state,
        profile: { ...state.profile, preferredName: "Other guest" },
      })
      await first.saveCommitment(other, commitment)
    } finally {
      await first.close()
    }
    const reopened = createGuestStore(url)
    const catalogue = createOccupationCatalogue(url)
    try {
      expect(await reopened.profile(owner)).toMatchObject(state)
      expect((await reopened.profile(owner))?.profile.cvContext?.keywords).toEqual(["TypeScript"])
      await reopened.saveProfile(owner, {
        ...state,
        profile: { ...state.profile, cvContext: null },
      })
      expect((await reopened.profile(owner))?.profile.cvContext).toBeNull()
      expect(await reopened.commitment(owner)).toEqual(commitment)
      expect((await catalogue.selections(owner)).primaryOccupation).toBe("15-1252.00")
      await expect(
        reopened.saveProfile(owner, {
          ...state,
          profile: {
            ...state.profile,
            occupations: ["99-9999.99"],
            primaryOccupation: "99-9999.99",
          },
        }),
      ).rejects.toThrow()
      expect((await reopened.profile(owner))?.profile.primaryOccupation).toBe("15-1252.00")
      expect((await catalogue.selections(owner)).primaryOccupation).toBe("15-1252.00")
      await reopened.reset(owner, "profile")
      expect(await reopened.profile(owner)).toBeNull()
      expect((await catalogue.selections(owner)).occupations).toEqual([])
      expect(await reopened.commitment(owner)).toEqual(commitment)
      await reopened.reset(owner, "all")
      expect(await reopened.commitment(owner)).toBeNull()
      expect((await reopened.profile(other))?.profile.preferredName).toBe("Other guest")
      expect(await reopened.commitment(other)).toEqual(commitment)
    } finally {
      await reopened.reset(owner, "all")
      await reopened.reset(other, "all")
      await reopened.close()
      await catalogue.close()
    }
  },
)
