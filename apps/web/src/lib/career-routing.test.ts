import { expect, test } from "vite-plus/test"
import { buildCareerNodes } from "./career-canvas"
import { routeCareerEdge, curvedCareerPath, referenceCareerPath } from "./career-routing"
import { navigatorFixture } from "./navigator.fixture"

test("connections avoid every unrelated card, including roles in intermediate columns", () => {
  const paths = navigatorFixture.paths.map((path) => ({
    ...path,
    roles: Array.from({ length: 8 }, (_, i) => `${path.id} role ${i}`),
  }))
  const nodes = buildCareerNodes(paths, "Current role")
  for (const target of nodes.filter((node) => node.id !== "start")) {
    const source = nodes.find(
      (node) => node.id === (target.data.kind === "path" ? "start" : target.data.pathId),
    )!
    const points = routeCareerEdge(source, target, nodes)
    expect(points.length, `${source.id} to ${target.id}`).toBeGreaterThan(1)
    const end = points.at(-1)!,
      approach = points.at(-2)!
    expect(approach.y).toBe(end.y)
    expect(end.x - approach.x).toBeGreaterThanOrEqual(80)
    expect(curvedCareerPath(points)).not.toContain("NaN")
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]!,
        b = points[i]!
      for (const node of nodes.filter((node) => node.id !== source.id && node.id !== target.id)) {
        const { x, y } = node.position
        const crosses =
          a.x === b.x
            ? a.x > x - 8 &&
              a.x < x + node.width! + 8 &&
              Math.max(a.y, b.y) > y - 8 &&
              Math.min(a.y, b.y) < y + node.height! + 8
            : a.y > y - 8 &&
              a.y < y + node.height! + 8 &&
              Math.max(a.x, b.x) > x - 8 &&
              Math.min(a.x, b.x) < x + node.width! + 8
        expect(crosses, `${source.id} → ${target.id} crossed ${node.id}`).toBe(false)
      }
    }
  }
})

test("reference branches use smooth curves with obstacle detours", () => {
  const nodes = buildCareerNodes(navigatorFixture.paths, "Present")
  const source = nodes.find((node) => node.id === "automate")!
  const target = nodes.find((node) => node.id === "automate-role-0")!
  expect(referenceCareerPath(source, target, nodes)).toContain(" C ")
  expect(referenceCareerPath(source, target, nodes)).not.toContain("NaN")
})

test("later-column role uses a smooth arch around intervening pills", () => {
  const paths = navigatorFixture.paths.map((path) => ({
    ...path,
    roles: Array.from({ length: 5 }, (_, i) => `${path.id} option ${i}`),
  }))
  const nodes = buildCareerNodes(paths, "Present")
  const route = referenceCareerPath(
    nodes.find((node) => node.id === "automate")!,
    nodes.find((node) => node.id === "automate-role-1")!,
    nodes,
  )
  expect(route.match(/ C /g)).toHaveLength(2)
  expect(route).not.toMatch(/ [LQ] /)
})
