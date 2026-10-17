import {
  baselineIdForOccupation,
  profileSchema,
  type CareerProfile,
  type ProfileField,
} from "@voxian/shared"
export {
  profileSchema,
  emptyProfile,
  chatResultSchema,
  chatRequestSchema,
  type CareerProfile,
  type ProfileField,
} from "@voxian/shared"

export const questions = [
  {
    field: "currentWork",
    title: "What work do you do?",
    help: "Search job titles or describe your duties, then confirm the roles that fit. Occupation matching is separate from exposure scoring.",
    options: ["Customer Support Specialist", "Administrative & Executive Assistant"],
  },
  {
    field: "taskFocus",
    title: "What fills most of your working day?",
    help: "This changes the mix of tasks in your example baseline. Choose what sounds closest; it is not a test.",
    options: ["Routine questions & coordination", "Complex problems & exceptions", "A bit of both"],
  },
  {
    field: "goals",
    title: "What would make work better for you?",
    help: "Choose a few priorities, or describe what a good next chapter would look like.",
    options: [
      "More stability",
      "Better pay",
      "Meaningful work",
      "More flexibility",
      "Room to grow",
    ],
  },
  {
    field: "hours",
    title: "How much time could you set aside each week?",
    help: "An estimate is enough. Your plan can change when life does.",
    options: ["Under 1 hour", "1–3 hours", "3–5 hours", "5+ hours", "It varies"],
  },
  {
    field: "preferredName",
    title: "What should we call you?",
    help: "A first name or nickname is enough. You can stay a guest.",
    options: [],
  },
  {
    field: "strengths",
    title: "What do people rely on you for?",
    help: "Think about the help colleagues ask you for. Pick more than one if you like.",
    options: ["Solving problems", "Building trust", "Organising work", "Spotting mistakes"],
  },
  {
    field: "direction",
    title: "What would you like to do next?",
    help: "This helps us suggest a direction. You do not need to commit to changing jobs.",
    options: [
      "Stay and adapt",
      "Grow into a related role",
      "Change careers",
      "Explore possibilities",
    ],
  },
  {
    field: "flexibility",
    title: "What does learning need to fit around?",
    help: "Share only what is useful: an unpredictable schedule, caring responsibilities, or a preference for free resources.",
    options: [
      "Flexible schedule",
      "Short sessions only",
      "Free resources only",
      "Learning on weekends",
    ],
  },
  {
    field: "timeline",
    title: "When would you like to make progress?",
    help: "This is a preference for planning, not a deadline or prediction about your job.",
    options: ["This month", "Next 3 months", "Next 6 months", "No deadline"],
  },
  {
    field: "risk",
    title: "How much change feels manageable?",
    help: "There is no right answer. We use this to keep suggested next steps within your comfort zone.",
    options: [
      "Small steps in my current job",
      "Open to related work",
      "Open to a bigger change",
      "Not sure yet",
    ],
  },
  {
    field: "anxieties",
    title: "Anything you are worried about?",
    help: "Optional. You can get a plan without sharing concerns. Avoid names, workplace secrets, or private financial details.",
    options: [
      "Keeping my income stable",
      "Finding time to learn",
      "Starting over",
      "Not knowing where to start",
    ],
  },
] as const
export type Question = (typeof questions)[number]

export function hasAnswer(profile: CareerProfile, field: ProfileField) {
  if (field === "currentWork") return !!profile.currentWork.trim() || profile.occupations.length > 0
  const value = profile[field]
  return Array.isArray(value)
    ? value.some((item) => item.trim().length > 0)
    : typeof value === "string" && value.trim().length > 0
}

export function nextQuestion(profile: CareerProfile, skipped: string[], detailed = false) {
  return questions
    .slice(0, detailed ? questions.length : 4)
    .find((q) => !hasAnswer(profile, q.field) && !skipped.includes(q.field))
}

export function mergeProfile(profile: CareerProfile, patch: Partial<CareerProfile>): CareerProfile {
  const merged = profileSchema.parse({ ...profile, ...patch })
  merged.occupations = [...new Set(merged.occupations)]
  if (!merged.occupations.includes(merged.primaryOccupation)) {
    merged.primaryOccupation = merged.occupations.length === 1 ? merged.occupations[0]! : ""
  }
  return merged
}

export function hasMeterInputs(profile: CareerProfile) {
  return profile.primaryOccupation !== "" && profile.occupations.includes(profile.primaryOccupation)
}

export function canConfirmProfile(profile: CareerProfile) {
  return hasMeterInputs(profile) && baselineIdForOccupation(profile.primaryOccupation) !== null
}
