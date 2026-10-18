"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { ChatToolCall } from "@/components/lumi-chat-provider"
import { cn } from "@/lib/utils"

export function LumiToolCallBadge({ toolCall }: { toolCall: ChatToolCall }) {
  const [open, setOpen] = useState(false)
  const isRunning = toolCall.status === "running"

  return (
    <div className="my-1.5 text-[11px] font-mono">
      <button
        type="button"
        disabled={isRunning}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-colors select-none text-left",
          isRunning
            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 animate-pulse cursor-default"
            : "border-border/70 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
        )}
      >
        {isRunning ? (
          <span className="size-1.5 rounded-full bg-cyan-400 animate-ping" />
        ) : (
          <span className="text-emerald-500 text-[10px]">✓</span>
        )}
        <span className="font-semibold text-[10.5px]">{toolCall.name}</span>
        {toolCall.summary && (
          <span className="text-[10px] text-muted-foreground opacity-90 truncate max-w-[200px]">
            · {toolCall.summary}
          </span>
        )}
        {!isRunning && toolCall.data ? (
          open ? (
            <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
          ) : (
            <ChevronRight className="size-3 text-muted-foreground ml-0.5" />
          )
        ) : null}
      </button>

      {open && toolCall.data ? (
        <div className="mt-1 p-2 rounded-md bg-muted/60 border border-border/60 text-[11px] max-h-40 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-[10px] leading-tight text-foreground/80">
            {JSON.stringify(toolCall.data, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  )
}
