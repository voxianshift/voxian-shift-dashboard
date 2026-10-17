import { cardWidth, cardHeight, type RoleNode } from "./career-canvas"

type Point = { x: number; y: number }
const clearance = 24
const arrowApproach = 80

export function routeCareerEdge(source: RoleNode, target: RoleNode, nodes: RoleNode[]): Point[] {
  const start = { x: source.position.x + cardWidth, y: source.position.y + cardHeight / 2 }
  const end = { x: target.position.x, y: target.position.y + cardHeight / 2 }
  const from = { x: start.x + clearance + 1, y: start.y }
  const to = { x: end.x - arrowApproach - 1, y: end.y }
  const boxes = nodes.map((node) => ({
    left: node.position.x - arrowApproach,
    right: node.position.x + cardWidth + clearance,
    top: node.position.y - clearance,
    bottom: node.position.y + cardHeight + clearance,
  }))
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
