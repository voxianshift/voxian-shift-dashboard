import { z } from "zod"
import { profileSchema, type CareerProfile } from "./onboarding.ts"
import { occupationCode, occupationCodeSchema } from "./occupations.ts"

export const navigatorContextSchema = profileSchema.omit({
  preferredName: true,
  occupationNames: true,
})
export function navigatorContext(profile: CareerProfile) {
  const context = navigatorContextSchema.strip().parse(profile)
  return {
    ...context,
    occupations: context.occupations.map(occupationCode),
    primaryOccupation: occupationCode(context.primaryOccupation),
  }
}

// Provider chooses IDs; URLs and credential labels always come from this reviewed list.
export const navigatorResources = {
  hubspot: {
    title: "Service Hub Software Certification",
    provider: "HubSpot Academy",
    type: "Certification",
    note: "Service workflows, feedback and reporting. Check software access requirements for practical exercises.",
    href: "https://academy.hubspot.com/courses/hubspot-service-software",
    cost: "Free",
  },
  crm: {
    title: "Salesforce CRM Basics",
    provider: "Salesforce Trailhead",
    type: "Learning module",
    note: "Learn customer relationship systems. A learning badge is not a professional certification.",
    href: "https://trailhead.salesforce.com/content/learn/modules/lex_implementation_basics/lex_implementation_basics_welcome",
    cost: "Free",
  },
  automate: {
    title: "Get started with Power Automate",
    provider: "Microsoft Learn",
    type: "Learning module",
    note: "Basic workflows. Exercises require Power Automate and a work or school OneDrive account.",
    href: "https://learn.microsoft.com/en-us/training/modules/get-started-flows/",
    cost: "Free",
  },
  aigp: {
    title: "Artificial Intelligence Governance Professional (AIGP)",
    provider: "IAPP",
    type: "Certification",
    note: "Professional exam. Review current fees, eligibility and maintenance requirements.",
    href: "https://iapp.org/certify/aigp",
    cost: "Paid",
  },
  governance: {
    title: "AIGP training",
    provider: "IAPP",
    type: "Course",
    note: "Governance training. Training and certification are separate; check current fees.",
    href: "https://www.iapp.org/train/aigp-training",
    cost: "Paid",
  },
  nist: {
    title: "AI Risk Management Framework",
    provider: "NIST",
    type: "Reference",
    note: "Framework for AI evaluation and risk management. No certification is awarded.",
    href: "https://www.nist.gov/itl/ai-risk-management-framework",
    cost: "Free",
  },
  web: {
    title: "Learn web development",
    provider: "MDN",
    type: "Learning programme",
    note: "Frontend development tutorials and practice. Not a professional certification.",
    href: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    cost: "Free",
  },
  ml: {
    title: "Machine Learning Crash Course",
    provider: "Google for Developers",
    type: "Course",
    note: "Machine learning concepts and exercises. Check prerequisites before starting.",
    href: "https://developers.google.com/machine-learning/crash-course",
    cost: "Free",
  },
  learn: {
    title: "Microsoft Learn training catalogue",
    provider: "Microsoft Learn",
    type: "Course catalogue",
    note: "Browse role-specific learning paths. Course completion and certification are separate.",
    href: "https://learn.microsoft.com/en-us/training/",
    cost: "Free",
  },
  techWriting: {
    title: "Technical Writing One and Two",
    provider: "Google for Developers",
    type: "Course",
    note: "Self-paced courses on clear technical documentation. No certificate is awarded.",
    href: "https://developers.google.com/tech-writing",
    cost: "Free",
  },
  contentMarketing: {
    title: "Content Marketing Certification",
    provider: "HubSpot Academy",
    type: "Certification",
    note: "Storytelling, content planning and promotion for explaining expertise to an audience.",
    href: "https://academy.hubspot.com/courses/content-marketing",
    cost: "Free",
  },
  elementsOfAi: {
    title: "Elements of AI",
    provider: "University of Helsinki and MinnaLearn",
    type: "Course",
    note: "Plain-language introduction to what AI can and cannot do. No programming needed.",
    href: "https://www.elementsofai.com/",
    cost: "Free",
  },
  aiEssentials: {
    title: "Google AI Essentials",
    provider: "Google",
    type: "Course",
    note: "Practical use of generative AI tools at work. Delivered through a paid course platform; check current pricing and aid.",
    href: "https://grow.google/ai-essentials/",
    cost: "Paid",
  },
  projectManagement: {
    title: "Google Project Management Professional Certificate",
    provider: "Coursera",
    type: "Professional certificate",
    note: "Project planning, risk and stakeholder management. Subscription required; check current fees and aid.",
    href: "https://www.coursera.org/professional-certificates/google-project-management",
    cost: "Paid",
  },
  powerPlatform: {
    title: "Microsoft Power Platform Fundamentals (PL-900)",
    provider: "Microsoft",
    type: "Certification",
    note: "Entry exam for low-code apps and automation. Free learning paths; the exam has a fee.",
    href: "https://learn.microsoft.com/en-us/credentials/certifications/power-platform-fundamentals/",
    cost: "Paid",
  },
  cloudPractitioner: {
    title: "AWS Certified Cloud Practitioner",
    provider: "Amazon Web Services",
    type: "Certification",
    note: "Foundational cloud concepts for people who work alongside technical teams. Exam fee applies.",
    href: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    cost: "Paid",
  },
  sre: {
    title: "Site Reliability Engineering",
    provider: "Google",
    type: "Reference",
    note: "Free online book on running reliable systems and workflows. No certification is awarded.",
    href: "https://sre.google/sre-book/table-of-contents/",
    cost: "Free",
  },
  istqb: {
    title: "ISTQB Certified Tester Foundation Level (CTFL)",
    provider: "ISTQB",
    type: "Certification",
    note: "Widely recognised testing certification. Exam fees vary by country and exam provider.",
    href: "https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/",
    cost: "Paid",
  },
  dataAnalytics: {
    title: "Google Data Analytics Professional Certificate",
    provider: "Coursera",
    type: "Professional certificate",
    note: "Spreadsheets, SQL and data checks for evidence-based quality work. Subscription required.",
    href: "https://www.coursera.org/professional-certificates/google-data-analytics",
    cost: "Paid",
  },
  kaggle: {
    title: "Kaggle Learn",
    provider: "Kaggle",
    type: "Learning programme",
    note: "Short hands-on lessons in data and model evaluation. Completion badges are not certifications.",
    href: "https://www.kaggle.com/learn",
    cost: "Free",
  },
} as const
export const NAVIGATOR_CONTRACT_VERSION = 3
export const NAVIGATOR_RULE_VERSION = 2
export const pathIdSchema = z.enum(["automate", "hybrid", "pivot", "create"])
export type StrategyId = z.infer<typeof pathIdSchema>
export const navigatorStrategies = {
  automate: {
    label: "Automate",
    meaning: "Improve current work through automation with human review.",
    colorToken: "chart-3",
  },
  hybrid: {
    label: "Hybrid",
    meaning: "Combine domain expertise with AI assistance and human judgment.",
    colorToken: "tertiary",
  },
  pivot: {
    label: "Pivot",
    meaning: "Validate adjacent work using transferable skills.",
    colorToken: "warning",
  },
  create: {
    label: "Create",
    meaning:
      "Explore emerging responsibilities and new forms of value, including governance and ethics.",
    colorToken: "success",
  },
} as const
export const movementPreferenceSchema = z.enum([
  "stay",
  "grow",
  "change",
  "explore",
  "create",
  "unknown",
])
export const recommendationSchema = z.object({
  strategyId: pathIdSchema.nullable(),
  reasonCode: z.enum([
    "missing_occupation",
    "explicit_strategy",
    "explicit_direction",
    "insufficient_preferences",
  ]),
  explanation: z.string().min(1).max(350),
})
export function recommendStrategy(input: {
  occupationResolved: boolean
  selectedStrategyId?: StrategyId
  movementPreference?: z.infer<typeof movementPreferenceSchema>
}): z.infer<typeof recommendationSchema> {
  if (!input.occupationResolved)
    return {
      strategyId: null,
      reasonCode: "missing_occupation",
      explanation: "Confirm your occupation before choosing a starting option.",
    }
  if (input.selectedStrategyId)
    return {
      strategyId: input.selectedStrategyId,
      reasonCode: "explicit_strategy",
      explanation: "This is the strategy you explicitly selected.",
    }
  return {
    strategyId: null,
    reasonCode: "insufficient_preferences",
    explanation:
      "Explore reviewed pathways; career movement preferences alone do not establish strategy suitability.",
  }
}
const text = (max: number) => z.string().trim().min(1).max(max)
const pathFields = {
  id: pathIdSchema,
  focus: text(80),
  description: text(500),
  why: text(350),
  humanEdge: text(500),
  tradeoff: text(500),
  skills: z.array(text(100)).min(3).max(5),
  project: text(500),
  firstStep: text(300),
}
export const resourceIdSchema = z.enum(
  Object.keys(navigatorResources) as [
    keyof typeof navigatorResources,
    ...(keyof typeof navigatorResources)[],
  ],
)
export const navigatorDraftSchema = z
  .object({
    summary: text(500),
    paths: z
      .array(
        z.object({
          ...pathFields,
          resourceIds: z.array(resourceIdSchema).min(1).max(3),
          destinationIds: z.array(text(100)).max(3),
          destinationResources: z
            .array(
              z.object({ destinationId: text(100), resourceIds: z.array(resourceIdSchema).max(3) }),
            )
            .max(3)
            .default([]),
        }),
      )
      .length(4),
  })
  .refine((data) => new Set(data.paths.map((path) => path.id)).size === 4)
