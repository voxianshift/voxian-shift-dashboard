import { readdirSync, readFileSync } from "node:fs"
import { z } from "zod"
import { pathIdSchema, occupationCodeSchema, type StrategyId } from "@voxian/shared"
import families from "../data/navigator-families.json" with { type: "json" }
import data from "../data/navigator-pathways.json" with { type: "json" }

const pathwaySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  humanEdge: z.string().min(1).max(500),
  skills: z.array(z.string().min(1).max(100)).min(3).max(5),
  firstStep: z.string().min(1).max(300),
  destinations: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        title: z.string().min(1).max(120),
        kind: z.literal("curated_pathway"),
        occupationCode: z.null(),
      }),
    )
    .min(1),
})
const occupationsSchema = z.record(
  occupationCodeSchema,
  z.object({
    prototypeRole: z.string(),
    strategies: z.partialRecord(pathIdSchema, pathwaySchema),
  }),
)
const catalogue = z
  .object({
    version: z.string(),
    source: z.string(),
    reviewNotes: z.string(),
    occupations: occupationsSchema,
  })
  .parse(data)
// Per-SOC-group curated files (data/pathways/soc-XX.json) extend the base catalogue in a compact
// form; the first option names the strategy and IDs follow `${role}-${strategy}-${n}`.
const groupSchema = z.object({
  source: z.string(),
  occupations: z.record(
    occupationCodeSchema,
    z.object({
      role: z.string().regex(/^[a-z0-9_]+$/),
      strategies: z.record(
        pathIdSchema,
        z.object({
          description: z.string(),
          humanEdge: z.string(),
          skills: z.array(z.string()).length(3),
          options: z.array(z.string()).min(4).max(8),
        }),
      ),
    }),
  ),
})
const firstSteps = {
  default:
    "Review one example of your current work against these skills before choosing a learning project.",
  create:
    "Describe one customer problem, define a small owned offer, and ask one potential customer for feedback before building.",
}
const groupDir = new URL("../data/pathways/", import.meta.url)
for (const file of readdirSync(groupDir)
  .filter((name) => name.endsWith(".json"))
  .sort()) {
  const group = groupSchema.parse(JSON.parse(readFileSync(new URL(file, groupDir), "utf8")))
  for (const [code, { role, strategies }] of Object.entries(group.occupations)) {
    if (catalogue.occupations[code]) throw new Error(`Duplicate pathway mapping ${code} in ${file}`)
    catalogue.occupations[code] = occupationsSchema.valueType.parse({
      prototypeRole: role,
      strategies: Object.fromEntries(
        Object.entries(strategies).map(([id, path]) => [
          id,
          {
            title: path.options[0],
            description: path.description,
            humanEdge: path.humanEdge,
            skills:
              id === "create"
                ? [...path.skills, "Customer Discovery", "Offer Design"]
                : path.skills,
            firstStep: id === "create" ? firstSteps.create : firstSteps.default,
            destinations: path.options.map((title, index) => ({
              id: `${role}-${id}-${index + 1}`,
              title,
              kind: "curated_pathway",
              occupationCode: null,
            })),
          },
        ]),
      ),
    })
  }
}
export const curatedOccupationCodes = Object.keys(catalogue.occupations)

export const pathwayVersion = `${catalogue.version}+${curatedOccupationCodes.length}-curated+${families.version}`
export const pathwaySource = catalogue.source
export function lookupPathways(occupationCode: string) {
  if (!occupationCodeSchema.safeParse(occupationCode).success) return {}
  const familyCode = occupationCode.slice(0, 2)
  const family = families.families[familyCode as keyof typeof families.families]
  const exact = catalogue.occupations[occupationCode]?.strategies ?? {}
  if (!family) return exact
  const fallback = Object.fromEntries(
    pathIdSchema.options.map((id) => {
      const template = families.strategies[id]
      return [
        id,
        {
          title: `${family} · ${template.title}`,
          description: template.description,
          humanEdge: template.humanEdge,
          skills: template.skills,
          firstStep: template.firstStep,
          destinations: template.options.map((option, index) => ({
            id: `family-${occupationCode}-${id}-${index + 1}`,
            title: `${family} · ${option}`,
            kind: "curated_pathway",
            occupationCode: null,
          })),
        },
      ]
    }),
  )
  return z.partialRecord(pathIdSchema, pathwaySchema).parse({ ...fallback, ...exact })
}
export function pathwayLevel(occupationCode: string, strategy: StrategyId) {
  return catalogue.occupations[occupationCode]?.strategies[strategy] ? "occupation" : "family"
}
export function pathwaySourceFor(occupationCode: string, strategy: StrategyId) {
  return catalogue.occupations[occupationCode]?.strategies[strategy]
    ? pathwaySource
    : families.source
}
export function pathwayRationale(strategy: StrategyId, occupationCode?: string) {
  if (occupationCode && !catalogue.occupations[occupationCode]?.strategies[strategy])
    return "Family-level exploration template, not an occupation-specific destination match. Validate task relevance, prerequisites and permitted scope; lower exposure, transferability and market demand are unverified."
  return {
    automate:
      "Prototype maps this occupation to workflow automation practice; validate technical prerequisites before a transition.",
    hybrid:
      "Prototype maps this occupation to combining domain judgment with AI tools; this is an exploration pathway, not proven career fit.",
    pivot:
      "Prototype proposes adjacent work drawing on domain knowledge; entry requirements and transferability need individual validation.",
    create:
      "Create options turn domain knowledge into an owned practice, service or toolkit; validate customer demand, professional requirements and delivery scope.",
  }[strategy]
}
