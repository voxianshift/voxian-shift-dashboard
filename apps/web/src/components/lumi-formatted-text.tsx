"use client"

import { Fragment, type ReactNode } from "react"

function formatInline(text: string): ReactNode[] {
  // Regex splitting by bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function LumiFormattedText({ text }: { text: string }) {
  const lines = text.split("\n")
  const elements: ReactNode[] = []

  let currentList: string[] = []
  let listKey = 0

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`ul-${listKey++}`}
          className="my-1.5 space-y-1 pl-4 list-disc marker:text-cyan-500"
        >
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>,
      )
      currentList = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()

    if (!line) {
      flushList()
      continue
    }

    // Bullet list detection (- or * or •)
    if (/^[-*•]\s+/.test(line)) {
      currentList.push(line.replace(/^[-*•]\s+/, ""))
      continue
    }

    flushList()
    elements.push(
      <p key={`p-${i}`} className="my-1 leading-relaxed">
        {formatInline(line)}
      </p>,
    )
  }

  flushList()

  return <div className="space-y-1 text-[13px]">{elements}</div>
}
