"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { ChatToolCall } from "@/components/lumi-chat-provider"
import { cn } from "@/lib/utils"

export function LumiToolCallBadge({ toolCall }: { toolCall: ChatToolCall }) {
  const [open, setOpen] = useState(false)
  const isRunning = toolCall.status === "running"

  return (
    <div className="my-1 max-w-full text-2xs">
      <button
        type="button"
        disabled={isRunning}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-left transition-colors select-none",
          isRunning
            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 animate-pulse cursor-default"
            : "border-border/60 bg-background/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer",
        )}
      >
        {isRunning ? (
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-cyan-500" />
          </span>
        ) : (
          <span className="text-emerald-500 font-bold shrink-0 text-2xs">✓</span>
        )}

        <span className="font-mono text-2xs font-medium text-foreground truncate">
          {toolCall.name}
        </span>

        {toolCall.summary && (
          <span className="truncate text-muted-foreground opacity-80 text-2xs">
            · {toolCall.summary}
          </span>
        )}

        {!isRunning && toolCall.data ? (
          open ? (
            <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
          )
        ) : null}
      </button>

      {open && toolCall.data ? (
        <div className="mt-1 max-w-full overflow-hidden rounded-md border border-border/60 bg-muted/50 p-2 text-2xs">
          <pre className="max-h-36 overflow-y-auto font-mono text-2xs leading-tight text-foreground/80 whitespace-pre-wrap break-all">
            {JSON.stringify(toolCall.data, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  )
}
