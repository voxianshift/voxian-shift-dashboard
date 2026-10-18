import { expect, test, vi } from "vite-plus/test"
import { createHash, randomBytes } from "node:crypto"
import {
  createOccupationCatalogue,
  searchTerms,
  type OccupationCatalogue,
} from "./occupation-catalogue.ts"
import { buildApp } from "./app.ts"
import type { ChatStore } from "./chat-store.ts"
import { emptyProfile } from "@voxian/shared"

const developer = {
  code: "15-1252.00",
  title: "Software Developers",
  description: "Develop software",
  category: "Computer and Mathematical Occupations",
  sourceVersion: "31.0",
  baselineId: null,
  reason: "Matches a job title.",
}
function memoryCatalogue(): OccupationCatalogue {
  const saved = new Map<string, { occupations: (typeof developer)[]; primaryOccupation: string }>()
  return {
    search: vi.fn(async () => [developer]),
    selections: async (owner) => saved.get(owner) ?? { occupations: [], primaryOccupation: "" },
    select: async (owner, codes, primary) => {
      saved.set(owner, { occupations: codes.map(() => developer), primaryOccupation: primary })
    },
    close: async () => {},
  }
}
test("Meter route maps O*NET to ISCO-08 and returns ILO task exposure", async () => {
  const app = buildApp({ catalogue: undefined })
  const meter = await app.inject({ url: "/occupations/43-4051.00/meter" })
  expect(meter.statusCode).toBe(200)
  expect(meter.json()).toMatchObject({
    isco: "4225",
    gradient: expect.stringContaining("Gradient"),
  })
  expect(
    meter.json().tasks.every((t: { exposure: number }) => t.exposure >= 0 && t.exposure <= 1),
  ).toBe(true)
  expect((await app.inject({ url: "/occupations/not-a-code/meter" })).statusCode).toBe(400)
})

test("matching terms remove conversation filler and stay bounded", () => {
  expect(searchTerms("I work as a software developer and my daily tasks include software")).toBe(
    "software OR developer",
  )
  expect(searchTerms("the and my")).toBe("")
  expect(
    searchTerms(Array.from({ length: 100 }, (_, i) => `word${i}`).join(" ")).split(" OR "),
  ).toHaveLength(24)
})
test("occupation routes validate input and isolate guest selections", async () => {
  const app = buildApp({ catalogue: memoryCatalogue() })
  const cookie = `voxian_chat=${"q".repeat(43)}`
  try {
    expect((await app.inject({ url: "/occupations?q=x" })).statusCode).toBe(400)
    expect((await app.inject({ url: "/occupations?q=software" })).json().occupations[0].code).toBe(
      developer.code,
    )
    const initial = await app.inject({ url: "/onboarding/occupations" })
    expect(initial.headers["set-cookie"]).toContain("HttpOnly")
    expect(initial.headers["cache-control"]).toBe("no-store")
    const payload = { occupations: [developer.code], primaryOccupation: developer.code }
    expect(
      (await app.inject({ method: "PUT", url: "/onboarding/occupations", payload })).statusCode,
    ).toBe(401)
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/onboarding/occupations",
          headers: { cookie, origin: "https://untrusted.example" },
          payload,
        })
      ).statusCode,
    ).toBe(403)
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/onboarding/occupations",
          headers: { cookie },
          payload: { ...payload, primaryOccupation: "43-4051.00" },
        })
      ).statusCode,
    ).toBe(400)
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/onboarding/occupations",
          headers: { cookie },
          payload,
        })
      ).statusCode,
    ).toBe(200)
    expect(
      (await app.inject({ url: "/onboarding/occupations", headers: { cookie } })).json()
        .primaryOccupation,
    ).toBe(developer.code)
    expect(
      (
        await app.inject({
          url: "/onboarding/occupations",
          headers: { cookie: `voxian_chat=${"r".repeat(43)}` },
        })
      ).json().occupations,
    ).toEqual([])
  } finally {
    await app.close()
  }
})
test("Lumi returns catalogue suggestions without confirming occupation or accepting invented IDs", async () => {
  vi.stubEnv("CHAT_PROVIDER", "gemini")
  vi.stubEnv("GEMINI_API_KEY", "test-only")
  const store: ChatStore = {
    history: async () => [],
    append: async () => {},
    clear: async () => {},
    close: async () => {},
  }
  const app = buildApp({ chatStore: store, catalogue: memoryCatalogue() })
  const fetch = vi.fn().mockResolvedValue(
    Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  reply: "Tell me about your daily work.",
                  updates: { currentWork: "Software developer" },
                }),
              },
            ],
          },
        },
      ],
    }),
  )
  vi.stubGlobal("fetch", fetch)
  const request = {
    method: "POST" as const,
    url: "/onboarding/chat",
    headers: { cookie: `voxian_chat=${"s".repeat(43)}` },
    payload: {
      message: "I develop software",
      profile: emptyProfile,
      question: "What work do you do?",
      history: [],
    },
  }
  try {
    const response = await app.inject(request)
    expect(response.statusCode).toBe(200)
    expect(response.json().occupationSuggestions).toEqual([developer])
    expect(response.json().updates.occupations).toBeUndefined()
    fetch.mockResolvedValue(
      Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({ reply: "Done", updates: { occupations: ["15-1252.00"] } }),
                },
              ],
            },
          },
        ],
      }),
    )
    expect((await app.inject(request)).statusCode).toBe(502)
  } finally {
    await app.close()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  }
})
test.skipIf(!process.env.TEST_DATABASE_URL)(
  "real catalogue searches aliases/tasks, preserves matches across connections, and rolls back unknown IDs",
  async () => {
    const catalogue = createOccupationCatalogue(process.env.TEST_DATABASE_URL!)
    const owner = createHash("sha256").update(randomBytes(32)).digest("hex")
    try {
      const software = await catalogue.search("software developer")
      expect(software[0]!.code).toBe("15-1252.00")
      expect(software[0]!.baselineId).toBeNull()
      expect((await catalogue.search("43-4051.00"))[0]!.baselineId).toBe("customer-support")
      expect(await catalogue.search("'; DROP TABLE occupations; --")).toBeInstanceOf(Array)
      expect(await catalogue.search("design software applications")).not.toHaveLength(0)
      await catalogue.select(owner, [developer.code, "43-4051.00"], developer.code)
      const second = createOccupationCatalogue(process.env.TEST_DATABASE_URL!)
      try {
        expect((await second.selections(owner)).primaryOccupation).toBe(developer.code)
      } finally {
        await second.close()
      }
      await expect(catalogue.select(owner, ["99-9999.99"], "99-9999.99")).rejects.toThrow(
        "Unknown occupation",
      )
      expect((await catalogue.selections(owner)).occupations).toHaveLength(2)
      expect((await catalogue.selections("f".repeat(64))).occupations).toEqual([])
    } finally {
      await catalogue.select(owner, [], "")
      await catalogue.close()
    }
  },
)

test.skipIf(!process.env.TEST_DATABASE_URL)(
  "match scores rank real titles from a work description",
  async () => {
    const catalogue = createOccupationCatalogue(process.env.TEST_DATABASE_URL!)
    try {
      const exact = await catalogue.search("software developer")
      expect(exact[0]).toMatchObject({ code: "15-1252.00", match: 100 })
      const described = await catalogue.search(
        "Software engineer: hands-on coding of features, deployment and bugfixes",
      )
      expect(described.map((role) => role.code)).toContain("15-1252.00")
      expect(described.every((role) => role.match! > 0 && role.match! < 100)).toBe(true)
    } finally {
      await catalogue.close()
    }
  },
)
