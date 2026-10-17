"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { ChevronRight, RotateCcw, Send, X } from "lucide-react"
import { useLumiChat } from "@/components/lumi-chat-provider"
import { LumiMascot } from "@/components/lumi-mascot"
import { LumiActionCard } from "@/components/lumi-action-card"
import { Button } from "@/components/ui/button"
import Orb from "@/components/ui/orb"
import { cn } from "@/lib/utils"

export function LumiMobileTrigger() {
  const {
    isMobileOpen,
    setIsMobileOpen,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
  } = useLumiChat()

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number; startPosX: number; startPosY: number }>({
    x: 0,
    y: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const hasMovedRef = useRef(false)

  // Default initial position at bottom-right of screen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultX = window.innerWidth - 68
      const defaultY = window.innerHeight - 100
      setPosition({ x: defaultX, y: defaultY })
    }
  }, [])

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!position) return
    isDraggingRef.current = true
    hasMovedRef.current = false
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    if (Math.hypot(dx, dy) > 6) {
      hasMovedRef.current = true
    }

    const newX = dragStartRef.current.startPosX + dx
    const newY = dragStartRef.current.startPosY + dy

    // Clamp to window bounds
    const clampedX = Math.max(12, Math.min(window.innerWidth - 60, newX))
    const clampedY = Math.max(60, Math.min(window.innerHeight - 80, newY))

    setPosition({ x: clampedX, y: clampedY })
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }

    if (!hasMovedRef.current) {
      // Tap detected! Open mobile drawer
      setIsMobileOpen(true)
      return
    }

    // Drag ended: Snap to nearest edge (left or right)
    if (position) {
      const snapX = position.x < window.innerWidth / 2 ? 16 : window.innerWidth - 68
      setPosition((prev) => (prev ? { x: snapX, y: prev.y } : null))
    }
  }

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isMobileOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, isMobileOpen])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    const text = input
    setInput("")
    void sendMessage(text)
  }

  return (
    <>
      {/* Floating Draggable Mascot Trigger */}
      {position && !isMobileOpen && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: "none",
          }}
          className="fixed top-0 left-0 z-50 lg:hidden cursor-grab active:cursor-grabbing select-none"
        >
          <div className="relative flex items-center justify-center size-13 rounded-full bg-card/90 border border-cyan-500/40 shadow-xl backdrop-blur-md">
            <LumiMascot size="xs" />
            <span className="absolute -top-1 -right-1 flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-3 bg-cyan-500" />
            </span>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-h-[85dvh] h-[580px] bg-card border-t border-border rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Lumi Mobile Copilot"
          >
            {/* Drawer Handle & Header */}
            <div className="flex flex-col items-center pt-2 px-4 border-b border-border bg-background/80 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <div className="w-full flex items-center justify-between pb-2.5">
                <div className="flex items-center gap-2">
                  <LumiMascot size="xs" />
                  <div>
                    <span className="text-[14px] font-semibold text-foreground">Lumi Copilot</span>
                    <span className="ml-1.5 rounded-full bg-cyan-500/15 px-1.5 py-0.2 text-[10px] font-medium text-cyan-700 dark:text-cyan-400">
                      AI
                    </span>
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
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    title="Close"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 text-[13px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <LumiMascot size="sm" />
                  <h4 className="mt-2 text-[14px] font-semibold text-foreground">
                    Hi, I&apos;m Lumi
                  </h4>
                  <p className="mt-1 text-[12px] text-muted-foreground px-4">
                    Your AI career copilot on this page.
                  </p>

                  <div className="mt-4 w-full space-y-1.5 text-left">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                      Suggested Questions
                    </div>
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void sendMessage(q)}
                        className="w-full text-left rounded-lg border border-border/70 bg-background/80 p-2.5 text-[12px] text-foreground flex items-center justify-between"
                      >
                        <span>{q}</span>
                        <ChevronRight className="size-3.5 text-muted-foreground shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col",
                        m.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-xl px-3 py-2 max-w-[88%] leading-relaxed",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-foreground border border-border/60",
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
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

            {/* Quick Prompt Chips */}
            {messages.length > 0 && suggestedQuestions.length > 0 && (
              <div className="px-3 pt-1 pb-2 border-t border-border/50 bg-background/40">
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isLoading}
                      onClick={() => void sendMessage(q)}
                      className="rounded-full shrink-0 border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground"
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
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Lumi anything…"
                  disabled={isLoading}
                  className="flex-1 rounded-md border border-input bg-muted/40 px-3 py-1.5 text-[13px] placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  disabled={!input.trim() || isLoading}
                  className="size-8 shrink-0"
                >
                  <Send className="size-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
