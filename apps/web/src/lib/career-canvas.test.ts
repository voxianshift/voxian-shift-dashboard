import { expect, test } from "vite-plus/test"
import {
  cardWidth,
  cardHeight,
  buildCareerNodes,
  careerEdges,
  visibleCareerNodes,
  selectedCardViewport,
  defaultZoom,
  largeScreenZoom,
} from "./career-canvas"
import { navigatorFixture } from "./navigator.fixture"
const careerPaths = navigatorFixture.paths
const careerNodes = buildCareerNodes(careerPaths, navigatorFixture.roleTitle)

test("selection resets zoom and centers the card in unobscured canvas space", () => {
  const position = { x: 720, y: 256 }
  for (const [width, height] of [
    [800, 700],
    [240, 400],
    [430, 80],
  ]) {
    const viewport = selectedCardViewport(position, width, height)
    expect(viewport.x + (position.x + cardWidth / 2) * viewport.zoom).toBeCloseTo(width / 2)
    expect(viewport.y + (position.y + cardHeight / 2) * viewport.zoom).toBeCloseTo(height / 2)
    expect(viewport.zoom).toBeGreaterThanOrEqual(0.25)
    expect(viewport.zoom).toBeLessThanOrEqual(defaultZoom)
  }
  expect(selectedCardViewport(position, 800, 700).zoom).toBe(defaultZoom)
  expect(selectedCardViewport(position, 180, 400).zoom).toBeCloseTo(148 / cardWidth)
  expect(selectedCardViewport(position, 800, 700, largeScreenZoom).zoom).toBe(largeScreenZoom)
})

test("all nine role options are reachable through their own direction", () => {
  expect(careerNodes.filter((node) => node.data.kind === "role")).toHaveLength(9)
  for (const path of careerPaths) {
    const roles = careerNodes.filter(
      (node) => node.data.pathId === path.id && node.data.kind === "role",
    )
    expect(roles.map((node) => node.data.title)).toEqual([...path.roles])
    for (const role of roles) {
      expect(
        careerEdges(careerPaths, careerNodes, null).find((edge) => edge.target === role.id)?.source,
      ).toBe(path.id)
      let id = role.id
      const seen = new Set<string>()
      while (id !== "start") {
        expect(seen.has(id)).toBe(false)
        seen.add(id)
        const incoming = careerEdges(careerPaths, careerNodes, null).find(
          (edge) => edge.target === id,
        )
        expect(incoming).toBeDefined()
        id = incoming!.source
      }
      expect(seen.has(path.id)).toBe(true)
    }
  }
})

test("each direction displays three peer options without overlapping visible cards", () => {
  for (const path of careerPaths) {
    const nodes = visibleCareerNodes(careerNodes, path.id)
    const roles = nodes.filter((node) => node.data.kind === "role")
    expect(roles.map((node) => node.data.title)).toEqual([...path.roles])
    expect(new Set(roles.map((node) => node.position.x)).size).toBe(1)
    for (const [index, node] of nodes.entries()) {
      expect(node.width).toBe(cardWidth)
      expect(node.height).toBe(cardHeight)
      for (const other of nodes.slice(index + 1)) {
        const horizontalGap = Math.abs(node.position.x - other.position.x) - cardWidth
        const verticalGap = Math.abs(node.position.y - other.position.y) - cardHeight
        expect(horizontalGap >= 60 || verticalGap >= 48).toBe(true)
      }
    }
  }
})

test("selecting a role animates only its route from starting point", () => {
  const active = careerEdges(careerPaths, careerNodes, "operations-role-1").filter(
    (edge) => edge.animated,
  )
  expect(active.map((edge) => edge.id)).toEqual(["start-operations", "operations-next-1"])
  expect(active.every((edge) => edge.style?.filter?.includes("drop-shadow"))).toBe(true)
  expect(
    careerEdges(careerPaths, careerNodes, "operations-role-1")
      .filter((edge) => edge.source === "advocate")
      .every((edge) => !edge.animated),
  ).toBe(true)
  expect(careerEdges(careerPaths, careerNodes, null).some((edge) => edge.animated)).toBe(false)
})

test("direction selection highlights every peer role without role-to-role links", () => {
  expect(
    careerEdges(careerPaths, careerNodes, null).every((edge) => !edge.source.includes("-role-")),
  ).toBe(true)
  expect(
    careerEdges(careerPaths, careerNodes, "quality")
      .filter((edge) => edge.animated)
      .map((edge) => edge.target),
  ).toEqual(["quality", "quality-role-0", "quality-role-1", "quality-role-2"])
})

test("canvas starting point uses the supplied profile occupation", () => {
  expect(careerNodes.find((node) => node.id === "start")?.data.title).toBe("Software Developers")
  const renamed = buildCareerNodes(careerPaths, "Architects")
  expect(renamed.find((node) => node.id === "start")?.data.title).toBe("Architects")
})
