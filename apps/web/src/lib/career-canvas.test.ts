import { expect, test } from "vite-plus/test"
import {
  cardWidth,
  cardHeight,
  buildCareerNodes,
  careerEdges,
  selectedCardViewport,
  defaultZoom,
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
    expect(viewport.zoom).toBeLessThanOrEqual(defaultZoom)
  }
  expect(selectedCardViewport(position, 800, 700).zoom).toBe(defaultZoom)
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
    expect(
      Math.abs(parent.position.y - (roles[0]!.position.y + roles.at(-1)!.position.y) / 2),
    ).toBeLessThanOrEqual(24)
  }
  for (const [index, node] of nodes.entries()) {
    expect(node.width).toBe(cardWidth)
    expect(node.height).toBe(cardHeight)
    for (const other of nodes.slice(index + 1)) {
      const horizontalGap = Math.abs(node.position.x - other.position.x) - cardWidth
      const verticalGap = Math.abs(node.position.y - other.position.y) - cardHeight
      expect(horizontalGap >= 60 || verticalGap >= 48).toBe(true)
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

test("all roles show in columns of three with no overlaps and edges from the strategy", () => {
  const path = {
    ...careerPaths[0]!,
    roles: Array.from({ length: 8 }, (_, index) => `Curated option ${index + 1}`),
  }
  const nodes = buildCareerNodes([path], "Starting occupation")
  const roles = nodes.filter((node) => node.data.kind === "role")
  expect(roles).toHaveLength(8)
  expect(new Set(roles.map((node) => Math.round((node.position.x - 920) / 420))).size).toBe(3)
  expect(new Set(roles.map((node) => Math.round(node.position.y / (cardHeight + 56)))).size).toBe(3)
  for (const [index, node] of nodes.entries())
    for (const other of nodes.slice(index + 1))
      expect(
        Math.abs(node.position.x - other.position.x) >= cardWidth + 60 ||
          Math.abs(node.position.y - other.position.y) >= cardHeight + 48,
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
  ).toEqual([4, 3, 3, 3])
})

test("fixed card grid stays aligned across renders", () => {
  expect(buildCareerNodes(careerPaths, navigatorFixture.roleTitle)).toEqual(careerNodes)
  const roles = careerNodes.filter((node) => node.data.kind === "role")
  expect(new Set(roles.map((node) => node.position.x)).size).toBe(1)
  expect(roles.every((node) => node.position.y % (cardHeight + 56) === 0)).toBe(true)
})
