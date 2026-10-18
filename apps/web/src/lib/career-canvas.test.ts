import { expect, test } from "vite-plus/test"
import {
  cardWidth,
  cardHeight,
  buildCareerNodes,
  careerEdges,
  selectedCardViewport,
  focusedZoom,
  largeScreenZoom,
} from "./career-canvas"
import actualMappings from "../../../api/data/navigator-pathways.json"
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
    expect(viewport.zoom).toBeLessThanOrEqual(focusedZoom)
  }
  expect(selectedCardViewport(position, 800, 700).zoom).toBe(focusedZoom)
  expect(selectedCardViewport(position, 180, 400).zoom).toBeCloseTo(148 / cardWidth)
  expect(selectedCardViewport(position, 800, 700, largeScreenZoom).zoom).toBe(largeScreenZoom)
})

test("all twelve role options are reachable through their own direction", () => {
  expect(careerNodes.filter((node) => node.data.kind === "role")).toHaveLength(12)
  for (const path of careerPaths) {
    const roles = careerNodes.filter(
      (node) => node.data.pathId === path.id && node.data.kind === "role",
    )
    expect(roles.map((node) => node.data.title)).toEqual([...path.roles])
    expect(careerNodes.find((node) => node.id === path.id)?.data.strategyLabel).toBe(path.label)
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

test("all branches and roles occupy separate rows without overlapping cards", () => {
  const nodes = careerNodes
  expect(nodes).toHaveLength(17)
  for (const path of careerPaths) {
    const roles = nodes.filter((node) => node.data.kind === "role" && node.data.pathId === path.id)
    expect(roles.map((node) => node.data.title)).toEqual([...path.roles])
    const parent = nodes.find((node) => node.id === path.id)!
    expect(parent.position.y + 90).toBe(
      (roles[0]!.position.y + roles.at(-1)!.position.y) / 2 + roles[0]!.height! / 2,
    )
  }
  for (const [index, node] of nodes.entries()) {
    expect(node.width).toBe(
      node.data.kind === "role" ? 320 : node.data.kind === "start" ? 220 : 260,
    )
    expect(node.height).toBe(
      node.data.kind === "role" ? 64 : node.data.kind === "start" ? 240 : 260,
    )
    for (const other of nodes.slice(index + 1)) {
      const separated =
        node.position.x + node.width! + 32 <= other.position.x ||
        other.position.x + other.width! + 32 <= node.position.x ||
        node.position.y + node.height! + 32 <= other.position.y ||
        other.position.y + other.height! + 32 <= node.position.y
      expect(separated).toBe(true)
    }
  }
})

test("partial and missing role coverage still reserve non-overlapping branches", () => {
  const paths = careerPaths.map((path, index) => ({ ...path, roles: path.roles.slice(0, index) }))
  const nodes = buildCareerNodes(paths, "Software Developers")
  expect(new Set(nodes.map((node) => node.id)).size).toBe(nodes.length)
  const branches = nodes.filter((node) => node.data.kind === "path")
  for (let i = 1; i < branches.length; i++) {
    expect(branches[i]!.position.y - branches[i - 1]!.position.y).toBeGreaterThanOrEqual(
      cardHeight + 48,
    )
  }
})

test("selecting a role animates only its route from starting point", () => {
  const active = careerEdges(careerPaths, careerNodes, "automate-role-1").filter(
    (edge) => edge.animated,
  )
  expect(active.map((edge) => edge.id)).toEqual(["start-automate", "automate-next-1"])
  expect(active.every((edge) => edge.style?.filter?.includes("drop-shadow"))).toBe(true)
  expect(
    careerEdges(careerPaths, careerNodes, "automate-role-1")
      .filter((edge) => edge.source === "hybrid")
      .every((edge) => !edge.animated),
  ).toBe(true)
  expect(careerEdges(careerPaths, careerNodes, null).some((edge) => edge.animated)).toBe(false)
})

test("direction selection highlights every peer role without role-to-role links", () => {
  expect(
    careerEdges(careerPaths, careerNodes, null).every((edge) => !edge.source.includes("-role-")),
  ).toBe(true)
  expect(
    careerEdges(careerPaths, careerNodes, "pivot")
      .filter((edge) => edge.animated)
      .map((edge) => edge.target),
  ).toEqual(["pivot", "pivot-role-0", "pivot-role-1", "pivot-role-2"])
})

test("canvas starting point uses the supplied profile occupation", () => {
  expect(careerNodes.find((node) => node.id === "start")?.data.title).toBe("Software Developers")
  const renamed = buildCareerNodes(careerPaths, "Architects")
  expect(renamed.find((node) => node.id === "start")?.data.title).toBe("Architects")
})

test("five or more roles use three columns with no overlaps and edges from the strategy", () => {
  const path = {
    ...careerPaths[0]!,
    roles: Array.from({ length: 8 }, (_, index) => `Curated option ${index + 1}`),
  }
  const nodes = buildCareerNodes([path], "Starting occupation")
  const roles = nodes.filter((node) => node.data.kind === "role")
  expect(roles).toHaveLength(8)
  expect(new Set(roles.map((node) => Math.round((node.position.x - 880) / 440))).size).toBe(3)
  expect(new Set(roles.map((node) => Math.round(node.position.y / 100))).size).toBe(3)
  for (const [index, node] of nodes.entries())
    for (const other of nodes.slice(index + 1))
      expect(
        node.position.x + node.width! + 32 <= other.position.x ||
          other.position.x + other.width! + 32 <= node.position.x ||
          node.position.y + node.height! + 32 <= other.position.y ||
          other.position.y + other.height! + 32 <= node.position.y,
      ).toBe(true)
  const edges = careerEdges([path], nodes, "automate-role-7")
  expect(
    edges.filter((edge) => edge.target !== "automate").every((edge) => edge.source === "automate"),
  ).toBe(true)
})

test("real prototype mappings show every curated role", () => {
  const actual = actualMappings.occupations["43-4051.00"].strategies
  const paths = careerPaths.map((path) => ({
    ...path,
    roles: actual[path.id].destinations.map((destination) => destination.title),
  }))
  const nodes = buildCareerNodes(paths, "Customer Service Representatives")
  expect(
    paths.map(
      (path) =>
        nodes.filter((node) => node.data.kind === "role" && node.data.pathId === path.id).length,
    ),
  ).toEqual([4, 4, 2, 3])
})

test("fixed card grid stays aligned across renders", () => {
  expect(buildCareerNodes(careerPaths, navigatorFixture.roleTitle)).toEqual(careerNodes)
  const roles = careerNodes.filter((node) => node.data.kind === "role")
  expect(new Set(roles.map((node) => node.position.x)).size).toBe(1)
  for (const path of careerPaths) {
    const branch = roles.filter((node) => node.data.pathId === path.id)
    expect(branch.every((node, i) => node.position.y === branch[0]!.position.y + i * 100)).toBe(
      true,
    )
  }
})

test.each([1, 2, 3, 4, 5, 6, 7, 10])(
  "%i roles choose single column or three-column grid",
  (count) => {
    const path = { ...careerPaths[0]!, roles: Array.from({ length: count }, (_, i) => `Role ${i}`) }
    const roles = buildCareerNodes([path], "Present").filter((node) => node.data.kind === "role")
    expect(new Set(roles.map((node) => node.position.x)).size).toBe(count <= 4 ? 1 : 3)
    expect(new Set(roles.map((node) => node.position.y)).size).toBe(
      count <= 4 ? count : Math.ceil(count / 3),
    )
  },
)
