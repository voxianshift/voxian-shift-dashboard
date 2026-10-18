"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { ChevronRight, RotateCcw, Send, X } from "lucide-react"
import { useLumiChat } from "@/components/lumi-chat-provider"
import { LumiMascot } from "@/components/lumi-mascot"
import { LumiActionCard } from "@/components/lumi-action-card"
import { LumiFormattedText } from "@/components/lumi-formatted-text"
import { LumiToolCallBadge } from "@/components/lumi-tool-call-badge"
import { Button } from "@/components/ui/button"
import Orb from "@/components/ui/orb"
import { cn } from "@/lib/utils"
import { clampLumiPosition, lumiTriggerSize, stepLumiSpring } from "@/lib/lumi-motion"

export function LumiMobileTrigger() {
  const {
    isOpen,
    setIsOpen,
    isMobileOpen,
    setIsMobileOpen,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
  } = useLumiChat()

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [lean, setLean] = useState(0)
  const isDraggingRef = useRef(false)
  const hasMovedRef = useRef(false)
  const frameRef = useRef(0)
  const reducedMotionRef = useRef(false)
  const springRef = useRef({ angle: 0, velocity: 0, target: 0 })
  const dragStartRef = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0, lastX: 0, time: 0 })

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotion = () => {
      reducedMotionRef.current = motion.matches
      if (motion.matches) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
        springRef.current = { angle: 0, velocity: 0, target: 0 }
        setLean(0)
      }
    }
    const resize = () => {
      setPosition((current) =>
        clampLumiPosition(
          current?.x ?? window.innerWidth - lumiTriggerSize.width - 16,
          current?.y ?? window.innerHeight - lumiTriggerSize.height - 80,
          window.innerWidth,
          window.innerHeight,
        ),
      )
    }
    updateMotion()
    resize()
    motion.addEventListener("change", updateMotion)
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(frameRef.current)
      motion.removeEventListener("change", updateMotion)
      window.removeEventListener("resize", resize)
    }
  }, [])

  const animateSway = () => {
    if (reducedMotionRef.current || frameRef.current) return
    let previous = performance.now()
    const tick = (now: number) => {
      const spring = springRef.current
      const next = stepLumiSpring(
        spring.angle,
        spring.velocity,
        spring.target,
        (now - previous) / 1000,
      )
      previous = now
      Object.assign(spring, next)
      setLean(next.angle)
      if (Math.abs(next.angle - spring.target) > 0.01 || Math.abs(next.velocity) > 0.01) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        frameRef.current = 0
        setLean(spring.target)
      }
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (!position || !e.isPrimary || e.button !== 0) return
    isDraggingRef.current = true
    hasMovedRef.current = false
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      lastX: e.clientX,
      time: e.timeStamp,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return
    const start = dragStartRef.current
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.hypot(dx, dy) > 6) {
      hasMovedRef.current = true
      setDragging(true)
    }
    if (!hasMovedRef.current) return
    setPosition(
      clampLumiPosition(
        start.startPosX + dx,
        start.startPosY + dy,
        window.innerWidth,
        window.innerHeight,
      ),
    )
    const velocity = (e.clientX - start.lastX) / Math.max(1, e.timeStamp - start.time)
    springRef.current.target = Math.max(-16, Math.min(16, velocity * 9))
    start.lastX = e.clientX
    start.time = e.timeStamp
    animateSway()
  }

  const finishDrag = (e: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setDragging(false)
    if (cancelled) hasMovedRef.current = true
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId)
    springRef.current.target = 0
    animateSway()
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
      {/* One floating control works with mouse, touch and keyboard. */}
      {position && !isMobileOpen && (
        <button
          type="button"
          aria-label="Open Lumi chat"
          aria-describedby="lumi-drag-hint"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => finishDrag(e)}
          onPointerCancel={(e) => finishDrag(e, true)}
          onLostPointerCapture={(e) => finishDrag(e, true)}
          onClick={(e) => {
            if (hasMovedRef.current && e.detail !== 0) return
            if (window.matchMedia("(min-width: 1024px)").matches) setIsOpen(true)
            else setIsMobileOpen(true)
          }}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 32 : 16
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            }
            const move = moves[e.key]
            if (!move) return
            e.preventDefault()
            setPosition(
              clampLumiPosition(
                position.x + move[0],
                position.y + move[1],
                window.innerWidth,
                window.innerHeight,
              ),
            )
          }}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: "none",
            width: lumiTriggerSize.width,
            height: lumiTriggerSize.height,
          }}
          className={cn(
            "fixed top-0 left-0 z-40 grid place-items-center rounded-2xl bg-transparent cursor-grab active:cursor-grabbing select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
            isOpen && "lg:hidden",
          )}
        >
          <div className="pointer-events-none flex flex-col items-center gap-1 animate-lumi-arrive motion-reduce:animate-none">
            <LumiMascot size={72} lean={lean} dragging={dragging} />
            <span className="rounded-full border border-brand/30 bg-card/95 px-3 py-1 text-[11px] font-mono font-bold text-brand-ink shadow-sm">
              LUMI
            </span>
          </div>
          <span id="lumi-drag-hint" className="sr-only">
            Drag anywhere or use arrow keys to move. Press Enter to open Lumi.
          </span>
        </button>
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
                  <LumiMascot size={72} />
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
                        {m.role === "user" ? (
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        ) : (
                          <>
                            {m.toolCalls && m.toolCalls.length > 0 && (
                              <div className="mb-2 space-y-1">
                                {m.toolCalls.map((tc, idx) => (
                                  <LumiToolCallBadge key={`${tc.name}-${idx}`} toolCall={tc} />
                                ))}
                              </div>
                            )}
                            {m.text ? (
                              <LumiFormattedText text={m.text} />
                            ) : m.toolCalls &&
                              m.toolCalls.some((t) => t.status === "running") ? null : (
                              <div className="flex items-center gap-2 py-0.5 text-muted-foreground">
                                <Orb variant="pulse" size={14} />
                                <span className="text-[12px]">Lumi is thinking…</span>
                              </div>
                            )}
                          </>
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

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
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
