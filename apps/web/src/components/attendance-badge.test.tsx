import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test } from "vite-plus/test"
import { AttendanceBadge } from "./attendance-badge"

test("attendance badges expose labels with distinct colors", () => {
  for (const [status, color] of [
    ["On track", "sky"],
    ["Attended", "emerald"],
    ["Missed", "red"],
  ] as const) {
    const html = renderToStaticMarkup(createElement(AttendanceBadge, { status }))
    expect(html).toContain(status)
    expect(html).toContain(`text-${color}-700`)
    expect(html).toContain(`dark:text-${color}-300`)
  }
})
