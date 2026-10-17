import { expect, test } from "vite-plus/test"
import data from "../data/navigator-pathways.json" with { type: "json" }
import { lookupPathways, pathwayVersion } from "./navigator-pathways.ts"

test("reviewed mapping IDs and titles are stable, unique and explicitly curated", () => {
  const ids = new Set<string>()
  expect(Object.keys(data.occupations)).toHaveLength(26)
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
  expect(pathwayVersion).toBe("strategy-definitions-2026-10-17-review-4")
  expect(lookupPathways("unmapped")).toEqual({})
  expect(lookupPathways("43-4051.00").automate!.title).not.toEqual(
    lookupPathways("15-1252.00").automate!.title,
  )
})

test("Create uses curated ownership options rather than employee titles", () => {
  expect(lookupPathways("15-1252.00").create!.title).toBe("AI Safety Testing Practice")
  expect(lookupPathways("43-4051.00").create!.title).toBe("Customer Support Quality Practice")
  expect(lookupPathways("43-6011.00").create!.title).toBe("Workplace Workflow Practice")
})

test("every Create mapping includes owned offers and customer validation", () => {
  for (const code of Object.keys(data.occupations)) {
    const create = lookupPathways(code).create!
    expect(create.description).toContain("owned")
    expect(create.firstStep).toContain("potential customer")
    expect(create.destinations.map((destination) => destination.title.split(" ").at(-1))).toEqual(
      ["Practice", "Service", "Toolkit"].slice(0, create.destinations.length),
    )
    expect(create.skills).toContain("Customer Discovery")
  }
})
