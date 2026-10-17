import { MarkerType, type Edge, type Node } from "@xyflow/react"
import type { CareerPath } from "@voxian/shared"

export const cardWidth = 260
export const cardHeight = 208

export function selectedCardViewport(
  position: { x: number; y: number },
  width: number,
  height: number,
) {
  const zoom = Math.max(0.25, Math.min(1, (width - 32) / cardWidth, (height - 32) / cardHeight))
  return {
    x: width / 2 - (position.x + cardWidth / 2) * zoom,
    y: height / 2 - (position.y + cardHeight / 2) * zoom,
    zoom,
  }
}
export type RoleNode = Node<
  {
    title: string
    subtitle: string
    color: string
    kind: "start" | "path" | "role"
    pathId?: string
  },
  "role"
>

// One direction’s peer roles appear at a time; each visible row keeps 48px clearance.
export function buildCareerNodes(careerPaths: CareerPath[], roleTitle: string): RoleNode[] {
  return [
    {
      id: "start",
      type: "role",
      position: { x: 0, y: 256 },
      width: cardWidth,
      height: cardHeight,
      selectable: false,
      focusable: false,
      data: {
        title: roleTitle,
        subtitle: "Your saved main occupation · your starting point",
        color: "var(--ring)",
        kind: "start",
      },
    },
    ...careerPaths.flatMap((path, index): RoleNode[] => [
      {
        id: path.id,
        type: "role",
        position: { x: 360, y: index * 256 },
        width: cardWidth,
        height: cardHeight,
        ariaLabel: `Explore ${path.title}`,
        data: {
          title: path.title,
          subtitle: path.focus,
          color: path.color,
          kind: "path",
          pathId: path.id,
        },
      },
      ...path.roles.map((role, roleIndex): RoleNode => ({
        id: `${path.id}-role-${roleIndex}`,
        type: "role",
        position: { x: 720, y: roleIndex * 256 },
        width: cardWidth,
        height: cardHeight,
        ariaLabel: `Explore ${role}`,
        data: {
          title: role,
          subtitle: "A possible role · view skills and learning",
          color: path.color,
          kind: "role",
          pathId: path.id,
        },
      })),
    ]),
  ]
}

export function careerEdges(
  careerPaths: CareerPath[],
  careerNodes: RoleNode[],
  selectedId: string | null,
): Edge[] {
  const selected = careerNodes.find((node) => node.id === selectedId)
  return careerPaths.flatMap((path) => {
    const inPath = selected?.data.pathId === path.id
    return [
      { id: `start-${path.id}`, source: "start", target: path.id, active: inPath },
      ...path.roles.map((_, index) => ({
        id: `${path.id}-next-${index}`,
        source: path.id,
        target: `${path.id}-role-${index}`,
        active: inPath && (selectedId === path.id || selectedId === `${path.id}-role-${index}`),
      })),
    ].map(({ active, ...edge }) => ({
      ...edge,
      type: "smoothstep",
      animated: active,
      style: {
        stroke: path.color,
        strokeWidth: active ? 2.5 : 1.3,
        filter: active ? `drop-shadow(0 0 2px ${path.color})` : undefined,
        opacity: selectedId && !active ? 0.3 : 1,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: path.color },
    }))
  })
}

export function visibleCareerNodes(careerNodes: RoleNode[], pathId: string) {
  return careerNodes.filter((node) => node.data.kind !== "role" || node.data.pathId === pathId)
}
