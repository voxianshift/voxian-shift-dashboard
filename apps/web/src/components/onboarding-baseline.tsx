"use client"

import type { OccupationMatch } from "@voxian/shared"
import { Check } from "lucide-react"
import { useIscoMeter } from "@/hooks/use-isco-meter"

const exposureColors: Record<string, string> = {
  "Not Exposed": "text-emerald-700 dark:text-emerald-400",
  "Minimal Exposure": "text-emerald-700 dark:text-emerald-400",
  "Exposed: Gradient 1": "text-emerald-700 dark:text-emerald-400",
  "Exposed: Gradient 2": "text-yellow-700 dark:text-yellow-400",
  "Exposed: Gradient 3": "text-orange-700 dark:text-orange-400",
  "Exposed: Gradient 4": "text-red-700 dark:text-red-400",
}

export function OnboardingBaseline({
  role,
  selected,
  onSelect,
}: {
  role: OccupationMatch
  selected: boolean
  onSelect: () => void
}) {
  const meter = useIscoMeter(role.code, role.title, true)
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-5 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${selected ? "border-mauve-deep bg-mauve-tint-soft dark:border-white dark:bg-white/5" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-lg font-semibold">{role.title}</span>
          {role.match !== undefined && (
            <span
              className="text-xs text-muted-foreground"
              title="Title and task relevance, not a probability"
            >
              {role.match}% match
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {!meter ? (
            <span role="status">Loading ILO baseline…</span>
          ) : meter === "missing" ? (
            "ILO baseline unavailable"
          ) : (
            <>
              ISCO-{meter.isco} ·{" "}
              <span
                className={`font-medium ${exposureColors[meter.gradient] ?? "text-foreground"}`}
              >
                {meter.gradient.replace(/^Exposed: Gradient ([1-4])$/, "G$1")}
              </span>
              {meter.crosswalkMatch === "ai" && (
                <span className="ml-2 text-xs">AI-assisted mapping</span>
              )}
            </>
          )}
        </span>
      </span>
      {selected && (
        <Check aria-hidden="true" className="size-5 shrink-0 text-mauve-deep dark:text-white" />
      )}
    </button>
  )
}
