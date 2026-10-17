"use client"

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowUp,
  Bot,
  UserRound,
  Check,
  CircleHelp,
  ClipboardList,
  MessageCircle,
  PencilLine,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { baselineIdForOccupation, type OccupationMatch } from "@voxian/shared"
import { OccupationPicker } from "@/components/occupation-picker"
import { z } from "zod"
import { toast } from "sonner"
import { useCareerProfile } from "@/components/career-profile-provider"
import { OnboardingQuestionnaire } from "@/components/onboarding-questionnaire"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import Orb from "@/components/ui/orb"
import { Textarea } from "@/components/ui/textarea"
import { occupationModels } from "@/lib/occupations"
import { canConfirmProfile, chatResultSchema, mergeProfile, nextQuestion } from "@/lib/onboarding"
import { chatEmblem, eyebrow, fieldHelp, smallTag, statusDot } from "@/lib/styles"
import { cn } from "@/lib/utils"

const conversationSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })),
})
type Message = z.infer<typeof conversationSchema>["messages"][number]
type Stage = "choose" | "chat" | "questions" | "review"

// Large selectable card for picking an onboarding mode
const modeCard =
  "relative flex flex-col items-start rounded-md border bg-background p-6 text-left transition-colors duration-150 hover:border-mauve hover:bg-mauve-tint-faint focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring max-[650px]:p-[22px] motion-reduce:transition-none [&>svg]:mb-6 [&>svg]:size-[26px] [&>svg]:text-mauve-deep [&_h2]:mb-2.5 [&_h2]:text-[21px] [&_h2]:font-[450] [&_h2]:leading-[1.4] [&_h2]:tracking-[-0.5px] [&_p]:mb-[22px] [&_p]:text-[15px] [&_p]:leading-[1.8] [&_p]:text-muted-foreground"

