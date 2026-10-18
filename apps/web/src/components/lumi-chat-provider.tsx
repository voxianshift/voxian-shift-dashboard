"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import {
  baselineIdForOccupation,
  computeExposure,
  type CopilotAction,
  type CopilotChatResult,
} from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { occupationModels, taskWeights } from "@/lib/occupations"

export type ChatToolCall = {
  name: string
  parameters?: Record<string, string>
  status: "running" | "completed"
  summary?: string
  data?: unknown
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  actions?: CopilotAction[]
  suggestedQuestions?: string[]
  toolCalls?: ChatToolCall[]
  timestamp: number
}

const CORE_STARTER_QUESTIONS = ["What does G2 mean?", "Show me my best path", "Who are you?"]

function getRouteSuggestions(route: string): string[] {
  if (route.startsWith("/meter")) {
    return [...CORE_STARTER_QUESTIONS, "Which tasks are most vulnerable?"]
  }
  if (route.startsWith("/roadmap")) {
    return [...CORE_STARTER_QUESTIONS, "Recommend an adjacent target role"]
  }
  if (route.startsWith("/skill-analyse")) {
    return [...CORE_STARTER_QUESTIONS, "What skill gaps should I focus on?"]
  }
  if (route.startsWith("/progress")) {
    return [...CORE_STARTER_QUESTIONS, "How is my learning consistency?"]
  }
  return CORE_STARTER_QUESTIONS
}

type LumiChatContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleOpen: () => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (text: string) => Promise<void>
  clearMessages: () => void
  suggestedQuestions: string[]
}

const LumiChatContext = createContext<LumiChatContextType | null>(null)

const STORAGE_KEY = "voxian-lumi-chat-session-v1"
const SIDEBAR_STATE_KEY = "voxian-lumi-sidebar-open"

