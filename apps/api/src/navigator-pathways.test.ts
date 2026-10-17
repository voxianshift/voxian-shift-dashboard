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
  expect(pathwayVersion).toBe(`prototype-v2.3.8-branches-1+25-curated+soc-family-exploration-1`)
  expect(lookupPathways("unmapped")).toEqual({})
  expect(lookupPathways("43-4051.00").automate!.title).not.toEqual(
    lookupPathways("15-1252.00").automate!.title,
  )
})

test("strategies use prototype v2.3.8 branches, with governance and ethics roles for Create", () => {
  const support = lookupPathways("43-4051.00")
  expect(Object.values(support).map((path) => path.title)).toEqual([
    "AI Support Ops & Engineering",
    "AI Specialist & Evaluation",
    "Strategic Client Advocate & PM",
    "Enterprise AI Ethics Auditor",
  ])
  expect(support.automate!.destinations.map((destination) => destination.title)).toEqual([
    "AI Support Ops & Engineering",
    "Frontend Support Integrator",
    "Agentic RAG Pipeline Architect",
    "Head of CX Automation",
  ])
  expect(lookupPathways("15-1252.00").create!.title).toBe("AI Safety & Red Team Lead")
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

test("every mapped strategy mirrors its prototype branch with sequential IDs", () => {
  for (const code of curatedOccupationCodes) {
    for (const [id, path] of Object.entries(lookupPathways(code))) {
      expect(path.destinations.length).toBeGreaterThanOrEqual(3)
      expect(path.destinations[0]!.title).toBe(path.title)
      const prefix = path.destinations[0]!.id.replace(/-1$/, "")
      expect(path.destinations.map((destination) => destination.id)).toEqual(
        path.destinations.map((_, index) => `${prefix}-${index + 1}`),
      )
      expect(prefix.endsWith(`-${id}`)).toBe(true)
      expect(new Set(path.destinations.map((destination) => destination.title)).size).toBe(
        path.destinations.length,
      )
    }
  }
})