export default function HomePage() {
  const {
    profile,
    confirmed,
    skipped,
    ready,
    storageAvailable,
    update,
    confirm,
    clear,
    saveOccupations,
  } = useCareerProfile()
  const [stage, setStage] = useState<Stage>("choose")
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [detailed, setDetailed] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [providerLabel, setProviderLabel] = useState("Rootsys")
  const [sending, setSending] = useState(false)
  const [suggestions, setSuggestions] = useState<OccupationMatch[]>([])
  const [roleDraft, setRoleDraft] = useState<typeof profile | null>(null)
  const [savingRoles, setSavingRoles] = useState(false)
  const [clearing, setClearing] = useState(false)
  const busy = sending || clearing || savingRoles
  const [historyState, setHistoryState] = useState<"loading" | "ready" | "error">("loading")
  const [historyAttempt, setHistoryAttempt] = useState(0)
  const [notice, setNotice] = useState("")
  const [editing, setEditing] = useState(false)
  const initialized = useRef(false)
  const requestRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const baselineReady = canConfirmProfile(profile)
  const model = baselineReady
    ? occupationModels.find((m) => m.id === baselineIdForOccupation(profile.primaryOccupation))
    : undefined
  const taskMix =
    profile.taskFocus === "routine"
      ? "Routine questions & coordination"
      : profile.taskFocus === "escalations"
        ? "Complex problems & exceptions"
        : profile.taskFocus === "mixed"
          ? "A bit of both"
          : "Default routine weights · task mix not shared"
  const workspaceReady = confirmed && baselineReady

  useEffect(() => {
    if (ready && !initialized.current) {
      initialized.current = true
      if ((confirmed && canConfirmProfile(profile)) || !nextQuestion(profile, skipped))
        setStage("review")
    }
  }, [ready, confirmed, profile, skipped])
  useEffect(() => () => requestRef.current?.abort(), [])
  useEffect(() => {
    if (!ready) return
    let active = true
    const controller = new AbortController()
    setHistoryState("loading")
    fetch("/api/onboarding/conversation", {
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Conversation unavailable")
        const saved = conversationSchema.parse(await response.json())
        if (!active) return
        setMessages(saved.messages)
        if (saved.messages.length) setStage("chat")
        setHistoryState("ready")
      })
      .catch(() => {
        if (active) setHistoryState("error")
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [ready, historyAttempt])
  useEffect(() => {
    let active = true
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setConnected(data.connected === true)
          setProviderLabel(
            data.provider === "gemini"
              ? "Gemini"
              : data.provider === "rootsys"
                ? "Rootsys"
                : "AI chat",
          )
        }
      })
      .catch(() => {
        if (active) setConnected(false)
      })
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    if (stage === "chat" && (messages.length || busy))
      endRef.current?.scrollIntoView({ block: "nearest" })
  }, [messages.length, stage, busy])

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || busy || !connected || historyState !== "ready") return
    const text = draft.trim()
    const controller = new AbortController()
    requestRef.current = controller
    setSending(true)
    setNotice("")
    try {
      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]),
        body: JSON.stringify({
          message: text,
          profile,
          question:
            nextQuestion(profile, skipped)?.title ||
            "Review the draft; optional preferences only if the user wants to add them",
          history: messages.slice(-12),
        }),
      })
      if (!response.ok) {
        const failure = await response.json().catch(() => null)
        throw new Error(
          typeof failure?.error === "string"
            ? failure.error
            : "AI chat could not reply. Try again or switch to Questionnaire. Your message is still here.",
        )
      }
      const result = chatResultSchema.parse(await response.json())
      const merged = mergeProfile(profile, result.updates)
      update(result.updates)
      if (result.occupationSuggestions?.length) {
        setSuggestions(result.occupationSuggestions)
        setRoleDraft(merged)
      }
      setMessages((current) => [
        ...current,
        { role: "user" as const, text },
        { role: "assistant" as const, text: result.reply },
      ])
      setDraft("")
      if (!nextQuestion(merged, skipped) && merged.occupations.length) {
        setStage("review")
        toast.success("Your starting picture is ready to review")
      }
    } catch (error) {
      if (controller.signal.aborted) return
      const message =
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "Reply timed out. Try again or switch to Questionnaire. Your message is still here."
      setNotice(message)
      toast.error("Chat could not reply", { description: message })
    } finally {
      setSending(false)
    }
  }

  function showRadar() {
    if (!confirm()) {
      toast.info("Choose a supported occupation first", {
        description: "If you selected two roles, choose which takes most of your time.",
      })
      setEditing(true)
      return
    }
    toast.success("Your radar is ready", {
      description: profile.taskFocus
        ? "Using your confirmed role and task mix."
        : "Using occupation defaults; you can adjust the task mix in the Meter.",
    })
    router.push("/meter")
  }

  async function clearProfile() {
    setClearing(true)
    try {
      const response = await fetch("/api/onboarding/conversation", {
        method: "DELETE",
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) throw new Error("Your saved conversation could not be cleared. Try again.")
      clear()
      setSuggestions([])
      setRoleDraft(null)
      setMessages([])
      setDraft("")
      setStage("choose")
      setDetailed(false)
      setNotice("")
      setHistoryState("ready")
      toast.success("Profile and conversation cleared", {
        description:
          "Your tab answers, saved occupation choices, and conversation have been removed.",
      })
    } catch {
      toast.error("Could not clear your conversation", {
        description: "Your profile and chat were kept. Try again.",
      })
    } finally {
      setClearing(false)
    }
  }

  if (!ready)
    return (
      <div className="p-8 text-[16px] text-muted-foreground" role="status">
        Opening your workspace…
      </div>
    )
  return (
    <div className="grid min-h-[calc(100dvh-48px)] grid-cols-[minmax(0,1fr)_340px] max-[1150px]:grid-cols-[minmax(0,1fr)]">
      <section className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-6 py-3 max-[600px]:px-4 [&_button]:text-[13px]">
          <span className="flex items-center gap-2 text-[11px] tracking-[0.7px]">
            <span className={statusDot} />
            {stage === "chat"
              ? connected === null
                ? "CHECKING CHAT CONNECTION"
                : connected
                  ? `${providerLabel.toUpperCase()} · AI CHAT`
                  : "AI CHAT UNAVAILABLE"
              : stage === "questions"
                ? "QUESTIONNAIRE · NO AI REQUIRED"
                : "YOUR PERSONAL WORKSPACE"}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="outline" size="sm" asChild>
              <Link href="/meter">
                The Meter <ArrowRight />
              </Link>
            </Button>
            {stage !== "choose" && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setStage("choose")
                  setNotice("")
                }}
              >
                Change input mode
              </Button>
            )}
          </div>
        </div>
        <div className="m-auto max-w-[800px] px-10 pt-8 pb-[30px] max-[600px]:px-[22px] max-[600px]:py-7">
          {stage === "review" ? (
            <section
              className="rounded-md border border-[#d6c4cf] bg-mauve-tint-soft p-[26px] max-[650px]:p-[22px]"
              aria-label="Review your starting picture"
            >
              <span className={cn(chatEmblem, "mb-[18px]")}>
                {baselineReady ? <Check /> : <CircleHelp />}
              </span>
              <p className={eyebrow}>REVIEW BEFORE YOU CONTINUE</p>
              <h1 className="mt-[15px] mb-[22px] text-[clamp(30px,3vw,42px)] font-[450] leading-[1.15] tracking-[-1.4px]">
                {baselineReady
                  ? "Your starting picture is ready."
                  : profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
                    ? "Your role is recognised."
                    : "Choose a baseline for your radar."}
              </h1>
              {model ? (
                <>
                  <p className="text-[18px] font-medium leading-[1.6]">{model.title}</p>
                  <p className="mt-1.5 mb-[18px] text-[15px] leading-[1.7] text-muted-foreground">
                    {taskMix}
                  </p>
                  <p className="text-[14px] leading-[1.8] text-muted-foreground">
                    {profile.taskFocus
                      ? "Your role and task mix shape the calculation."
                      : "We can start with occupation defaults and refine your task mix later."}{" "}
                    Baseline uses illustrative task estimates, not a job-loss prediction.
                  </p>
                  <div className="mt-[22px] flex flex-wrap gap-3 [&>a]:min-h-[42px] [&>a]:text-[15px] [&_button]:min-h-[42px] [&_button]:text-[15px]">
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <PencilLine /> Review details
                    </Button>
                    <Button onClick={showRadar}>
                      View my Meter <ArrowRight />
                    </Button>
                  </div>
                  <p className={cn(fieldHelp, "mt-4")}>
                    Confirming opens the Meter, where your exposure is calculated from these inputs.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[14px] leading-[1.8] text-muted-foreground">
                    {profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
                      ? `${profile.occupationNames[profile.primaryOccupation]} is saved. Its exposure baseline is being prepared; occupation matching alone does not provide an exposure score.`
                      : profile.occupations.length > 1
                        ? "Choose which role takes most of your time."
                        : "Search for your occupation or describe your duties. We won’t invent an exposure score when no baseline exists."}{" "}
                    Your other preferences can remain unanswered.
                  </p>
                  <div className="mt-[22px] flex flex-wrap gap-3 [&>a]:min-h-[42px] [&>a]:text-[15px] [&_button]:min-h-[42px] [&_button]:text-[15px]">
                    <Button onClick={() => setEditing(true)}>
                      Choose my occupation <ArrowRight />
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/meter?example=1">Explore an example</Link>
                    </Button>
                  </div>
                </>
              )}
            </section>
          ) : (
            <div>
              <span className={chatEmblem}>
                <Sparkles strokeWidth={1.2} />
              </span>
              <p className={eyebrow}>YOUR NEXT MOVE STARTS WITH YOU</p>
              <h1 className="mt-4 text-[clamp(30px,3vw,44px)] font-[450] leading-[1.14] tracking-[-1.7px] wrap-anywhere max-[600px]:text-[34px]">
                {stage === "chat"
                  ? "Talk it through."
                  : stage === "questions"
                    ? "A few questions. At your pace."
                    : "Let’s understand your work."}
              </h1>
              <p className="mt-[18px] text-[16px] leading-[1.8] text-muted-foreground">
                {stage === "chat"
                  ? "Describe your work in your own words. We’ll ask one useful follow-up at a time."
                  : stage === "questions"
                    ? "Choose answers that fit. Skip what you don’t want to share."
                    : "Choose how you’d like to start. Both options build the same editable profile."}
              </p>
            </div>
          )}

          {stage === "choose" && (
            <>
              <div
                className="mt-[30px] mb-5 grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"
                aria-label="Choose your onboarding mode"
              >
                <button className={modeCard} onClick={() => setStage("chat")}>
                  <MessageCircle strokeWidth={1.4} />
                  <span className={cn(smallTag, "absolute top-6 right-4 text-[10px]")}>
                    RECOMMENDED
                  </span>
                  <h2>Talk it through</h2>
                  <p>An AI conversation about your work, priorities, and next step.</p>
                  <span className="mt-auto flex items-center gap-2.5 text-[14px] [&_svg]:size-[15px]">
                    Use AI Chat <ArrowRight />
                  </span>
                </button>
                <button
                  className={modeCard}
                  onClick={() => {
                    setDetailed(false)
                    setStage("questions")
                  }}
                >
                  <ClipboardList strokeWidth={1.4} />
                  <h2>Answer quick questions</h2>
                  <p>Structured questions with selectable answers. No AI conversation.</p>
                  <span className="mt-auto flex items-center gap-2.5 text-[14px] [&_svg]:size-[15px]">
                    Use Questionnaire <ArrowRight />
                  </span>
                </button>
              </div>
              <p className="mb-5 text-[14px] leading-[1.8] text-muted-foreground">
                Share what you’re comfortable with. Match your occupation first; Meter scores are
                available where a baseline exists.
              </p>
              {baselineReady && (
                <Button variant="outline" onClick={() => setStage("review")}>
                  Review existing answers <ArrowRight />
                </Button>
              )}
            </>
          )}

          {stage === "questions" && (
            <OnboardingQuestionnaire
              key={detailed ? "detailed" : "starting"}
              detailed={detailed}
              onReview={() => setStage("review")}
            />
          )}

          {stage === "chat" && (
            <>
              <div className="mt-7 flex flex-col gap-5" aria-label="Your conversation">
                {historyState === "loading" && (
                  <p role="status" className="text-[14px] text-muted-foreground">
                    Loading your conversation…
                  </p>
                )}
                {historyState === "error" && (
                  <div
                    className="mt-5 rounded-[5px] border p-[18px] [&_p]:mb-3 [&_p]:text-[14px] [&_p]:leading-[1.8]"
                    role="alert"
                  >
                    <p>
                      We couldn’t load your saved conversation. Retry before sending so your history
                      stays together.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setHistoryAttempt((attempt) => attempt + 1)}
                    >
                      Retry loading chat
                    </Button>
                  </div>
                )}
                {historyState === "ready" && !messages.length && (
                  <ChatBubble role="assistant">
                    <p>Hi, I’m Lumi.</p>
                    <p>
                      {profile.currentWork
                        ? "Tell me what you’d like to add or change. Your existing answers are already in your starting picture."
                        : "What work do you do, and what takes up most of your day? A few sentences is enough. You can leave out anything you don’t want to share."}
                    </p>
                  </ChatBubble>
                )}
                {messages.map((message, i) => (
                  <ChatBubble role={message.role} key={i}>
                    <p>{message.text}</p>
                  </ChatBubble>
                ))}
                {sending && (
                  <>
                    <ChatBubble role="user">
                      <p>{draft.trim()}</p>
                    </ChatBubble>
                    <ChatBubble role="assistant">
                      <div
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        className="text-[14px] text-muted-foreground"
                      >
                        <Orb variant="pulse" size={28} label="Lumi is thinking…" pill />
                      </div>
                    </ChatBubble>
                  </>
                )}
              </div>
              <div ref={endRef} />
              {connected === false && (
                <div className="mt-5 rounded-[5px] border p-[18px] [&_p]:mb-3 [&_p]:text-[14px] [&_p]:leading-[1.8]">
                  <p>
                    AI Chat is unavailable. You can continue with Questionnaire; your answers stay
                    with you.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailed(false)
                      setStage("questions")
                    }}
                  >
                    Use Questionnaire <ArrowRight />
                  </Button>
                </div>
              )}
              {(suggestions.length > 0 || (!profile.occupations.length && messages.length > 0)) && (
                <section
                  className="rounded-xl border p-4 my-5 space-y-3"
                  aria-label="Suggested occupations"
                >
                  <h2 className="text-[18px] font-medium">Which role fits your work?</h2>
                  <p className={fieldHelp}>
                    Lumi found these possibilities. Confirm your role separately from answering the
                    conversation above.
                  </p>
                  <OccupationPicker
                    profile={roleDraft ?? profile}
                    suggestions={suggestions}
                    onChange={(patch) =>
                      setRoleDraft((current) => mergeProfile(current ?? profile, patch))
                    }
                  />
                  <Button
                    disabled={busy || !(roleDraft ?? profile).occupations.length}
                    onClick={async () => {
                      setSavingRoles(true)
                      try {
                        const saved = await saveOccupations(roleDraft ?? profile)
                        update(saved)
                        setSuggestions([])
                        setRoleDraft(null)
                        toast.success("Occupation choices saved")
                        if (!nextQuestion(saved, skipped)) setStage("review")
                      } catch {
                        toast.error("Occupation choices could not be saved. Try again.")
                      } finally {
                        setSavingRoles(false)
                      }
                    }}
                  >
                    {savingRoles ? "Saving…" : "Save role choices"}
                  </Button>
                </section>
              )}
              <form
                className="mt-6 rounded-[7px] border border-input bg-background px-[15px] py-3 focus-within:border-mauve focus-within:shadow-[0_0_0_2px_#b69aa91a] [&_textarea]:max-h-60 [&_textarea]:min-h-[70px] [&_textarea]:resize-y [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:p-0 [&_textarea]:text-[16px] [&_textarea]:shadow-none [&_textarea]:focus-visible:shadow-none [&_textarea]:focus-visible:ring-0 [&_textarea]:focus-visible:outline-none"
                onSubmit={send}
              >
                <label htmlFor="career-message" className="sr-only">
                  Tell us about your work or update your profile
                </label>
                <Textarea
                  id="career-message"
                  maxLength={2000}
                  value={draft}
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Describe your work, or tell us what we missed…"
                />
                <div className="mt-2.5 flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={busy || !draft.trim() || !connected || historyState !== "ready"}
                    aria-label="Send message"
                  >
                    <ArrowUp />
                  </Button>
                </div>
              </form>
              {notice && (
                <p className="mt-[18px] border p-[15px] text-[14px] leading-[1.7]" role="alert">
                  {notice}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 [&_button]:text-[13px] [&_button]:text-muted-foreground">
                <Button variant="ghost" disabled={busy} onClick={() => setStage("review")}>
                  Review my starting picture <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {stage === "review" && (
            <div className="mt-6 text-[14px] leading-[1.8] text-muted-foreground [&_button]:text-[14px] [&>div]:mt-2.5 [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2">
              <p>
                Want to add more context? Your goals and preferences help shape a useful next step.
              </p>
              <div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDetailed(true)
                    setStage("questions")
                  }}
                >
                  Answer optional questions
                </Button>
                <Button variant="ghost" onClick={() => setStage("chat")}>
                  Continue AI Chat
                </Button>
              </div>
            </div>
          )}
          {workspaceReady && stage !== "chat" && stage !== "questions" && (
            <section
              className="mt-[30px] rounded-md border p-6 [&_a]:min-h-10 [&_a]:text-[14px] [&_button]:min-h-10 [&_button]:text-[14px]"
              aria-label="Your workspace"
            >
              <p className={eyebrow}>YOUR WORKSPACE</p>
              <h2 className="mt-2.5 text-[22px] font-[450] tracking-[-0.5px]">
                Manage your next step.
              </h2>
              <p className="mt-2 mb-5 text-[14px] leading-[1.8] text-muted-foreground">
                Shortcuts for your confirmed profile. These aren’t onboarding questions.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <PencilLine /> Update my profile
                </Button>
                <Button asChild variant="outline">
                  <Link href="/meter">
                    View my exposure <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/roadmap">
                    View my plan <ArrowRight />
                  </Link>
                </Button>
              </div>
            </section>
          )}
        </div>
      </section>
      <aside className="min-w-0 border-l bg-mauve-tint-faint px-6 py-7 max-[1150px]:border-t max-[1150px]:border-l-0 max-[1150px]:px-10 max-[1150px]:py-[30px] max-[1150px]:[&>button]:max-w-[420px] max-[600px]:px-[22px] max-[600px]:py-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex w-full items-center justify-between gap-2">
            <span className={eyebrow}>YOUR STARTING PICTURE</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label="Clear profile"
              title="Clear profile"
              disabled={busy || historyState === "loading"}
              onClick={clearProfile}
            >
              <RotateCcw />
            </Button>
          </div>
          <span className={cn(smallTag, "text-[10px]")}>
            {workspaceReady ? "CONFIRMED" : "DRAFT · REVIEW BEFORE USE"}
          </span>
        </div>
        <h2 className="mt-[26px] text-[27px] font-[450] tracking-[-0.9px] wrap-anywhere">
          {profile.preferredName || "A little more you."}
        </h2>
        <p className="mt-2.5 text-[14px] leading-[1.8] text-muted-foreground">
          Built from your answers. Always yours to correct.
        </p>
        <dl className="mt-5 max-[1150px]:grid max-[1150px]:grid-cols-2 max-[1150px]:gap-x-[25px] max-[600px]:grid-cols-1 [&_dd]:mt-1.5 [&_dd]:text-[15px] [&_dd]:leading-[1.7] [&_dd]:wrap-anywhere [&_dt]:text-[12px] [&_dt]:text-muted-foreground [&>div]:border-b [&>div]:py-[17px]">
          {[
            [
              "Your work",
              model?.title ||
                profile.occupationNames[profile.primaryOccupation] ||
                profile.currentWork ||
                "No work details yet",
            ],
            ["Your day-to-day work", profile.taskFocus ? taskMix : "Not shared yet"],
            ["What matters to you", profile.goals.join(" · ") || "Not shared yet"],
            ["Time for your next step", profile.hours || "At your own pace"],
            ...(profile.strengths.length
              ? [["Your strengths", profile.strengths.join(" · ")]]
              : []),
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className="line-clamp-3">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2 py-5 text-[13px] leading-[1.8] text-muted-foreground">
          <CircleHelp className="mt-[5px] size-4 shrink-0" />
          <p>
            {baselineReady
              ? profile.taskFocus
                ? "Your occupation and task mix are ready for the Meter. Other preferences shape your plan."
                : "Your role is ready for the Meter. We’ll start with default routine task weights; you can adjust them there."
              : profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
                ? "Your occupation is recognised and saved. Its exposure baseline is being prepared; no score is available yet."
                : profile.occupations.length > 1
                  ? "Choose your main role in Edit my profile before opening a personal radar."
                  : "No supported baseline selected. Your personal Meter stays empty until you choose one."}
          </p>
        </div>
        {baselineReady && stage !== "review" && (
          <Button className="w-full h-11 mb-3" disabled={busy} onClick={showRadar}>
            View my Meter <ArrowRight />
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full h-10"
          disabled={busy}
          onClick={() => setEditing(true)}
        >
          <PencilLine /> Edit my profile
        </Button>
        <p className="mt-[15px] text-[12px] leading-[1.8] text-muted-foreground">
          {storageAvailable
            ? "Profile saved in this browser tab. No account needed. Clear profile removes your answers."
            : "Browser storage is unavailable. Your profile lasts until you reload."}{" "}
          Your conversation is saved and restored in this browser. Clear profile also deletes this
          conversation.
        </p>
        <details className="mt-[18px] border-t pt-[15px] text-[13px] leading-[1.8] text-muted-foreground [&_p]:mt-2.5">
          <summary className="flex cursor-pointer items-center gap-2">
            <CircleHelp className="size-4" /> How your answers are used
          </summary>
          <p>
            AI Chat sends messages and your draft profile to{" "}
            {providerLabel === "Gemini" ? "Google (Gemini)" : providerLabel} for interpretation.
            Questionnaire answers and profile edits stay in this tab until included with a chat
            message. Share only what feels useful; concerns are optional.
          </p>
        </details>
      </aside>
      <ProfileSheet open={editing} onOpenChange={setEditing} onSaved={() => setStage("review")} />
    </div>
  )
}

function ChatBubble({ role, children }: { role: Message["role"]; children: ReactNode }) {
  const assistant = role === "assistant"
  return (
    <div
      className={cn(
        "flex items-start gap-3 text-[16px] leading-[1.7] wrap-anywhere",
        !assistant && "flex-row-reverse",
      )}
      aria-label={assistant ? "Lumi" : "You"}
    >
      <span
        className={cn(
          "mt-1 grid size-[30px] shrink-0 place-items-center rounded-full",
          assistant ? "bg-foreground text-background" : "border bg-muted text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {assistant ? <Bot size={16} /> : <UserRound size={16} />}
      </span>
      <div
        className={cn(
          "max-w-[85%] min-w-0 rounded-[14px] px-4 py-3 [&_p]:whitespace-pre-wrap",
          assistant ? "bg-muted" : "bg-foreground text-background",
        )}
      >
        <span className="mb-1 block text-[12px] leading-[1.5] font-semibold">
          {assistant ? "Lumi" : "You"}
        </span>
        {children}
      </div>
    </div>
  )
}
