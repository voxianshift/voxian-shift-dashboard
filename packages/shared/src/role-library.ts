import data from "./role-library.json" with { type: "json" }
import type { OccupationMatch } from "./occupations.ts"

export type LibraryRole = (typeof data.roles)[number]
/** The 27 display roles from the prototype. ISCO-08 codes follow ILO WP140, not the O*NET crosswalk. */
export const roleLibrary: LibraryRole[] = data.roles
export const roleLibrarySource = data.source

/** Library role for an O*NET code, so ILO data uses the role's own ISCO code. */
export function libraryRoleFor(occupationCode: string) {
  return roleLibrary.find((role) => role.occupationCode === occupationCode)
}

/** Prototype keyword scoring: whole keyword hits count 2, single-word overlaps 1, title hits 5. */
export function matchRoles(text: string, limit = 3) {
  const query = text.trim().toLowerCase()
  if (!query) return []
  const words = query.split(/\s+/)
  return roleLibrary
    .map((role) => {
      const title = role.title.toLowerCase()
      let score = title.includes(query) ? 5 : 0
      for (const keyword of role.keywords)
        if (query.includes(keyword) || keyword.includes(query)) score += 2
        else if (
          keyword
            .split(" ")
            .some((word) => query.includes(word) || words.some((w) => word.includes(w)))
        )
          score += 1
      return { role, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.role)
}

/** A library role in the occupation-match shape the profile and API already use. */
export function libraryMatch(role: LibraryRole): OccupationMatch | null {
  if (!role.occupationCode) return null
  return {
    code: role.occupationCode,
    title: role.title,
    description: `ILO WP140 · ISCO-08 ${role.isco} · ${role.gradient}`,
    category: `ISCO-08 ${role.isco}`,
    sourceVersion: "v2.4.1",
    baselineId: null,
    reason: "Voxian Shift role library",
  }
}
