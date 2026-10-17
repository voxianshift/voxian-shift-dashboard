import { cardWidth, cardHeight, type RoleNode } from "./career-canvas"

export type Point = { x: number; y: number }
const clearance = 24
const arrowApproach = 80

export function nodeBounds(node: RoleNode) {
  return {
    left: node.position.x,
    top: node.position.y,
    right: node.position.x + (node.width ?? cardWidth),
    bottom: node.position.y + (node.height ?? cardHeight),
  }
}
export function edgeAnchor(node: RoleNode, source: boolean): Point {
  const box = nodeBounds(node)
  return {
    x:
      node.data.kind === "start"
        ? box.left + 174
        : node.data.kind === "path"
          ? box.left + (source ? 182 : 78)
          : source
            ? box.right
            : box.left,
    y:
      box.top +
      (node.data.kind === "start"
        ? 96
        : node.data.kind === "path"
          ? 90
          : (node.height ?? cardHeight) / 2),
  }
}

export function routeCareerEdge(source: RoleNode, target: RoleNode, nodes: RoleNode[]): Point[] {
  const start = edgeAnchor(source, true)
  const end = edgeAnchor(target, false)
  const from = { x: start.x + clearance + 1, y: start.y }
  const to = { x: end.x - arrowApproach - 1, y: end.y }
  const boxes = nodes
    .filter((node) => node.id !== source.id && node.id !== target.id)
    .map((node) => {
      const box = nodeBounds(node)
      return {
        left: box.left - arrowApproach,
        right: box.right + clearance,
        top: box.top - clearance,
        bottom: box.bottom + clearance,
      }
    })
  const xs = [...new Set([from.x, to.x, ...boxes.flatMap((box) => [box.left, box.right])])].sort(
    (a, b) => a - b,
  )
  const ys = [...new Set([from.y, to.y, ...boxes.flatMap((box) => [box.top, box.bottom])])].sort(
    (a, b) => a - b,
  )
  const point = (id: number): Point => ({
    x: xs[id % xs.length]!,
    y: ys[Math.floor(id / xs.length)]!,
  })
  const idOf = (p: Point) => ys.indexOf(p.y) * xs.length + xs.indexOf(p.x)
  const blocked = (a: Point, b: Point) =>
    boxes.some((box) =>
      a.x === b.x
        ? a.x > box.left &&
          a.x < box.right &&
          Math.max(a.y, b.y) > box.top &&
          Math.min(a.y, b.y) < box.bottom
        : a.y > box.top &&
          a.y < box.bottom &&
          Math.max(a.x, b.x) > box.left &&
          Math.min(a.x, b.x) < box.right,
    )
  const startId = idOf(from)
  const endId = idOf(to)
  const queue = [startId]
  const costs = new Map([[startId, 0]])
  const previous = new Map<number, number>()
  const visited = new Set<number>()
  const heuristic = (id: number) => Math.abs(point(id).x - to.x) + Math.abs(point(id).y - to.y)
  while (queue.length) {
    queue.sort((a, b) => costs.get(a)! + heuristic(a) - costs.get(b)! - heuristic(b))
    const current = queue.shift()!
    if (visited.has(current)) continue
    if (current === endId) {
      const route = [to]
      let cursor = current
      while (previous.has(cursor)) {
        cursor = previous.get(cursor)!
        route.unshift(point(cursor))
      }
      const points = [start, ...route, end]
      return points.filter((p, index) => {
        const before = points[index - 1],
          after = points[index + 1]
        return (
          !before ||
          !after ||
          !((before.x === p.x && p.x === after.x) || (before.y === p.y && p.y === after.y))
        )
      })
    }
    visited.add(current)
    const column = current % xs.length
    const row = Math.floor(current / xs.length)
    const neighbors = [
      column > 0 ? current - 1 : -1,
      column < xs.length - 1 ? current + 1 : -1,
      row > 0 ? current - xs.length : -1,
      row < ys.length - 1 ? current + xs.length : -1,
    ]
    for (const neighbor of neighbors) {
      if (neighbor < 0 || visited.has(neighbor)) continue
      const a = point(current),
        b = point(neighbor)
      if (blocked(a, b)) continue
      const cost = costs.get(current)! + Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
      if (cost >= (costs.get(neighbor) ?? Infinity)) continue
      costs.set(neighbor, cost)
      previous.set(neighbor, current)
      queue.push(neighbor)
    }
  }
  // Overlapping cards leave no safe corridor: omit the edge rather than draw through them.
  return []
}

