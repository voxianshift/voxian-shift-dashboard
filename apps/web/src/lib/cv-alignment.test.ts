import { expect, test } from "vite-plus/test"
import type { CvContext } from "@voxian/shared"
import { cvAlignment } from "./cv-alignment"
import { buildCareerNodes } from "./career-canvas"
import { navigatorFixture } from "./navigator.fixture"

const cv: CvContext = {
  reviewed: true,
  confidence: 0.9,
  jobTitles: ["Developer"],
  skills: ["TypeScript", "Postgres"],
  keywords: ["Testing"],
  workHistory: [
    {
      title: "Developer",
      employerContext: "Software team",
      duties: ["Built continuous integration pipelines"],
    },
  ],
}
test("missing, unreviewed, low-confidence or unrelated CV hides percentage", () => {
  expect(cvAlignment(["TypeScript"])).toBeNull()
  expect(cvAlignment(["TypeScript"], null)).toBeNull()
  expect(cvAlignment(["TypeScript"], { ...cv, reviewed: false } as unknown as CvContext)).toBeNull()
  expect(cvAlignment(["TypeScript"], { ...cv, confidence: 0.5 })).toBeNull()
  expect(cvAlignment(["Tax law"], cv)).toBeNull()
  expect(cvAlignment([], cv)).toBeNull()
})
test("alignment counts distinct requirements using explicit evidence and known aliases", () => {
  expect(cvAlignment(["TS", "PostgreSQL", "CI", "Leadership"], cv)).toEqual({
    percentage: 50,
    matched: 2,
    total: 4,
  })
  expect(cvAlignment(["TypeScript", "typescript", " Testing "], cv)?.percentage).toBe(50)
  expect(cvAlignment(["Java", "SQL"], cv)).toBeNull()
})
test("nodes retain labels without CV and only assess fixed requirements", () => {
  const paths = navigatorFixture.paths.map((path) => ({
    ...path,
    requiredSkills: ["TypeScript", "Leadership"],
  }))
  const without = buildCareerNodes(paths, "Developer")
  expect(without.find((node) => node.id === "automate")?.data).toMatchObject({
    skills: ["TypeScript", "Leadership"],
    alignment: null,
  })
  expect(
    buildCareerNodes(paths, "Developer", cv).find((node) => node.id === "automate")?.data.alignment
      ?.percentage,
  ).toBe(50)
  expect(
    buildCareerNodes(navigatorFixture.paths, "Developer", cv).find((node) => node.id === "automate")
      ?.data.alignment,
  ).toBeNull()
  expect(
    buildCareerNodes(paths, "Developer", null).find((node) => node.id === "automate")?.data
      .alignment,
  ).toBeNull()
})

test("semantic matches require current CV evidence and cannot inflate denominator or numerator", () => {
  const match = {
    skill: "Delivery automation",
    evidence: "Built continuous integration pipelines",
    reason: "CI automates delivery workflows",
  }
  expect(cvAlignment(["Delivery automation", "Leadership"], cv, [match, match])).toEqual({
    percentage: 50,
    matched: 1,
    total: 2,
  })
  expect(cvAlignment(["Delivery automation"], null, [match])).toBeNull()
  expect(cvAlignment(["Delivery automation"], { ...cv, workHistory: [] }, [match])).toBeNull()
  expect(
    cvAlignment(["Delivery automation"], cv, [{ ...match, skill: "Unlisted requirement" }]),
  ).toBeNull()
})

test("negative verdicts override keyword hits and fallback never infers skills from prose", () => {
  expect(cvAlignment(["TypeScript"], cv, [])).toBeNull()
  const denied = {
    ...cv,
    skills: [],
    keywords: ["Security Code Review"],
    workHistory: [
      {
        title: "Developer",
        employerContext: "",
        duties: ["I have not performed Security Code Review."],
      },
    ],
  }
  expect(cvAlignment(["Security Code Review"], denied)).toBeNull()
  expect(cvAlignment(["Security Code Review"], denied, [])).toBeNull()
})
