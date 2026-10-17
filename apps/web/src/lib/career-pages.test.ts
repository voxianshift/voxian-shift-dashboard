import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, test, vi } from "vite-plus/test"
import { emptyProfile, navigatorContext, type NavigatorResult } from "@voxian/shared"
import InsightsPage from "../app/(dashboard)/insights/page"
import RoadmapPage from "../app/(dashboard)/roadmap/page"
import CanvasPage from "../app/(dashboard)/roadmap/canvas/page"
import { SidebarProvider } from "../components/ui/sidebar"
import { navigatorFixture } from "./navigator.fixture"

const state = vi.hoisted(() => ({
  query: "",
  profile: {} as typeof emptyProfile,
  data: undefined as NavigatorResult | undefined,
  status: "ready",
}))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(state.query) }))
vi.mock("@/components/career-profile-provider", () => ({
  useCareerProfile: () => ({ profile: state.profile, ready: true }),
}))
vi.mock("@/components/navigator-provider", () => ({
  useNavigator: () => ({
    data: state.data,
    status: state.status,
    profileKey: JSON.stringify(state.profile),
    error: "Paths unavailable",
    retry: () => {},
  }),
}))
beforeEach(() => {
  state.query = ""
  state.status = "ready"
  state.data = navigatorFixture
  state.profile = {
    ...emptyProfile,
    primaryOccupation: "15-1252.00",
    occupations: ["15-1252.00"],
    occupationNames: { "15-1252.00": "Software Developers" },
    hours: "1–2 hours",
    strengths: ["Solving problems"],
  }
})

test("Curve separates global evidence from conceptual scenarios", () => {
  const html = renderToStaticMarkup(createElement(InsightsPage))
  expect(html).toContain("Your perspective: Software Developers")
  expect(html).toContain("All lines are conceptual")
  expect(html).toContain("not a measured forecast or probability")
  expect(html).toContain("https://www.ilo.org/")
})

for (const path of navigatorFixture.paths) {
  test(`${path.id} plan uses actual profile paths and selected role`, () => {
    state.query = `path=${path.id}&role=1`
    const html = renderToStaticMarkup(createElement(RoadmapPage))
    expect(html).toContain("Software Developers")
    expect(html).toContain(path.title.replaceAll("&", "&amp;"))
    expect(html).toContain(path.why)
    expect(html).toContain(`${path.id}&amp;role=1`)
    expect(html).not.toContain("Customer Support Specialist")
    expect(html).not.toContain("sample path")
    expect(html).not.toContain('data-slot="selection-beam"')
    expect(html.match(/data-slot="flowing-connection"/g)).toHaveLength(1)
  })
}

test("unknown path falls back to profile recommendation", () => {
  state.query = "path=unknown&role=anything"
  const html = renderToStaticMarkup(createElement(RoadmapPage))
  expect(html).toContain(
    `<h2 class="mt-[5px] text-[24px] tracking-[-0.8px]">Developer Tooling &amp; Automation</h2>`,
  )
  expect(html).not.toContain("Customer Support Specialist")
})

test("canvas uses same profile path and preserves selected role in plan link", () => {
  state.query = "path=quality&role=1"
  const html = renderToStaticMarkup(createElement(SidebarProvider, null, createElement(CanvasPage)))
  expect(html).not.toContain("Profile-based directions")
  expect(html).not.toContain(navigatorFixture.summary)
  expect(html).toContain("Software Quality &amp; AI Evaluation Analyst")
  expect(html).toContain("/roadmap?path=quality&amp;role=1")
  expect(html).toContain("Why this fits your profile")
  expect(html).not.toContain("CUSTOMER SUPPORT")
})

for (const status of ["missing", "loading", "error"]) {
  test(`${status} profile never receives a sample Navigator`, () => {
    state.status = status
    state.data = undefined
    const html = renderToStaticMarkup(createElement(RoadmapPage))
    expect(html).not.toContain("Customer Support Specialist")
    expect(html).not.toContain("Generate my plan")
    expect(html).toContain(
      status === "missing"
        ? "Set up my profile"
        : status === "error"
          ? "Retry career paths"
          : "Preparing directions",
    )
  })
}

test("profile context includes optional constraints but excludes display identity", () => {
  const context = navigatorContext({
    ...state.profile,
    preferredName: "Private name",
    risk: "Prefer small changes",
    goals: ["Stability"],
    anxieties: "Limited free time",
  })
  expect(context).toMatchObject({
    risk: "Prefer small changes",
    goals: ["Stability"],
    anxieties: "Limited free time",
    primaryOccupation: "15-1252.00",
  })
  expect(context).not.toHaveProperty("preferredName")
  expect(context).not.toHaveProperty("occupationNames")
  expect(JSON.stringify(context)).not.toBe(JSON.stringify(navigatorContext(state.profile)))
})