const resourceSchema = z
  .object({
    title: text(180),
    provider: text(100),
    type: text(60),
    note: text(350),
    href: z.string().url(),
    cost: z.enum(["Free", "Paid"]),
  })
  .refine((resource) =>
    Object.values(navigatorResources).some((known) => known.href === resource.href),
  )
export const careerPathSchema = z
  .object({
    ...pathFields,
    title: text(100),
    coverage: z.enum(["available", "unsupported"]),
    mappingVersion: text(80),
    mappingSource: text(200),
    mappingRationale: text(500),
    destinations: z
      .array(
        z.object({
          id: text(100),
          title: text(120),
          kind: z.literal("curated_pathway"),
          occupationCode: z.null(),
        }),
      )
      .max(3),
    roles: z.array(text(120)).max(3),
    label: z.string().min(1).max(20),
    colorToken: z.enum(["chart-3", "tertiary", "warning", "success"]),
    color: z.string().max(40),
    resources: z.array(resourceSchema).min(1).max(3),
    roleResources: z.array(z.array(resourceSchema).max(3)).max(3),
  })
  .refine((path) => {
    const metadata = navigatorStrategies[path.id]
    return (
      path.destinations.length === path.roles.length &&
      path.roleResources.length === path.roles.length &&
      new Set(path.destinations.map((role) => role.id)).size === path.destinations.length &&
      path.destinations.every((role, index) => role.title === path.roles[index]) &&
      (path.coverage === "available"
        ? path.destinations.length > 0
        : path.destinations.length === 0) &&
      path.label === metadata.label &&
      path.colorToken === metadata.colorToken &&
      path.color === `var(--${metadata.colorToken})`
    )
  }, "Strategy metadata must match its stable ID")
