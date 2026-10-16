export const SCORING_VERSION = "1"

export interface TaskInput {
  /** Relative importance; normalized so all weights sum to 1. */
  weight: number
  /** GenAI exposure, 0..1. */
  exposure: number
}

/** E = 100 * sum(w_i * e_i), weights normalized. Full precision; round only for display. */
export function computeExposure(tasks: readonly TaskInput[]): number {
  if (tasks.length === 0) throw new Error("No tasks")
  let total = 0
  for (const t of tasks) {
    if (!Number.isFinite(t.weight) || t.weight < 0) throw new Error("Invalid weight")
    if (!Number.isFinite(t.exposure) || t.exposure < 0 || t.exposure > 1)
      throw new Error("Invalid exposure")
    total += t.weight
  }
  if (total === 0) throw new Error("All weights are zero")
  return (100 * tasks.reduce((sum, t) => sum + t.weight * t.exposure, 0)) / total
}

// ILO Working Paper 140 (2025), Table 5: exposure gradient from the mean (μ) and
// standard deviation (σ) of an occupation's task-level exposure scores.
export type IloGradient = "G4" | "G3" | "G2" | "G1" | "Minimal" | "Not exposed"

export function taskStats(exposures: readonly number[]) {
  if (!exposures.length) throw new Error("No tasks")
  const mean = exposures.reduce((a, b) => a + b, 0) / exposures.length
  const sd = Math.sqrt(exposures.reduce((a, b) => a + (b - mean) ** 2, 0) / exposures.length)
  return { mean, sd }
}

export function iloGradient(mean: number, sd: number): IloGradient {
  if (mean >= 0.6 && mean - sd >= 0.5) return "G4"
  if (mean >= 0.5 && mean < 0.6 && mean + sd >= 0.5) return "G3"
  if (mean >= 0.4 && mean < 0.5 && mean + sd >= 0.5) return "G2"
  if (mean < 0.4 && mean + sd >= 0.5) return "G1"
  if (mean < 0.5 && mean + sd > 0.4) return "Minimal"
  return "Not exposed"
}

// ILO's own labels and interpretations (WP140, Table 5)
export const ILO_GRADIENTS: Record<IloGradient, { label: string; meaning: string }> = {
  G4: {
    label: "Highest exposure",
    meaning:
      "High and consistent GenAI exposure across tasks. Most current tasks have a high potential of automation, with little variability.",
  },
  G3: {
    label: "Significant exposure",
    meaning:
      "Above-moderate exposure: even though some tasks remain less exposed, the potential to automate current tasks with GenAI is growing.",
  },
  G2: {
    label: "Moderate exposure",
    meaning:
      "A mix of tasks exposed to GenAI and others not at risk, so the impact is uneven across the role.",
  },
  G1: {
    label: "Low exposure, high task variability",
    meaning:
      "Low exposure overall, but some tasks have elevated automation potential while the role still relies on low-exposure tasks.",
  },
  Minimal: {
    label: "Minimal exposure",
    meaning: "Some tasks show moderate automation potential, but overall exposure stays limited.",
  },
  "Not exposed": {
    label: "Not exposed",
    meaning: "Most tasks remain relatively unaffected by GenAI.",
  },
}
