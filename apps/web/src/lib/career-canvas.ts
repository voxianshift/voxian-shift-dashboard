import { MarkerType, type Edge, type Node } from "@xyflow/react"
import type { CareerPath } from "@voxian/shared"

export const rolePageSize = 3
export const cardWidth = 260
export const cardHeight = 208
// Desktop zooms out so neighbouring cards stay visible; large screens have room for full size.
export const defaultZoom = 0.7
export const largeScreenZoom = 1
export const largeScreenQuery = "(min-width: 1536px)"

export function selectedCardViewport(
  position: { x: number; y: number },
  width: number,
  height: number,
  maxZoom = defaultZoom,
) {
  const zoom = Math.max(
    0.25,
    Math.min(maxZoom, (width - 32) / cardWidth, (height - 32) / cardHeight),
  )
  return {
    x: width / 2 - (position.x + cardWidth / 2) * zoom,
    y: height / 2 - (position.y + cardHeight / 2) * zoom,
    zoom,
  }
}
export type RoleNode = Node<
  {
    title: string
    strategyLabel?: string
    subtitle: string
    color: string
    kind: "start" | "path" | "role" | "more"
    pathId?: string
  },
  "role"
>

// Reserve one row per role so all four branches remain visible without overlaps.
export function buildCareerNodes(
  careerPaths: CareerPath[],
  roleTitle: string,
  roleLimits: Record<string, number> = {},
): RoleNode[] {
  const rowHeight = cardHeight + 48
  const branchRows = careerPaths.map((path) =>
    Math.max(1, Math.min(rolePageSize, path.roles.length)),
  )
  const totalRows = branchRows.reduce((sum, rows) => sum + rows, 0)
  let rowOffset = 0
  return [
    {
      id: "start",
      type: "role",
      position: { x: 0, y: ((totalRows - 1) * rowHeight) / 2 },
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
    ...careerPaths.flatMap((path, index): RoleNode[] => {
      const firstRow = rowOffset
      rowOffset += branchRows[index]!
      const visibleCount = Math.min(path.roles.length, roleLimits[path.id] ?? rolePageSize)
      const remaining = path.roles.length - visibleCount
      return [
        {
          id: path.id,
          type: "role",
          position: { x: 360, y: (firstRow + (branchRows[index]! - 1) / 2) * rowHeight },
          width: cardWidth,
          height: cardHeight,
          ariaLabel: `Explore ${path.title}`,
          data: {
            title: path.title,
            strategyLabel: path.label,
            subtitle:
              path.mappingLevel === "family" ? "Family exploration · validate fit" : path.focus,
            color: path.color,
            kind: "path",
            pathId: path.id,
          },
        },
        ...path.roles.slice(0, visibleCount).map((role, roleIndex): RoleNode => ({
          id: `${path.id}-role-${roleIndex}`,
          type: "role",
          position: {
            x: 720 + Math.floor(roleIndex / rolePageSize) * 360,
            y: (firstRow + (roleIndex % rolePageSize)) * rowHeight,
          },
          width: cardWidth,
          height: cardHeight,
          ariaLabel: `Explore ${role}`,
          data: {
            title: role,
            subtitle: "Curated pathway · verify requirements",
            color: path.color,
            kind: "role",
            pathId: path.id,
          },
        })),
        ...(remaining > 0
          ? [
              {
                id: `${path.id}-more`,
                type: "role" as const,
                position: {
                  x: 720 + Math.ceil(visibleCount / rolePageSize) * 360,
                  y: (firstRow + 1) * rowHeight,
                },
                width: cardWidth,
                height: cardHeight,
                ariaLabel: `Show ${Math.min(rolePageSize, remaining)} more options for ${path.label}; ${remaining} remaining`,
                data: {
                  title: `+${remaining} more options`,
                  subtitle: `Show next ${Math.min(rolePageSize, remaining)} curated options`,
                  color: path.color,
                  kind: "more" as const,
                  pathId: path.id,
                },
              },
            ]
          : []),
      ]
    }),
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
    const selectedIndex =
      selected?.data.kind === "role" ? Number(selected.id.split("-role-")[1]) : -1
    return [
      { id: `start-${path.id}`, source: "start", target: path.id, active: inPath },
      ...careerNodes
        .filter((node) => node.data.pathId === path.id && node.data.kind === "role")
        .map((node) => {
          const index = Number(node.id.split("-role-")[1])
          return {
            id: `${path.id}-next-${index}`,
            source:
              index < rolePageSize
                ? path.id
                : `${path.id}-role-${Math.floor(index / rolePageSize) * rolePageSize - 1}`,
            target: node.id,
            active:
              inPath &&
              (selectedId === path.id ||
                selectedId === node.id ||
                (index % rolePageSize === rolePageSize - 1 && index < selectedIndex)),
          }
        }),
      ...careerNodes
        .filter((node) => node.data.pathId === path.id && node.data.kind === "more")
        .map((node) => ({
          id: `${path.id}-more-edge`,
          source: careerNodes
            .filter((role) => role.data.pathId === path.id && role.data.kind === "role")
            .at(-1)!.id,
          target: node.id,
          active: inPath,
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
