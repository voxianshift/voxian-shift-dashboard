import { expect, test } from "vite-plus/test"
import { buildCareerNodes, cardWidth, cardHeight } from "./career-canvas"
import { routeCareerEdge, curvedCareerPath } from "./career-routing"
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
    expect(points.length).toBeGreaterThan(1)
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
              a.x < x + cardWidth + 8 &&
              Math.max(a.y, b.y) > y - 8 &&
              Math.min(a.y, b.y) < y + cardHeight + 8
            : a.y > y - 8 &&
              a.y < y + cardHeight + 8 &&
              Math.max(a.x, b.x) > x - 8 &&
              Math.min(a.x, b.x) < x + cardWidth + 8
        expect(crosses, `${source.id} → ${target.id} crossed ${node.id}`).toBe(false)
      }
    }
  }
})
