import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vite-plus/test"
import { CommitDirectionDialog } from "./commit-direction-dialog"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/components/profile-sheet", () => ({ ProfileSheet: () => null }))
vi.mock("@/components/ui/dialog", () => {
  const element = ({ children, ...props }: { children?: ReactNode }) =>
    createElement("div", props, children)
  return Object.fromEntries(
    [
      "Dialog",
      "DialogContent",
      "DialogHeader",
      "DialogTitle",
      "DialogDescription",
      "DialogFooter",
    ].map((name) => [name, element]),
  )
})

function render(hours = "3–5 hours") {
  return renderToStaticMarkup(
    createElement(CommitDirectionDialog, {
      open: true,
      onOpenChange: () => {},
      pathId: "hybrid",
      direction: "Hybrid",
      role: null,
      sprint: true,
      profile: { hours, flexibility: "", timeline: "This month" },
      generate: vi.fn(),
    }),
  )
}

test("study hours come from profile and timezone has no editable input", () => {
  const html = render()
  expect(html).toContain("Study hours per week")
  expect(html).toMatch(/type="number"[^>]*value="4"/)
  expect(html).toContain("Device time zone:")
  expect(html).not.toContain("Confirmed study minutes")
  expect(html).toContain("min-h-0 flex-1 space-y-5 overflow-y-auto")
  expect(html).toContain("m-0 shrink-0 p-5")
})

test("weekly cards show every day and split sessions to fit available time", () => {
  const html = render("5+ hours")
  for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    expect(html).toContain(`>${day}</p>`)
  expect(html).toContain("Your weekly slots")
  expect(html).toContain('aria-label="Edit Mon study time"')
  expect(html).not.toContain('type="time"')
  expect(html).toContain("12:30–13:30")
  expect(html).toContain("grid-cols-2")
  expect(html).toContain('step="0.5"')
})

test("under-one-hour preference stays below one hour", () => {
  expect(render("Under 1 hour")).toMatch(/type="number"[^>]*value="0.5"/)
})
