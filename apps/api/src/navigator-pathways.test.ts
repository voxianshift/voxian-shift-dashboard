import { expect, test } from "vite-plus/test"
import data from "../data/navigator-pathways.json" with { type: "json" }
import { lookupPathways, pathwayVersion } from "./navigator-pathways.ts"

test("reviewed mapping IDs and titles are stable, unique and explicitly curated", () => {
  const ids = new Set<string>()
  expect(Object.keys(data.occupations)).toHaveLength(25)
  for (const code of Object.keys(data.occupations)) {
    const strategies = lookupPathways(code)
    expect(strategies.create).toBeUndefined()
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
  expect(pathwayVersion).toBe("prototype-2.3.8-review-1")
  expect(lookupPathways("unmapped")).toEqual({})
  expect(lookupPathways("43-4051.00").automate!.title).not.toEqual(
    lookupPathways("15-1252.00").automate!.title,
  )
})
