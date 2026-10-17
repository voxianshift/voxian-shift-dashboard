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
export const pathIdSchema = z.enum(["advocate", "operations", "quality"])
const text = (max: number) => z.string().trim().min(1).max(max)
const pathFields = {
  id: pathIdSchema,
  title: text(100),
  focus: text(80),
  description: text(500),
  why: text(350),
  skills: z.array(text(100)).min(3).max(5),
  roles: z
    .array(text(120))
    .length(3)
    .refine((roles) => new Set(roles.map((role) => role.toLowerCase())).size === 3),
  project: text(500),
  firstStep: text(300),
}
const resourceIdSchema = z.enum(
  Object.keys(navigatorResources) as [
    keyof typeof navigatorResources,
    ...(keyof typeof navigatorResources)[],
  ],
)
export const navigatorDraftSchema = z
  .object({
    summary: text(500),
    recommendedPathId: pathIdSchema,
    paths: z
      .array(
        z.object({
          ...pathFields,
          resourceIds: z.array(resourceIdSchema).min(1).max(3),
          // One list per role, in the same order as `roles`.
          roleResourceIds: z.array(z.array(resourceIdSchema).min(1).max(3)).length(3),
        }),
      )
      .length(3),
  })
  .refine((data) => new Set(data.paths.map((path) => path.id)).size === 3)
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
export const careerPathSchema = z.object({
  ...pathFields,
  color: z.string().max(40),
  resources: z.array(resourceSchema).min(1).max(3),
  roleResources: z.array(z.array(resourceSchema).min(1).max(3)).length(3),
})
export const navigatorResultSchema = z
  .object({
    roleTitle: text(200),
    occupationCode: occupationCodeSchema,
    summary: text(500),
    recommendedPathId: pathIdSchema,
    provider: text(80),
    paths: z.array(careerPathSchema).length(3),
  })
  .refine((data) => new Set(data.paths.map((path) => path.id)).size === 3)
export type CareerPath = z.infer<typeof careerPathSchema>
export type NavigatorResult = z.infer<typeof navigatorResultSchema>

export type CourseResource = CareerPath["resources"][number]
type ResourceId = keyof typeof navigatorResources
// Reviewed courses per direction, most valuable first; guarantees every plan lists at least five.
export const pathCourseIds: Record<CareerPath["id"], ResourceId[]> = {
  advocate: ["techWriting", "hubspot", "contentMarketing", "crm", "elementsOfAi", "aiEssentials"],
  operations: [
    "automate",
    "projectManagement",
    "powerPlatform",
    "sre",
    "cloudPractitioner",
    "learn",
  ],
  quality: ["istqb", "nist", "aigp", "dataAnalytics", "kaggle", "ml"],
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
