import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vite-plus/test"
import { emptyProfile } from "@voxian/shared"
import MeterPage from "../app/(dashboard)/meter/page"

const state = vi.hoisted(() => ({ profile: {} as typeof emptyProfile, confirmed: false }))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }))
vi.mock("@/components/career-profile-provider", () => ({
  useCareerProfile: () => ({ ...state, ready: true, confirm: () => true }),
}))

test("recognised catalogue roles load the ISCO-based Meter instead of a demo score", () => {
  state.confirmed = false
  state.profile = {
    ...emptyProfile,
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    occupationNames: { "15-1252.00": "Software Developers" },
  }
  const html = renderToStaticMarkup(createElement(MeterPage))
  // ILO scores arrive from /api/occupations/:code/meter after mount; no demo score meanwhile
  expect(html).toContain("Loading your Meter")
  expect(html).not.toContain("data-meter-score")
})
test("confirmed canonical occupation IDs retain existing Meter calculation", () => {
  state.profile = {
    ...emptyProfile,
    occupations: ["43-4051.00"],
    primaryOccupation: "43-4051.00",
    taskFocus: "routine",
  }
  state.confirmed = true
  const html = renderToStaticMarkup(createElement(MeterPage))
  expect(html).toContain("74.8")
  expect(html).toContain("Customer Support Specialist")
  expect(html).toContain("data-meter-score")
})
