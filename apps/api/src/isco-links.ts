import { roleLibrary } from "@voxian/shared"
import onetIsco from "../data/onet-isco.json" with { type: "json" }
import iscoTasks from "../data/isco-tasks.json" with { type: "json" }

export type IscoLink = { isco: string; iscoTitle: string; via: string; match: string }
const units = iscoTasks as Record<string, { title: string; tasks: unknown[] }>

// The 27 library roles are ILO-based, so their own ISCO code beats the ESCO crosswalk.
// Multi-code roles (e.g. 3322/2434) use the first code that has ILO task data.
const libraryLinks = Object.fromEntries(
  roleLibrary.flatMap((role) => {
    const isco = role.isco.split("/").find((code) => units[code]?.tasks.length)
    return role.occupationCode && isco
      ? [
          [
            role.occupationCode,
            {
              isco,
              iscoTitle: units[isco]!.title,
              via: role.title,
              match: "roleLibrary",
            },
          ],
        ]
      : []
  }),
)
export const iscoLinks: Record<string, IscoLink> = { ...onetIsco, ...libraryLinks }
