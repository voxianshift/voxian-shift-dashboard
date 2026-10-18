import {
  hasAnswer,
  hasMeterInputs,
  hasScheduleAnswers,
  type CareerProfile,
  type ProfileField,
} from "./onboarding"

// Five short screens. Strengths, direction, flexibility, risk and goals stay editable in the
// profile but are not asked here, so onboarding stays quick.
export const onboardingSteps: { title: string; description: string; fields: ProfileField[] }[] = [
  {
    title: "Your work",
    description: "Tell us what to call you, then search your job title or upload your CV.",
    fields: ["preferredName", "currentWork"],
  },
  {
    title: "Identify Your Baseline Gravity",
    description:
      "Choose the role that best fits your work. Gradients come from ILO Working Paper 140 (2025), mapped to ISCO-08 occupations.",
    fields: [],
  },
  {
    title: "What defines most of your daily workload?",
    description: "Choose the mix that reflects your day-to-day work.",
    fields: ["taskFocus"],
  },
  {
    title: "Your Moat & Strategic Posture",
    description: "Your weekly time and adaptation window set the pace of your learning plan.",
    fields: ["hours", "timeline"],
  },
  {
    title: "Career North Star & Anxieties",
    description: "Share what you are working towards and what worries you about getting there.",
    fields: ["anxieties"],
  },
]

export function canAdvanceOnboarding(index: number, profile: CareerProfile) {
  if (index === 0) return profile.currentWork.trim().length >= 2
  if (index === 1) return hasMeterInputs(profile)
  if (index === 2) return hasAnswer(profile, "taskFocus")
  if (index === 3) return hasAnswer(profile, "hours") && hasAnswer(profile, "timeline")
  if (index === 4)
    return hasMeterInputs(profile) && hasScheduleAnswers(profile) && hasAnswer(profile, "taskFocus")
  return false
}
