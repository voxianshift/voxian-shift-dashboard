import { expect, test } from "vite-plus/test"
import data from "../data/navigator-pathways.json" with { type: "json" }
import { lookupPathways, pathwayVersion } from "./navigator-pathways.ts"

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
  expect(pathwayVersion).toBe("prototype-2.3.8-review-2")
  expect(lookupPathways("unmapped")).toEqual({})
  expect(lookupPathways("43-4051.00").automate!.title).not.toEqual(
    lookupPathways("15-1252.00").automate!.title,
  )
})

test("Create preserves supplied prototype responsibilities rather than imposing a new definition", () => {
  expect(lookupPathways("15-1252.00").create!.title).toBe("AI Safety & Red Team Lead")
  expect(lookupPathways("43-4051.00").create!.title).toBe("Enterprise AI Ethics Auditor")
  expect(lookupPathways("43-6011.00").create!.title).toBe("Workplace Governance Advisor")
})