export function LumiChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { profile } = useCareerProfile()

  const [isOpen, setIsOpenState] = useState<boolean>(true)
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([])

  // Restore sidebar open preference on desktop
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY)
      if (saved !== null) {
        setIsOpenState(saved === "true")
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Hydrate persistent turns from server database (lumi_chat_turns)
  useEffect(() => {
    let active = true
    async function loadServerHistory() {
      try {
        const res = await fetch("/api/copilot/history", {
          credentials: "same-origin",
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.history) && data.history.length > 0) {
          setMessages((prev) => {
            if (prev.length > 0) return prev
            return data.history.map(
              (h: { role: "user" | "assistant"; text: string }, i: number) => ({
                id: `db-${i}-${Date.now()}`,
                role: h.role,
                text: h.text,
                timestamp: Date.now(),
              }),
            )
          })
        }
      } catch {
        /* ignore */
      }
    }
    void loadServerHistory()
    return () => {
      active = false
    }
  }, [])

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open)
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, String(open))
    } catch {
      /* ignore */
    }
  }, [])

  const toggleOpen = useCallback(() => {
    setIsOpenState((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  // Persist messages to sessionStorage so switching tabs doesn't clear them
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      /* ignore */
    }
  }, [messages])

  // Reset dynamic questions on route change so page-specific prompts appear immediately
  useEffect(() => {
    setDynamicSuggestions([])
  }, [pathname])

  const suggestedQuestions =
    dynamicSuggestions.length > 0 ? dynamicSuggestions : getRouteSuggestions(pathname)

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        text: trimmed,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      const historyPayload = messages
        .filter((m) => !m.id.startsWith("err-"))
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.text.slice(0, 4000),
        }))

      let liveExposure: number | undefined
      let topVulnerable: string | undefined
      let topMoat: string | undefined

      if (profile?.primaryOccupation) {
        const baselineId = baselineIdForOccupation(profile.primaryOccupation)
        const model = occupationModels.find((m) => m.id === baselineId)
        if (model) {
          const weights = taskWeights(model, profile.taskFocus || "routine")
          liveExposure = Math.round(
            computeExposure(model.tasks.map((t, i) => ({ ...t, weight: weights[i]! }))),
          )
          const sorted = [...model.tasks].sort((a, b) => b.exposure - a.exposure)
          topVulnerable = sorted.find((t) => !t.moat)?.name || sorted[0]?.name
          topMoat = model.tasks.find((t) => t.moat)?.name
        }
      }

      const pageContext = {
        exposureScore: liveExposure,
        topVulnerableTask: topVulnerable,
        topMoatTask: topMoat,
        activeStrategy:
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("strategy") || undefined
            : undefined,
      }

      const assistantId = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        toolCalls: [],
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMsg])

      try {
        const response = await fetch("/api/copilot/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
          },
          credentials: "same-origin",
          signal: AbortSignal.timeout(45_000),
          body: JSON.stringify({
            message: trimmed,
            route: pathname || "/home",
            profile: profile || {},
            pageContext,
            history: historyPayload,
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const detailStr = Array.isArray(errData.details) ? `: ${errData.details.join(", ")}` : ""
          throw new Error((errData.error || `Server responded with ${response.status}`) + detailStr)
        }

        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("text/event-stream") && response.body) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const blocks = buffer.split("\n\n")
            buffer = blocks.pop() || ""

            for (const block of blocks) {
              let eventType = "message"
              let eventData = ""
              for (const line of block.split("\n")) {
                if (line.startsWith("event: ")) eventType = line.slice(7).trim()
                if (line.startsWith("data: ")) eventData = line.slice(6).trim()
              }
              if (!eventData) continue

              try {
                const parsed = JSON.parse(eventData)
                if (eventType === "tool_call") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolCalls: [
                              ...(m.toolCalls || []),
                              {
                                name: parsed.name,
                                parameters: parsed.parameters,
                                status: "running" as const,
                              },
                            ],
                          }
                        : m,
                    ),
                  )
                } else if (eventType === "tool_result") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolCalls: (m.toolCalls || []).map((tc) =>
                              tc.name === parsed.name
                                ? {
                                    ...tc,
                                    status: "completed" as const,
                                    summary: parsed.summary,
                                    data: parsed.data,
                                  }
                                : tc,
                            ),
                          }
                        : m,
                    ),
                  )
                } else if (eventType === "delta") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            text: m.text + (parsed.delta || ""),
                          }
                        : m,
                    ),
                  )
                } else if (eventType === "final") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            actions: parsed.actions,
                            suggestedQuestions: parsed.suggestedQuestions,
                          }
                        : m,
                    ),
                  )
                  if (parsed.suggestedQuestions && parsed.suggestedQuestions.length > 0) {
                    setDynamicSuggestions(parsed.suggestedQuestions)
                  }
                } else if (eventType === "error") {
                  throw new Error(parsed.error || "Streaming error occurred")
                }
              } catch {
                /* ignore unparsed non-JSON chunk */
              }
            }
          }
        } else {
          const data: CopilotChatResult = await response.json()
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    text: data.reply,
                    actions: data.actions,
                    suggestedQuestions: data.suggestedQuestions,
                  }
                : m,
            ),
          )
          if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
            setDynamicSuggestions(data.suggestedQuestions)
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "AI copilot unavailable"
        toast.error(message)

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === assistantId)
          if (exists) {
            return prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    text: m.text ? `${m.text}\n\n[Notice: ${message}]` : `Notice: ${message}`,
                  }
                : m,
            )
          }
          return [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              text: `Notice: ${message}`,
              timestamp: Date.now(),
            },
          ]
        })
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, pathname, profile],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setDynamicSuggestions([])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    void fetch("/api/copilot/history", {
      method: "DELETE",
      credentials: "same-origin",
    }).catch(() => {})
  }, [])

  return (
    <LumiChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        isMobileOpen,
        setIsMobileOpen,
        messages,
        isLoading,
        sendMessage,
        clearMessages,
        suggestedQuestions,
      }}
    >
      {children}
    </LumiChatContext.Provider>
  )
}

export function useLumiChat() {
  const context = useContext(LumiChatContext)
  if (!context) {
    throw new Error("useLumiChat must be used within a LumiChatProvider")
  }
  return context
}
