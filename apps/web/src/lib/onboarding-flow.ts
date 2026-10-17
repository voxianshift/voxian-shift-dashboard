import {
  hasAnswer,
  hasMeterInputs,
  hasScheduleAnswers,
  type CareerProfile,
  type ProfileField,
} from "./onboarding"

export const onboardingSteps: { title: string; description: string; fields: ProfileField[] }[] = [
  {
    title: "About you",
    description: "Let’s start with what we should call you.",
    fields: ["preferredName"],
  },
  {
    title: "Your work",
    description: "Search your current job title, or upload your CV to find matching roles.",
    fields: ["currentWork"],
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
    description: "Your strengths and adaptation bandwidth help shape a path that fits.",
    fields: ["strengths", "direction", "hours", "flexibility"],
  },
  {
    title: "Time Horizon & Risk Appetite",
    description: "Set your adaptation window and the amount of change that feels manageable.",
    fields: ["timeline", "risk"],
  },
  {
    title: "Career North Star & Anxieties",
    description: "Share what you want to move towards and any concerns along the way.",
    fields: ["goals", "anxieties"],
  },
]

export function canAdvanceOnboarding(index: number, profile: CareerProfile) {
  if (index === 1) return profile.currentWork.trim().length >= 2
  if (index === 2) return hasMeterInputs(profile)
  if (index === 3) return hasAnswer(profile, "taskFocus")
  if (index === 4) return hasAnswer(profile, "hours")
  if (index === 5) return hasAnswer(profile, "timeline")
  if (index === 6)
    return hasMeterInputs(profile) && hasScheduleAnswers(profile) && hasAnswer(profile, "taskFocus")
  return index === 0
}
