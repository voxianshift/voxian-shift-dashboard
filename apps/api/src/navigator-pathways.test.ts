import { expect, test } from "vite-plus/test"
import families from "../data/navigator-families.json" with { type: "json" }
import crosswalk from "../data/onet-isco.json" with { type: "json" }
import data from "../data/navigator-pathways.json" with { type: "json" }
import { curatedOccupationCodes, lookupPathways, pathwayVersion } from "./navigator-pathways.ts"

test("reviewed mapping IDs and titles are stable, unique and explicitly curated", () => {
  const ids = new Set<string>()
  expect(Object.keys(data.occupations)).toHaveLength(25)
  for (const code of Object.keys(data.occupations)) {
    const strategies = lookupPathways(code)
    expect(Object.keys(strategies)).toEqual(["automate", "hybrid", "pivot", "create"])
    expect(strategies.create!.destinations.length).toBeGreaterThan(0)
    for (const path of Object.values(strategies)) {
      expect(path.destinations.length).toBeGreaterThan(0)
      for (const destination of path.destinations) {
        expect(ids.has(destination.id)).toBe(false)
        ids.add(destination.id)
        expect(destination.kind).toBe("curated_pathway")
        expect(destination.occupationCode).toBeNull()
      }
    }
  }
  expect(pathwayVersion).toBe(`role-library-master-v6+25-curated+soc-family-exploration-1`)
  expect(lookupPathways("unmapped")).toEqual({})
  expect(lookupPathways("43-4051.00").automate!.title).not.toEqual(
    lookupPathways("15-1252.00").automate!.title,
  )
})

test("strategies expose the supplied v6 catalogue and source ordering", () => {
  const support = lookupPathways("43-4051.00")
  expect(Object.values(support).map((path) => path.title)).toEqual([
    "AI Customer Service Specialist",
    "Senior Customer Service Specialist",
    "Healthcare Patient Coordinator",
    "CX Analyst",
  ])
  expect(support.automate!.destinations.map((destination) => destination.title)).toEqual([
    "AI Customer Service Specialist",
    "Service Quality Analyst",
    "CX Operations Coordinator",
    "Automation Flow Designer (No-Code)",
  ])
  expect(lookupPathways("15-1252.00").create!.title).toBe("Technical Co-founder / CTO")
  expect(curatedOccupationCodes).not.toContain("15-1232.00")
})

test("every SOC family resolves stable exploration IDs while exact mappings take priority", () => {
  expect(Object.keys(families.families)).toHaveLength(23)
  for (const prefix of Object.keys(families.families)) {
    const code = `${prefix}-9999.00`
    const paths = lookupPathways(code)
    expect(Object.keys(paths)).toEqual(["automate", "hybrid", "pivot", "create"])
    for (const [id, path] of Object.entries(paths)) {
      expect(path.destinations).toHaveLength(3)
      expect(path.destinations[0]!.id).toBe(`family-${code}-${id}-1`)
      expect(path.destinations.every((destination) => destination.occupationCode === null)).toBe(
        true,
      )
    }
    expect(lookupPathways(code)).toEqual(paths)
  }
  for (const [code, entry] of Object.entries(data.occupations))
    expect(lookupPathways(code)).toEqual(entry.strategies)
  expect(lookupPathways("99-9999.00")).toEqual({})
  expect(lookupPathways("15-injected")).toEqual({})
})

test("all codes in existing occupation crosswalk resolve four validated options", () => {
  for (const code of Object.keys(crosswalk)) {
    expect(Object.keys(lookupPathways(code))).toEqual(["automate", "hybrid", "pivot", "create"])
  }
})

test("every mapped strategy keeps unique role identities independent of display order", () => {
  for (const code of curatedOccupationCodes) {
    for (const [id, path] of Object.entries(lookupPathways(code))) {
      expect(path.destinations.length).toBeGreaterThan(0)
      expect(path.destinations[0]!.title).toBe(path.title)
      expect(
        path.destinations.every((destination) =>
          destination.id.startsWith(
            `${data.occupations[code as keyof typeof data.occupations].prototypeRole}-${id}-`,
          ),
        ),
      ).toBe(true)
      expect(new Set(path.destinations.map((destination) => destination.title)).size).toBe(
        path.destinations.length,
      )
    }
  }
})

test("v6 retains all 27 roles, 108 strategies and complete destination guidance", () => {
  const entries = [...Object.values(data.occupations), ...Object.values(data.unmappedRoles)]
  expect(entries).toHaveLength(27)
  expect(new Set(entries.map((entry) => entry.prototypeRole)).size).toBe(27)
  expect(Object.keys(data.unmappedRoles)).toEqual(["call_centre_lead", "content_mod"])
  expect(entries.flatMap((entry) => Object.values(entry.strategies))).toHaveLength(108)
  const destinations = entries.flatMap((entry) =>
    Object.values(entry.strategies).flatMap((path) => path.destinations),
  )
  expect(destinations).toHaveLength(367)
  expect(destinations.flatMap((destination) => destination.learningResources)).toHaveLength(816)
  for (const destination of destinations) {
    expect(destination.description.length).toBeGreaterThan(30)
    expect(destination.dayToDay.length).toBeGreaterThanOrEqual(3)
    expect(destination.humanEdge.length).toBeGreaterThanOrEqual(2)
    expect(destination.skills.length).toBeGreaterThanOrEqual(3)
    expect(destination.learningResources.some((resource) => resource.cost === "Free")).toBe(true)
    expect(destination.learningResources.some((resource) => resource.cost === "Paid")).toBe(true)
  }
  const pivot = lookupPathways("43-4051.00").pivot!
  expect(pivot.destinations.map((destination) => destination.id)).toEqual([
    "cs_rep-pivot-3",
    "cs_rep-pivot-4",
    "cs_rep-pivot-1",
    "cs_rep-pivot-2",
  ])
  // Unmapped source roles are retained, never substituted for an unrelated O*NET occupation.
  expect(curatedOccupationCodes).toHaveLength(25)
})
