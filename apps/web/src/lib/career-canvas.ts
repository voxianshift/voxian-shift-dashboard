import { type Edge, type Node } from "@xyflow/react"
import { referenceCareerPath } from "./career-routing"
import type { CareerPath, CvContext } from "@voxian/shared"
import { cvAlignment } from "./cv-alignment"

const roleGridColumns = 3
export const cardWidth = 260
export const cardHeight = 152
// Desktop zooms out so neighbouring cards stay visible; large screens have room for full size.
export const defaultZoom = 0.7
export const largeScreenZoom = 1
export const focusedZoom = 1.25
export const largeScreenFocusedZoom = 1.5
export const strategyColors: Record<string, string> = {
  automate: "#00f2fe",
  hybrid: "#b000ff",
  pivot: "#f59e0b",
  create: "#f72585",
}
export const largeScreenQuery = "(min-width: 1536px)"

export function selectedCardViewport(
  position: { x: number; y: number },
  width: number,
  height: number,
  maxZoom = focusedZoom,
  size = { width: cardWidth, height: cardHeight },
) {
  const zoom = Math.max(
    0.25,
    Math.min(maxZoom, (width - 32) / size.width, (height - 32) / size.height),
  )
  return {
    x: width / 2 - (position.x + size.width / 2) * zoom,
    y: height / 2 - (position.y + size.height / 2) * zoom,
    zoom,
  }
}
export type RoleNode = Node<
  {
    title: string
    strategyLabel?: string
    subtitle: string
    color: string
    kind: "start" | "path" | "role"
    pathId?: string
    skills?: string[]
    alignment?: ReturnType<typeof cvAlignment>
    cvMatches?: CareerPath["cvMatches"]
  },
  "role"
>

// Fixed branch bands match the reference, with compact pills and room for labels.
export function buildCareerNodes(
  careerPaths: CareerPath[],
  roleTitle: string,
  cv?: CvContext | null,
): RoleNode[] {
  const rowHeight = 100
  const roleRows = careerPaths.map((path) =>
    path.roles.length <= 4 ? path.roles.length : Math.ceil(path.roles.length / roleGridColumns),
  )
  const branchRows = roleRows.map((rows) => Math.max(3, rows))
  const totalHeight = branchRows.reduce((sum, rows) => sum + rows * rowHeight + 64, 0)
  let offset = 0
  return [
    {
      id: "start",
      type: "role",
      position: { x: 0, y: totalHeight / 2 - 120 },
      width: 220,
      height: 240,
      selectable: false,
      focusable: false,
      data: { title: roleTitle, subtitle: "Day 0 Baseline", color: "#00f2fe", kind: "start" },
    },
    ...careerPaths.flatMap((path, pathIndex): RoleNode[] => {
      const rows = branchRows[pathIndex]!
      const center = offset + ((rows - 1) * rowHeight) / 2 + 32
      const firstRow = offset + ((rows - roleRows[pathIndex]!) * rowHeight) / 2
      offset += rows * rowHeight + 64
      const color = strategyColors[path.id] ?? path.color
      return [
        {
          id: path.id,
          type: "role",
          position: { x: 560, y: center - 90 },
          width: 260,
          height: 260,
          ariaLabel: `Explore ${path.label} strategy`,
          data: {
            title: path.title,
            strategyLabel: path.label,
            subtitle:
              path.mappingLevel === "family"
                ? "Family exploration · validate fit"
                : path.coverage === "available"
                  ? ""
                  : path.focus,
            color,
            kind: "path",
            pathId: path.id,
            skills: (path.requiredSkills ?? path.skills).slice(0, 3),
            alignment:
              path.coverage === "available"
                ? cvAlignment(path.requiredSkills ?? [], cv, path.cvMatches)
                : null,
            cvMatches: path.cvMatches,
          },
        },
        ...path.roles.map((role, i): RoleNode => ({
          id: `${path.id}-role-${i}`,
          type: "role",
          position: {
            x: 1120 + (path.roles.length <= 4 ? 0 : i % roleGridColumns) * 440,
            y:
              firstRow + (path.roles.length <= 4 ? i : Math.floor(i / roleGridColumns)) * rowHeight,
          },
          width: 320,
          height: 64,
          ariaLabel: `Explore ${role}`,
          data: { title: role, subtitle: "", color, kind: "role", pathId: path.id },
        })),
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
    return [
      { id: `start-${path.id}`, source: "start", target: path.id, active: inPath },
      ...careerNodes
        .filter((node) => node.data.pathId === path.id && node.data.kind !== "path")
        .map((node) => ({
          id: `${path.id}-next-${node.id.split("-role-")[1]}`,
          source: path.id,
          target: node.id,
          active: inPath && (selectedId === path.id || selectedId === node.id),
        })),
    ].map(({ active, ...edge }) => ({
      ...edge,
      type: "obstacle",
      data: {
        active,
        path: referenceCareerPath(
          careerNodes.find((node) => node.id === edge.source)!,
          careerNodes.find((node) => node.id === edge.target)!,
          careerNodes,
        ),
      },
      animated: active,
      style: {
        stroke: strategyColors[path.id] ?? path.color,
        strokeWidth: active ? 2.5 : 1.3,
        filter: active ? `drop-shadow(0 0 2px ${path.color})` : undefined,
        opacity: selectedId && !active ? 0.5 : 0.9,
      },
    }))
  })
}
