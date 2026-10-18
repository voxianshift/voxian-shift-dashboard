import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test } from "vite-plus/test"
import { AttendanceBadge } from "./attendance-badge"

test("attendance badges expose labels with distinct colors", () => {
  for (const [status, color] of [
    ["On track", "brand-ink"],
    ["Attended", "success"],
    ["Missed", "destructive"],
  ] as const) {
    const html = renderToStaticMarkup(createElement(AttendanceBadge, { status }))
    expect(html).toContain(status)
    expect(html).toContain(`text-${color}`)
  }
})
