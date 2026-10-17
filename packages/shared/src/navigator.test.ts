import { expect, test } from "vite-plus/test"
import {
  recommendStrategy,
  navigatorStrategies,
  navigatorDraftSchema,
  pathIdSchema,
  courseList,
  navigatorResources,
  pathCourseIds,
  type CareerPath,
} from "./navigator.ts"

const path = {
  id: "pivot",
  resources: [navigatorResources.nist],
  roleResources: [
    [navigatorResources.istqb],
    [navigatorResources.kaggle],
    [navigatorResources.nist],
  ],
} as CareerPath

test("every direction offers at least five reviewed courses with a cost", () => {
  for (const ids of Object.values(pathCourseIds))
    expect(new Set(ids).size).toBeGreaterThanOrEqual(5)
  for (const resource of Object.values(navigatorResources))
    expect(["Free", "Paid"]).toContain(resource.cost)
})

test("course list puts must haves first, then role picks, without duplicates", () => {
  const list = courseList(path, 1)
  expect(list[0]).toMatchObject({ title: navigatorResources.nist.title, mustHave: true })
  expect(list[1]).toMatchObject({
    title: navigatorResources.kaggle.title,
    mustHave: false,
    forRole: true,
  })
  expect(list.filter((course) => course.mustHave)).toHaveLength(1)
  expect(new Set(list.map((course) => course.href)).size).toBe(list.length)
  expect(list.length).toBeGreaterThanOrEqual(5)
})

test("courses change with the chosen role", () => {
  const titles = (role: number | null) => courseList(path, role).map((course) => course.title)
  expect(titles(0)[1]).toBe(navigatorResources.istqb.title)
  expect(titles(1)[1]).toBe(navigatorResources.kaggle.title)
  expect(titles(null)).not.toEqual(titles(1))
})

test("recommendations use explicit canonical preferences, never inferred profile text", () => {
  expect(
    recommendStrategy({ occupationResolved: false, selectedStrategyId: "automate" }),
  ).toMatchObject({ strategyId: null, reasonCode: "missing_occupation" })
  for (const preference of [undefined, "unknown", "explore"] as const)
    expect(
      recommendStrategy({ occupationResolved: true, movementPreference: preference }),
    ).toMatchObject({ strategyId: null, reasonCode: "insufficient_preferences" })
  for (const [movementPreference, strategyId] of [
    ["stay", null],
    ["grow", null],
    ["change", null],
    ["create", null],
  ] as const)
    expect(recommendStrategy({ occupationResolved: true, movementPreference })).toMatchObject({
      strategyId,
      reasonCode: "insufficient_preferences",
    })
  expect(
    recommendStrategy({
      occupationResolved: true,
      movementPreference: "stay",
      selectedStrategyId: "automate",
    }),
  ).toMatchObject({ strategyId: "automate", reasonCode: "explicit_strategy" })
})

test("draft requires exactly one of each strategy and excludes model recommendations", () => {
  const path = {
    title: "Practical option",
    focus: "Domain practice",
    humanEdge: "Judgment",
    tradeoff: "Practice required",
    destinationIds: [],
    description: "Build on work.",
    why: "Uses existing skills.",
    skills: ["Review", "Writing", "Testing"],
    roles: ["Analyst", "Specialist", "Practitioner"],
    project: "Review a sample.",
    firstStep: "Map one task.",
    resourceIds: ["learn"],
    roleResourceIds: [[], [], []],
  }
  const draft = {
    summary: "Four options",
    recommendedPathId: "create",
    paths: pathIdSchema.options.map((id) => ({ ...path, id })),
  }
  expect(navigatorDraftSchema.parse(draft)).not.toHaveProperty("recommendedPathId")
  expect(navigatorDraftSchema.safeParse({ ...draft, paths: draft.paths.slice(0, 3) }).success).toBe(
    false,
  )
  expect(
    navigatorDraftSchema.safeParse({
      ...draft,
      paths: [...draft.paths.slice(0, 3), draft.paths[0]],
    }).success,
  ).toBe(false)
  expect(
    navigatorDraftSchema.safeParse({
      ...draft,
      paths: draft.paths.map((p) => ({ ...p, id: "quality" })),
    }).success,
  ).toBe(false)
})

test("strategy meanings distinguish operating AI, human work, moving roles and ownership", () => {
  expect(navigatorStrategies.automate.meaning).toContain("operate, supervise or configure")
  expect(navigatorStrategies.hybrid.meaning).toContain("judgment, relationships and creativity")
  expect(navigatorStrategies.pivot.meaning).toContain("validate transferability")
  expect(navigatorStrategies.create.meaning).toContain("you own")
})
