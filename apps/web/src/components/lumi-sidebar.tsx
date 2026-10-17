"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { ChevronRight, PanelRightClose, RotateCcw, Send } from "lucide-react"
import { useLumiChat } from "@/components/lumi-chat-provider"
import { LumiMascot } from "@/components/lumi-mascot"
import { LumiActionCard } from "@/components/lumi-action-card"
import { LumiFormattedText } from "@/components/lumi-formatted-text"
import { Button } from "@/components/ui/button"
import Orb from "@/components/ui/orb"
import { cn } from "@/lib/utils"

export function LumiSidebar() {
  const {
    isOpen,
    toggleOpen,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
  } = useLumiChat()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, isOpen])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    const text = input
    setInput("")
    void sendMessage(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <aside
      aria-label="Lumi Copilot Sidebar"
      className={cn(
        "hidden lg:flex flex-col border-l border-border bg-card/60 backdrop-blur-xs transition-[width] duration-300 ease-in-out overflow-hidden shrink-0 h-full",
        isOpen ? "w-[380px]" : "w-0 border-l-0",
      )}
    >
      <div className="w-[380px] flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3.5 bg-background/80">
          <div className="flex items-center gap-2">
            <LumiMascot size="xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold tracking-tight text-foreground">
                  Lumi Copilot
                </span>
                <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.2 text-[10px] font-medium text-cyan-700 dark:text-cyan-400">
                  AI
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon-xs"
              variant="ghost"
              title="Clear chat"
              onClick={clearMessages}
              disabled={messages.length === 0 || isLoading}
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button size="icon-xs" variant="ghost" title="Collapse sidebar" onClick={toggleOpen}>
              <PanelRightClose className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 min-h-0 text-[13px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <LumiMascot size="md" />
              <h3 className="mt-3 text-[14px] font-semibold text-foreground">Hi, I&apos;m Lumi</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground px-4">
                Your AI career copilot. Ask me about your risk radar, transition roadmap, or target
                skills on this page.
              </p>

              <div className="mt-5 w-full space-y-1.5 text-left">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                  Suggested Questions
                </div>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="w-full text-left rounded-lg border border-border/70 bg-background/80 hover:bg-accent/60 p-2.5 text-[12px] text-foreground transition-colors flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 max-w-[88%] leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground border border-border/60",
                    )}
                  >
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <LumiFormattedText text={m.text} />
                    )}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-1 space-y-1.5">
                        {m.actions.map((act, i) => (
                          <LumiActionCard key={`${act.type}-${i}`} action={act} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground pl-1">
                  <Orb variant="pulse" size={16} />
                  <span className="text-[12px]">Lumi is thinking…</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips if conversation is active */}
        {messages.length > 0 && suggestedQuestions.length > 0 && (
          <div className="px-3 pt-1 pb-2 border-t border-border/50 bg-background/40">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void sendMessage(q)}
                  className="rounded-full shrink-0 border border-border/70 bg-background/80 hover:bg-accent/80 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lumi anything…"
              disabled={isLoading}
              className="flex-1 rounded-md border border-input bg-muted/40 px-3 py-1.5 text-[13px] placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={!input.trim() || isLoading}
              className="size-8 shrink-0"
              aria-label="Send message"
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
