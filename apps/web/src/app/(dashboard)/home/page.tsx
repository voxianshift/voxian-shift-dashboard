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

const conversationSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })),
})
type Message = z.infer<typeof conversationSchema>["messages"][number]
type Stage = "choose" | "chat" | "questions" | "review"

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
    <div className="onboarding-layout">
      <section className="onboarding-main">
        <div className="onboarding-toolbar">
          <span>
            <span className="status-dot" />
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
        <div className="onboarding-content">
          {stage === "review" ? (
            <section className="radar-review" aria-label="Review your starting picture">
              <span className="chat-emblem">{baselineReady ? <Check /> : <CircleHelp />}</span>
              <p className="eyebrow">REVIEW BEFORE YOU CONTINUE</p>
              <h1>
                {baselineReady
                  ? "Your starting picture is ready."
                  : profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
                    ? "Your role is recognised."
                    : "Choose a baseline for your radar."}
              </h1>
              {model ? (
                <>
                  <p className="review-role">{model.title}</p>
                  <p className="review-task-mix">{taskMix}</p>
                  <p className="question-help">
                    {profile.taskFocus
                      ? "Your role and task mix shape the calculation."
                      : "We can start with occupation defaults and refine your task mix later."}{" "}
                    Baseline uses illustrative task estimates, not a job-loss prediction.
                  </p>
                  <div className="review-actions">
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <PencilLine /> Review details
                    </Button>
                    <Button onClick={showRadar}>
                      View my Meter <ArrowRight />
                    </Button>
                  </div>
                  <p className="field-help mt-4">
                    Confirming opens the Meter, where your exposure is calculated from these inputs.
                  </p>
                </>
              ) : (
                <>
                  <p className="question-help">
                    {profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
                      ? `${profile.occupationNames[profile.primaryOccupation]} is saved. Its exposure baseline is being prepared; occupation matching alone does not provide an exposure score.`
                      : profile.occupations.length > 1
                        ? "Choose which role takes most of your time."
                        : "Search for your occupation or describe your duties. We won’t invent an exposure score when no baseline exists."}{" "}
                    Your other preferences can remain unanswered.
                  </p>
                  <div className="review-actions">
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
            <div className="onboarding-heading">
              <span className="chat-emblem">
                <Sparkles strokeWidth={1.2} />
              </span>
              <p className="eyebrow">YOUR NEXT MOVE STARTS WITH YOU</p>
              <h1>
                {stage === "chat"
                  ? "Talk it through."
                  : stage === "questions"
                    ? "A few questions. At your pace."
                    : "Let’s understand your work."}
              </h1>
              <p>
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
              <div className="onboarding-mode-grid" aria-label="Choose your onboarding mode">
                <button className="onboarding-mode-card" onClick={() => setStage("chat")}>
                  <MessageCircle strokeWidth={1.4} />
                  <span className="small-tag">RECOMMENDED</span>
                  <h2>Talk it through</h2>
                  <p>An AI conversation about your work, priorities, and next step.</p>
                  <span className="mode-card-action">
                    Use AI Chat <ArrowRight />
                  </span>
                </button>
                <button
                  className="onboarding-mode-card"
                  onClick={() => {
                    setDetailed(false)
                    setStage("questions")
                  }}
                >
                  <ClipboardList strokeWidth={1.4} />
                  <h2>Answer quick questions</h2>
                  <p>Structured questions with selectable answers. No AI conversation.</p>
                  <span className="mode-card-action">
                    Use Questionnaire <ArrowRight />
                  </span>
                </button>
              </div>
              <p className="onboarding-requirement">
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
              <div className="chat-transcript" aria-label="Your conversation">
                {historyState === "loading" && (
                  <p role="status" className="chat-thinking">
                    Loading your conversation…
                  </p>
                )}
                {historyState === "error" && (
                  <div className="chat-unavailable" role="alert">
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
                        className="chat-thinking"
                      >
                        <Orb variant="pulse" size={28} label="Lumi is thinking…" pill />
                      </div>
                    </ChatBubble>
                  </>
                )}
              </div>
              <div ref={endRef} />
              {connected === false && (
                <div className="chat-unavailable">
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
                  <p className="field-help">
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
              <form className="chat-composer" onSubmit={send}>
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
                <div className="justify-end flex">
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
                <p className="onboarding-notice" role="alert">
                  {notice}
                </p>
              )}
              <div className="chat-secondary">
                <Button variant="ghost" disabled={busy} onClick={() => setStage("review")}>
                  Review my starting picture <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {stage === "review" && (
            <div className="review-more">
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
            <section className="workspace-actions-card" aria-label="Your workspace">
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h2>Manage your next step.</h2>
              <p>Shortcuts for your confirmed profile. These aren’t onboarding questions.</p>
              <div>
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
      <aside className="profile-aside">
        <div className="profile-aside-heading">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="eyebrow">YOUR STARTING PICTURE</span>
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
          <span className="small-tag">
            {workspaceReady ? "CONFIRMED" : "DRAFT · REVIEW BEFORE USE"}
          </span>
        </div>
        <h2>{profile.preferredName || "A little more you."}</h2>
        <p className="profile-intro">Built from your answers. Always yours to correct.</p>
        <dl className="profile-summary">
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
        <div className="baseline-note">
          <CircleHelp className="size-4 shrink-0" />
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
        <p className="profile-storage">
          {storageAvailable
            ? "Profile saved in this browser tab. No account needed. Clear profile removes your answers."
            : "Browser storage is unavailable. Your profile lasts until you reload."}{" "}
          Your conversation is saved and restored in this browser. Clear profile also deletes this
          conversation.
        </p>
        <details className="privacy-details">
          <summary>
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
    <div className={`chat-message ${role}`} aria-label={assistant ? "Lumi" : "You"}>
      <span className="chat-avatar" aria-hidden="true">
        {assistant ? <Bot size={16} /> : <UserRound size={16} />}
      </span>
      <div className="chat-bubble">
        <span className="chat-sender">{assistant ? "Lumi" : "You"}</span>
        {children}
      </div>
    </div>
  )
}