export const navigatorResultSchema = z
  .object({
    roleTitle: text(200),
    occupationCode: occupationCodeSchema,
    summary: text(500),
    contractVersion: z.literal(NAVIGATOR_CONTRACT_VERSION),
    ruleVersion: z.literal(NAVIGATOR_RULE_VERSION),
    recommendation: recommendationSchema,
    recommendedPathId: pathIdSchema.nullable(),
    provider: text(80),
    generationStatus: z.enum(["personalized", "reviewed_only", "unavailable"]),
    paths: z.array(careerPathSchema).length(4),
  })
  .refine(
    (data) => pathIdSchema.options.every((id, index) => data.paths[index]?.id === id),
    "Strategies must use canonical order",
  )
  .refine(
    (data) => data.recommendedPathId === data.recommendation.strategyId,
    "Recommendation IDs must agree",
  )
export type CareerPath = z.infer<typeof careerPathSchema>
export type NavigatorResult = z.infer<typeof navigatorResultSchema>

export type CourseResource = CareerPath["resources"][number]
type ResourceId = keyof typeof navigatorResources
// Reviewed courses per direction, most valuable first; guarantees every plan lists at least five.
export const pathCourseIds: Record<CareerPath["id"], ResourceId[]> = {
  hybrid: ["techWriting", "hubspot", "crm", "elementsOfAi", "aiEssentials", "learn"],
  automate: ["automate", "projectManagement", "powerPlatform", "sre", "cloudPractitioner", "learn"],
  pivot: ["learn", "projectManagement", "dataAnalytics", "kaggle", "crm", "elementsOfAi"],
  create: ["web", "contentMarketing", "techWriting", "projectManagement", "elementsOfAi", "learn"],
}
/** Must-have picks for this person first, then role-specific picks, then the curated list. */
export function courseList(path: CareerPath, roleIndex: number | null) {
  const mustHave = new Set(path.resources.map((resource) => resource.href))
  const forRole = roleIndex === null ? [] : (path.roleResources[roleIndex] ?? [])
  const seen = new Set<string>()
  return [
    ...path.resources,
    ...forRole,
    ...pathCourseIds[path.id].map((id) => navigatorResources[id]),
  ]
    .filter((resource) => !seen.has(resource.href) && !!seen.add(resource.href))
    .map((resource) => ({
      ...resource,
      mustHave: mustHave.has(resource.href),
      forRole: !mustHave.has(resource.href) && forRole.some((pick) => pick.href === resource.href),
    }))
}
