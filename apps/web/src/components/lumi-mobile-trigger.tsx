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

// Arm ref exposed so intro animation can drive it
type ArmRef = { el: SVGGElement | null; timeouts: ReturnType<typeof setTimeout>[] }

export function LumiMobileTrigger() {
  const {
    isOpen,
    toggleOpen,
    isMobileOpen,
    setIsMobileOpen,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    suggestedQuestions,
  } = useLumiChat()

  // Position state — null until mounted (SSR safe)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  // Whether intro animation is playing
  const [introPlaying, setIntroPlaying] = useState(true)
  // Whether intro is done (idle state)
  const [introDone, setIntroDone] = useState(false)
  // Chassis transform for the intro (translates the whole wrapper)
  const [chassisTransform, setChassisTransform] = useState("translate3d(-300px, 180px, 0) rotate(14deg)")
  const [chassisTransition, setChassisTransition] = useState("none")

  const wrapperRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number; startPosX: number; startPosY: number }>({ x: 0, y: 0, startPosX: 0, startPosY: 0 })
  const hasMovedRef = useRef(false)
  const armRef = useRef<ArmRef>({ el: null, timeouts: [] })

  // Measure arm element after mount
  const mascotRef = useRef<HTMLDivElement>(null)

  function clearArmTimeouts() {
    armRef.current.timeouts.forEach(clearTimeout)
    armRef.current.timeouts = []
  }

  function getArmEl(): SVGGElement | null {
    // Right arm is the one that waves — find the second <g> with transformOrigin containing "99"
    if (!mascotRef.current) return null
    const gs = mascotRef.current.querySelectorAll<SVGGElement>("svg > g")
    // The SVG structure is: antenna (g0), left arm (g1), body (g2), right arm (g3)
    return gs[3] ?? null
  }

  function setArmRotation(deg: number, transitionMs: number, easing = "ease-out") {
    const el = getArmEl()
    if (!el) return
    el.style.transition = `transform ${transitionMs}ms ${easing}`
    el.style.transform = `rotate(${deg}deg)`
  }

  function clearArmStyle() {
    const el = getArmEl()
    if (!el) return
    el.style.transition = ""
    el.style.transform = ""
  }

  // Trigger intro sequence on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    // Default rest position (bottom-right)
    const restX = window.innerWidth - 78
    const restY = window.innerHeight - 110
    setPosition({ x: restX, y: restY })

    // Phase 1: pre-position off-screen (already set in state), unhide after two rAFs
    let raf1: number, raf2: number
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        // Fly-in: set transition and move to rest position
        setChassisTransition("transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)")
        setChassisTransform("translate3d(0px, 0px, 0) rotate(0deg)")

        // Arm: trail back as Lumi accelerates
        setArmRotation(-28, 0)

        // Arm: spring forward as Lumi decelerates
        const t1 = setTimeout(() => setArmRotation(6, 500, "cubic-bezier(0.34, 1.56, 0.64, 1)"), 500)
        // Arm: settle
        const t2 = setTimeout(() => setArmRotation(0, 200, "ease-out"), 1350)
        // Wave sequence after landing
        const t3 = setTimeout(() => {
          setArmRotation(-22, 200, "ease-in-out")
        }, 1500)
        const t4 = setTimeout(() => setArmRotation(8, 280, "ease-in-out"), 1720)
        const t5 = setTimeout(() => setArmRotation(-18, 250, "ease-in-out"), 2020)
        const t6 = setTimeout(() => {
          setArmRotation(0, 300, "ease-out")
        }, 2290)
        const t7 = setTimeout(() => {
          clearArmStyle()
          setIntroPlaying(false)
          setIntroDone(true)
        }, 2650)
        armRef.current.timeouts = [t1, t2, t3, t4, t5, t6, t7]
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearArmTimeouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 1024

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Lock drag while any chat is open
    if (isOpen || isMobileOpen) return
    if (!position || !introDone) return
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

    if (Math.hypot(dx, dy) > 6) hasMovedRef.current = true

    const newX = dragStartRef.current.startPosX + dx
    const newY = dragStartRef.current.startPosY + dy
    const clampedX = Math.max(12, Math.min(window.innerWidth - 72, newX))
    const clampedY = Math.max(60, Math.min(window.innerHeight - 100, newY))
    setPosition({ x: clampedX, y: clampedY })
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* ignore */ }

    if (!hasMovedRef.current) {
      // Tap → open chat
      if (isMobile()) {
        setIsMobileOpen(true)
      } else {
        toggleOpen()
      }
      return
    }

    // Snap to nearest horizontal edge
    if (position) {
      const snapX = position.x < window.innerWidth / 2 ? 16 : window.innerWidth - 72
      setPosition((prev) => (prev ? { x: snapX, y: prev.y } : null))
    }
  }

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isMobileOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, isMobileOpen])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    const text = input
    setInput("")
    void sendMessage(text)
  }

  const hasNewMessages = messages.length > 0 && !isOpen && !isMobileOpen

  return (
    <>
      {/* Floating Draggable Mascot — all screen sizes, hidden while mobile chat open */}
      {position && !isMobileOpen && (
        <div
          ref={wrapperRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            transform: introDone
              ? `translate3d(${position.x}px, ${position.y}px, 0)`
              : `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: "none",
            willChange: "transform",
          }}
          className={cn(
            "z-50 cursor-grab active:cursor-grabbing select-none",
            // On desktop, hide the float trigger if the sidebar is open (button in header handles toggle)
            isOpen && "lg:hidden",
          )}
        >
          {/* Intro chassis wrapper — separate transform layer for fly-in */}
          <div
            style={{
              transform: chassisTransform,
              transition: chassisTransition,
              willChange: "transform",
            }}
          >
            <div className="relative flex flex-col items-center gap-1 pointer-events-auto">
              {/* New-message dot indicator */}
              {hasNewMessages && (
                <span className="absolute -top-1 -right-0.5 flex size-3 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-cyan-500 border border-background" />
                </span>
              )}
              {/* Mascot */}
              <div ref={mascotRef}>
                <LumiMascot
                  size="sm"
                  animated={false}
                  idleFloat={introDone}
                />
              </div>
              {/* Label bubble */}
              <div
                className="bg-[#0b1628]/95 border border-cyan-800/50 rounded-xl px-2 py-1 shadow-lg backdrop-blur-xl"
                style={{ boxShadow: "0 4px 16px rgba(0,242,254,0.12)" }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                  <span className="text-[9px] font-mono font-bold text-cyan-400">LUMI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet — only on mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-h-[85dvh] h-[580px] bg-card border-t border-border rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Lumi Copilot"
          >
            {/* Drawer Handle & Header */}
            <div className="flex flex-col items-center pt-2 px-4 border-b border-border bg-background/80 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <div className="w-full flex items-center justify-between pb-2.5">
                <div className="flex items-center gap-2">
                  <LumiMascot size="xs" idleFloat />
                  <div>
                    <span className="text-[14px] font-semibold text-foreground">Lumi Copilot</span>
                    <span className="ml-1.5 rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">AI</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon-xs" variant="ghost" title="Clear chat" onClick={clearMessages} disabled={messages.length === 0 || isLoading}>
                    <RotateCcw className="size-3.5" />
                  </Button>
                  <Button size="icon-xs" variant="ghost" title="Close" onClick={() => setIsMobileOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 text-[13px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <LumiMascot size="sm" idleFloat />
                  <h4 className="mt-2 text-[14px] font-semibold text-foreground">Hi, I&apos;m Lumi</h4>
                  <p className="mt-1 text-[12px] text-muted-foreground px-4">Your AI career copilot on this page.</p>
                  <div className="mt-4 w-full space-y-1.5 text-left">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">Suggested Questions</div>
                    {suggestedQuestions.map((q) => (
                      <button key={q} type="button" onClick={() => void sendMessage(q)}
                        className="w-full text-left rounded-lg border border-border/70 bg-background/80 p-2.5 text-[12px] text-foreground flex items-center justify-between">
                        <span>{q}</span>
                        <ChevronRight className="size-3.5 text-muted-foreground shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                      <div className={cn("rounded-xl px-3 py-2 max-w-[88%] leading-relaxed",
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground border border-border/60")}>
                        {m.role === "user" ? (
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        ) : (
                          <>
                            {m.toolCalls && m.toolCalls.length > 0 && (
                              <div className="mb-2 space-y-1">
                                {m.toolCalls.map((tc, idx) => <LumiToolCallBadge key={`${tc.name}-${idx}`} toolCall={tc} />)}
                              </div>
                            )}
                            {m.text ? <LumiFormattedText text={m.text} /> :
                              m.toolCalls && m.toolCalls.some((t) => t.status === "running") ? null : (
                                <div className="flex items-center gap-2 py-0.5 text-muted-foreground">
                                  <Orb variant="pulse" size={14} />
                                  <span className="text-[12px]">Lumi is thinking…</span>
                                </div>
                              )}
                          </>
                        )}
                        {m.actions && m.actions.length > 0 && (
                          <div className="mt-1 space-y-1.5">
                            {m.actions.map((act, i) => <LumiActionCard key={`${act.type}-${i}`} action={act} />)}
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
                    <button key={q} type="button" disabled={isLoading} onClick={() => void sendMessage(q)}
                      className="rounded-full shrink-0 border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-background">
              <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex items-center gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Lumi anything…" disabled={isLoading}
                  className="flex-1 rounded-md border border-input bg-muted/40 px-3 py-1.5 text-[13px] placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring" />
                <Button type="submit" size="icon-sm" disabled={!input.trim() || isLoading} className="size-8 shrink-0">
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
