import { expect, test } from "vite-plus/test"
import { courseList, navigatorResources, pathCourseIds, type CareerPath } from "./navigator.ts"

const path = {
  id: "quality",
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
