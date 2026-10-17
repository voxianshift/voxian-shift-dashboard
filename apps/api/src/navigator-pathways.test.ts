import { expect, test } from "vite-plus/test"
import families from "../data/navigator-families.json" with { type: "json" }
import crosswalk from "../data/onet-isco.json" with { type: "json" }
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
  expect(pathwayVersion).toBe("strategy-definitions-2026-10-17-review-4+soc-family-exploration-1")
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
