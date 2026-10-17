import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vite-plus/test"
import { emptyProfile, type CareerProfile } from "@voxian/shared"
import { TooltipProvider } from "@/components/ui/tooltip"
import HomePage from "../app/(dashboard)/home/page"

const state = vi.hoisted(() => ({ profile: {} as CareerProfile }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }))
vi.mock("@/components/profile-sheet", () => ({ ProfileSheet: () => null }))
vi.mock("@/components/career-profile-provider", () => ({
  useCareerProfile: () => ({
    profile: state.profile,
    ready: true,
    storageAvailable: true,
  }),
}))

function render() {
  return renderToStaticMarkup(createElement(TooltipProvider, { children: createElement(HomePage) }))
}

test("new Home has one role intake and cannot continue with a description alone", () => {
  state.profile = { ...emptyProfile, currentWork: "Software developer" }
  const html = render()
  expect(html).toContain('aria-label="Reset profile"')
  expect(html).toContain("Search your job title or duties")
  expect(html).toContain('aria-label="Clear job title search"')
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Confirm role/)
  expect(html).not.toContain("AI Chat")
  expect(html).not.toContain("Questionnaire")
  expect(html).not.toContain("Your role is recognised.")
})

test("multiple roles without a main role remain in intake", () => {
  state.profile = {
    ...emptyProfile,
    occupations: ["15-1252.00", "43-4051.00"],
    occupationNames: {
      "15-1252.00": "Software Developers",
      "43-4051.00": "Customer Service Representatives",
    },
  }
  const html = render()
  expect(html).toContain("Which role takes most of your time?")
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Confirm role/)
  expect(html).not.toContain("Continue to my Meter")
})

test("saved catalogue role opens returning Home without optional planning answers", () => {
  state.profile = {
    ...emptyProfile,
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    occupationNames: { "15-1252.00": "Software Developers" },
  }
  const html = render()
  expect(html).toContain("Software Developers")
  expect(html).toContain('aria-label="Reset profile"')
  expect(html).toContain("Continue to my Meter")
  expect(html).toContain("Edit preferences")
  expect(html).not.toContain("Search your job title or duties")
  expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Continue to my Meter/)
})
