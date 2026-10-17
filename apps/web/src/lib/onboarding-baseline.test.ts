import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vite-plus/test"
import { OnboardingBaseline } from "@/components/onboarding-baseline"

const state = vi.hoisted(() => ({ meter: null as unknown }))
vi.mock("@/hooks/use-isco-meter", () => ({ useIscoMeter: () => state.meter }))
const role = {
  code: "15-1252.00",
  title: "Software Developers",
  description: "Long role description",
  category: "Computing",
  sourceVersion: "31.0",
  baselineId: null,
  reason: "Title match",
  match: 90,
} as const
function render(selected = false) {
  return renderToStaticMarkup(
    createElement(OnboardingBaseline, { role, selected, onSelect: () => {} }),
  )
}

test("compact selectable card displays sourced ISCO and gradient without descriptions or task lists", () => {
  for (const gradient of [1, 2, 3, 4]) {
    state.meter = {
      isco: "2512",
      gradient: `Exposed: Gradient ${gradient}`,
      crosswalkMatch: "exactMatch",
    }
    const html = render(true)
    expect(html).toContain(`G${gradient}`)
    expect(html).toContain(`text-${["emerald", "yellow", "orange", "red"][gradient - 1]}-700`)
    expect(html).not.toContain("Gradient")
    expect(html).toContain("2512")
    expect(html).toContain('aria-pressed="true"')
    expect(html).not.toContain(role.description)
    expect(html).toContain("90% match")
    expect(html).not.toContain("<ul")
  }
})

test("non-gradient, loading, missing, and AI mappings remain honest", () => {
  for (const gradient of ["Minimal Exposure", "Not Exposed"]) {
    state.meter = { isco: "2512", gradient, crosswalkMatch: "ai" }
    expect(render()).toContain(gradient)
    expect(render()).toContain("text-emerald-700")
    expect(render()).toContain("AI-assisted mapping")
  }
  state.meter = null
  expect(render()).toContain("Loading ILO baseline")
  state.meter = "missing"
  expect(render()).toContain("ILO baseline unavailable")
  expect(render()).not.toContain("Gradient G")
})
