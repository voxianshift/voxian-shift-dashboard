import { expect, test } from "vite-plus/test"
import { cvAssessmentSchema, pathIdSchema } from "@voxian/shared"
import { curatedOccupationCodes } from "./navigator-pathways.ts"
import { skillRequirements, supportedCvMatches } from "./skill-requirements.ts"
import frozen from "../data/evaluations/cv-frozen-requirements.json" with { type: "json" }
import diagnostic from "../data/evaluations/cv-skill-matching.json" with { type: "json" }

test("every curated skill has a stable unique requirement and traceable context", () => {
  const requirements = curatedOccupationCodes.flatMap((code) =>
    pathIdSchema.options.flatMap((id) => skillRequirements(code, id)),
  )
  expect(requirements).toHaveLength(300)
  expect(new Set(requirements.map((item) => item.id)).size).toBe(300)
  for (const item of requirements) {
    expect(item.definition.length).toBeGreaterThan(10)
    expect(item.context.length).toBeGreaterThan(10)
    expect(item.exclusions.length).toBeGreaterThan(10)
  }
  expect(skillRequirements("15-1252.00", "automate")).toEqual(
    skillRequirements("15-1252.00", "automate"),
  )
  expect(skillRequirements("99-9999.00", "automate")).toEqual([])
  for (const example of diagnostic.cases)
    expect(frozen.requirements.some((item) => item.label === example.label)).toBe(true)
})
test("only a single supported verdict with exact current evidence can count", () => {
  const requirements = skillRequirements("15-1252.00", "automate")
  const evidence = ["Used Cursor to edit and test code."]
  const supported = {
    requirementId: requirements[0]!.id,
    status: "supported" as const,
    evidence: evidence[0]!,
    reason: "Explicit AI coding assistant workflow.",
  }
  expect(supportedCvMatches([supported], requirements, evidence)).toHaveLength(1)
  for (const status of ["related", "unsupported"] as const)
    expect(supportedCvMatches([{ ...supported, status }], requirements, evidence)).toEqual([])
  expect(supportedCvMatches([supported], requirements, [])).toEqual([])
  expect(
    supportedCvMatches([{ ...supported, evidence: "Invented quote" }], requirements, evidence),
  ).toEqual([])
  expect(
    supportedCvMatches([{ ...supported, requirementId: "invented" }], requirements, evidence),
  ).toEqual([])
  expect(supportedCvMatches([supported, supported], requirements, evidence)).toEqual([])
  expect(cvAssessmentSchema.safeParse({ ...supported, percentage: 99 }).success).toBe(false)
})

test("held-out labels are separate from development fixtures and use untuned definitions", async () => {
  const { default: holdout } = await import("../data/evaluations/cv-skill-holdout.json", {
    with: { type: "json" },
  })
  const requirements = frozen.requirements
  expect(frozen.frozenImplementation).toBe(holdout.frozenImplementation)
  expect(holdout.frozenImplementation).toBe("c3d2158")
  expect(holdout.cases).toHaveLength(40)
  expect(new Set(holdout.cases.map((item) => item.id)).size).toBe(40)
  for (const example of holdout.cases) {
    expect(diagnostic.cases.some((item) => item.label === example.label)).toBe(false)
    expect(requirements.find((item) => item.label === example.label)?.definitionSource).toBe(
      "catalogue-label-and-context",
    )
    expect(example.evidence.every((phrase) => phrase.length <= 180)).toBe(true)
  }
})
