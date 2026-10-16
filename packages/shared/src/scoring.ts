export const SCORING_VERSION = "1";

export interface TaskInput {
  /** Relative importance; normalized so all weights sum to 1. */
  weight: number;
  /** GenAI exposure, 0..1. */
  exposure: number;
}

/** E = 100 * sum(w_i * e_i), weights normalized. Full precision; round only for display. */
export function computeExposure(tasks: readonly TaskInput[]): number {
  if (tasks.length === 0) throw new Error("No tasks");
  let total = 0;
  for (const t of tasks) {
    if (!Number.isFinite(t.weight) || t.weight < 0) throw new Error("Invalid weight");
    if (!Number.isFinite(t.exposure) || t.exposure < 0 || t.exposure > 1)
      throw new Error("Invalid exposure");
    total += t.weight;
  }
  if (total === 0) throw new Error("All weights are zero");
  return (100 * tasks.reduce((sum, t) => sum + t.weight * t.exposure, 0)) / total;
}
