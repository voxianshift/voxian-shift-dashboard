import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, test, vi } from "vite-plus/test"
import { LumiMascot } from "./lumi-mascot"
import { LumiActionCard } from "./lumi-action-card"
import { LumiSidebar } from "./lumi-sidebar"
import { LumiChatProvider } from "./lumi-chat-provider"

const state = vi.hoisted(() => ({
  profile: {
    preferredName: "Test User",
    currentWork: "Software Support",
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    occupationNames: { "15-1252.00": "Software Developers" },
    taskFocus: "mixed" as const,
    strengths: [],
    direction: "stay and adapt",
    hours: "3-5 hours",
    flexibility: "flexible",
    timeline: "3 months",
    risk: "medium",
    goals: [],
    anxieties: "",
  },
  update: vi.fn(),
  pathname: "/meter",
}))

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
}))

vi.mock("@/components/career-profile-provider", () => ({
  useCareerProfile: () => ({
    profile: state.profile,
    update: state.update,
  }),
}))

beforeEach(() => {
  state.update.mockClear()
})

test("renders LumiMascot SVG properly", () => {
  const html = renderToStaticMarkup(createElement(LumiMascot, { size: "sm" }))
  expect(html).toContain("lumiBodyGrad")
  expect(html).toContain("VOXIAN")
  expect(html).toContain("<svg")
})

test("renders LumiActionCard with PICK_TARGET_ROLE and triggers profile update", () => {
  const html = renderToStaticMarkup(
    createElement(LumiActionCard, {
      action: {
        type: "PICK_TARGET_ROLE",
        occupationId: "15-1254.00",
        title: "Web Developer",
        explanation: "Good fit based on technical skills",
      },
    }),
  )
  expect(html).toContain("Web Developer")
  expect(html).toContain("15-1254.00")
  expect(html).toContain("Set as Target")
})

test("renders LumiActionCard with NAVIGATE link", () => {
  const html = renderToStaticMarkup(
    createElement(LumiActionCard, {
      action: {
        type: "NAVIGATE",
        href: "/roadmap",
        label: "Go to Roadmap",
      },
    }),
  )
  expect(html).toContain("Go to Roadmap")
  expect(html).toContain('href="/roadmap"')
})

test("renders LumiSidebar empty state with starter questions", () => {
  const html = renderToStaticMarkup(
    createElement(LumiChatProvider, null, createElement(LumiSidebar)),
  )
  expect(html).toContain("Lumi Copilot")
  expect(html).toContain("Hi, I&#x27;m Lumi")
  expect(html).toContain("Suggested Questions")
  expect(html).toContain("What does my exposure score mean?")
})
