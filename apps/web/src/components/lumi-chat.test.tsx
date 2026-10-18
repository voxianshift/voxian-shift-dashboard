import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, test, vi } from "vite-plus/test"
import { LumiMascot } from "./lumi-mascot"
import { LumiActionCard } from "./lumi-action-card"
import { LumiSidebar } from "./lumi-sidebar"
import { LumiChatProvider } from "./lumi-chat-provider"
import { LumiFormattedText } from "./lumi-formatted-text"
import { LumiToolCallBadge } from "./lumi-tool-call-badge"

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
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
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

test("renders LumiActionCard with SELECT_STRATEGY and UPDATE_STUDY_HOURS", () => {
  const strategyHtml = renderToStaticMarkup(
    createElement(LumiActionCard, {
      action: {
        type: "SELECT_STRATEGY",
        strategy: "leap",
        label: "AI Systems Engineering Pathway",
        explanation: "High upside career leap",
      },
    }),
  )
  expect(strategyHtml).toContain("CAREER PATHWAY STRATEGY")
  expect(strategyHtml).toContain("AI Systems Engineering Pathway")
  expect(strategyHtml).toContain("Activate Pathway")

  const hoursHtml = renderToStaticMarkup(
    createElement(LumiActionCard, {
      action: {
        type: "UPDATE_STUDY_HOURS",
        hours: "5–10 hours",
        explanation: "Accelerated timeline",
      },
    }),
  )
  expect(hoursHtml).toContain("STUDY COMMITMENT")
  expect(hoursHtml).toContain("5–10 hours per week")
  expect(hoursHtml).toContain("Apply Commitment")
})

test("renders LumiSidebar empty state with starter questions", () => {
  const html = renderToStaticMarkup(
    createElement(LumiChatProvider, null, createElement(LumiSidebar)),
  )
  expect(html).toContain("Lumi Copilot")
  expect(html).not.toContain("Hi, I&#x27;m Lumi")
  expect(html).toContain("lumiBodyGrad-")
  expect(html).toContain("Suggested Questions")
  expect(html).toContain("What does G2 mean?")
  expect(html).toContain("Show me my best path")
  expect(html).toContain("Who are you?")
})

test("renders LumiFormattedText with rich markdown headings, lists, code, and links", () => {
  const markdownSample = `
### Core Overview
Analisis **AI Exposure** untuk peran Anda:
- Prioritas **Tinggi**
- Kategori [Roadmap](/roadmap)

\`\`\`typescript
const score = 75
\`\`\`
`
  const html = renderToStaticMarkup(createElement(LumiFormattedText, { text: markdownSample }))
  expect(html).toContain("Core Overview")
  expect(html).toContain(">AI Exposure</strong>")
  expect(html).toContain("Prioritas")
  expect(html).toContain('href="/roadmap"')
  expect(html).toContain("const score = 75")
  expect(html).toContain("Copy")
})

test("renders LumiToolCallBadge in running and completed states", () => {
  const runningHtml = renderToStaticMarkup(
    createElement(LumiToolCallBadge, {
      toolCall: {
        name: "get_occupation_tasks",
        parameters: { code: "15-1252.00" },
        status: "running",
      },
    }),
  )
  expect(runningHtml).toContain("get_occupation_tasks")
  expect(runningHtml).toContain("animate-ping")

  const completedHtml = renderToStaticMarkup(
    createElement(LumiToolCallBadge, {
      toolCall: {
        name: "get_occupation_tasks",
        summary: "Loaded 5 tasks",
        status: "completed",
        data: { count: 5 },
      },
    }),
  )
  expect(completedHtml).toContain("get_occupation_tasks")
  expect(completedHtml).toContain("Loaded 5 tasks")
  expect(completedHtml).toContain("✓")
})

test("floating-size Lumi exposes motion rigs and can disable decorative animation", () => {
  const moving = renderToStaticMarkup(
    createElement(LumiMascot, { size: 72, lean: 8, dragging: true }),
  )
  expect(moving).toContain("width:72px")
  expect(moving).toContain('data-lumi-dragging="true"')
  expect(moving).toContain("rotate(-11.2deg)")
  expect(moving).toContain("animate-lumi-beacon")
  expect(moving).toContain("animate-lumi-blink")
  expect(moving).toContain("motion-reduce:animate-none")
  const still = renderToStaticMarkup(createElement(LumiMascot, { animated: false }))
  expect(still).not.toContain("animate-lumi-beacon")
  expect(still).not.toContain("animate-lumi-blink")
  expect(still).not.toContain("animate-lumi-hover")
})