export function curvedCareerPath(points: Point[]) {
  if (!points.length) return ""
  let path = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 1; i < points.length - 1; i++) {
    const before = points[i - 1]!,
      corner = points[i]!,
      after = points[i + 1]!
    const incoming = Math.hypot(corner.x - before.x, corner.y - before.y)
    const outgoing = Math.hypot(after.x - corner.x, after.y - corner.y)
    const radius = Math.min(16, incoming / 2, outgoing / 2)
    const a = {
      x: corner.x + ((before.x - corner.x) * radius) / incoming,
      y: corner.y + ((before.y - corner.y) * radius) / incoming,
    }
    const b = {
      x: corner.x + ((after.x - corner.x) * radius) / outgoing,
      y: corner.y + ((after.y - corner.y) * radius) / outgoing,
    }
    path += ` L ${a.x} ${a.y} Q ${corner.x} ${corner.y} ${b.x} ${b.y}`
  }
  const last = points.at(-1)!
  return `${path} L ${last.x} ${last.y}`
}

type Cubic = [Point, Point, Point, Point]

function cubicIsClear(curve: Cubic, obstacles: ReturnType<typeof nodeBounds>[]) {
  const [a, b, c, d] = curve
  const steps = Math.ceil(
    (Math.hypot(b.x - a.x, b.y - a.y) +
      Math.hypot(c.x - b.x, c.y - b.y) +
      Math.hypot(d.x - c.x, d.y - c.y)) /
      3,
  )
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      u = 1 - t
    const x = u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x
    const y = u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y
    if (
      obstacles.some(
        (box) => x > box.left - 16 && x < box.right + 16 && y > box.top - 16 && y < box.bottom + 16,
      )
    )
      return false
  }
  return true
}
function cubicPath(curves: Cubic[]) {
  return (
    `M ${curves[0]![0].x} ${curves[0]![0].y}` +
    curves.map(([, b, c, d]) => ` C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`).join("")
  )
}
export function referenceCareerPath(source: RoleNode, target: RoleNode, nodes: RoleNode[]) {
  const start = edgeAnchor(source, true),
    end = edgeAnchor(target, false)
  const bend = Math.max(100, (end.x - start.x) * 0.5)
  const obstacles = nodes
    .filter((node) => node.id !== source.id && node.id !== target.id)
    .map(nodeBounds)
  const direct: Cubic = [
    start,
    { x: start.x + bend, y: start.y },
    { x: end.x - bend, y: end.y },
    end,
  ]
  if (cubicIsClear(direct, obstacles)) return cubicPath([direct])
  const nearby = obstacles.filter(
    (box) =>
      box.right > start.x &&
      box.left < end.x &&
      box.bottom > Math.min(start.y, end.y) - 180 &&
      box.top < Math.max(start.y, end.y) + 180,
  )
  const top = Math.min(start.y, end.y, ...nearby.map((box) => box.top))
  const bottom = Math.max(start.y, end.y, ...nearby.map((box) => box.bottom))
  // Smooth arches keep horizontal tangents at both nodes and avoid box-shaped detours.
  for (const margin of [60, 100, 160, 240])
    for (const y of [top - margin, bottom + margin])
      for (const fraction of [0.35, 0.5, 0.65]) {
        const mid = { x: start.x + (end.x - start.x) * fraction, y }
        const left = (mid.x - start.x) * 0.5,
          right = (end.x - mid.x) * 0.5
        const curves: Cubic[] = [
          [start, { x: start.x + left, y: start.y }, { x: mid.x - left, y }, mid],
          [mid, { x: mid.x + right, y }, { x: end.x - right, y: end.y }, end],
        ]
        if (curves.every((curve) => cubicIsClear(curve, obstacles))) return cubicPath(curves)
      }
  return curvedCareerPath(routeCareerEdge(source, target, nodes))
}
