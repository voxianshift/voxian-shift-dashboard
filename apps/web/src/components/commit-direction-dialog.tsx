"use client"

import { planScheduleSchema, weeklyDayMinutes, type PlanScheduleInput } from "@voxian/shared"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck, Loader2 } from "lucide-react"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  dayNames,
  commitmentSlots,
  defaultStudyDays,
  localDate,
  planStartDate,
  saveCommitment,
  slotEnd,
  studyDayOptions,
  timeOfDayOptions,
  weeklyHours,
  withProfile,
  type Commitment,
  type GeneratedPlan,
  type StudyDays,
  type TimeOfDay,
} from "@/lib/commitment"

export function CommitDirectionDialog({
  open,
  onOpenChange,
  pathId,
  direction,
  role,
  sprint,
  profile,
  generate,
  initial,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathId: string
  direction: string
  role: string | null
  sprint: boolean
  /** Weekly hours and constraints come from the profile, not from this dialog. */
  profile: { hours: string; flexibility: string; timeline: string }
  /** Generates the AI plan for this direction; omitted when only the schedule changes. */
  generate?: (schedule: PlanScheduleInput) => Promise<GeneratedPlan>
  /** Editing an existing commitment keeps its start date and completed sessions. */
  initial?: Commitment
  onSaved?: (commitment: Commitment) => void
}) {
  const router = useRouter()
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initial?.timeOfDay ?? "flexible")
  const today = localDate(new Date())
  const [startDate, setStartDate] = useState(initial?.startDate ?? planStartDate(profile.timeline))
  const [days, setDays] = useState<StudyDays>(
    initial?.days ?? defaultStudyDays(profile.flexibility),
  )
  const draft = withProfile(
    {
      version: 1,
      pathId,
      direction,
      role,
      sprint,
      hours: initial?.hours ?? "",
      timeOfDay,
      days,
      startDate,
      completed: initial?.completed ?? [],
    },
    profile,
  )
  const defaults: Record<string, number> = { "1–3 hours": 60, "3–5 hours": 180, "5+ hours": 300 }
  const [minuteOverride, setMinuteOverride] = useState<number | null>(
    initial?.plan?.plan.schedule?.weeklyMinutes ?? null,
  )
  const weeklyMinutes = minuteOverride ?? defaults[profile.hours] ?? 0
  const [timeZone, setTimeZone] = useState(
    () =>
      initial?.plan?.plan.schedule?.timeZone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      "Asia/Kuala_Lumpur",
  )
  const schedule = planScheduleSchema.safeParse({
    startDate,
    timeZone,
    weeklyMinutes,
    studyDays:
      days === "weekdays" ? [1, 2, 3, 4, 5] : days === "weekends" ? [6, 0] : [1, 2, 3, 4, 5, 6, 0],
    sessionLimitMinutes: draft.shortSessions ? 45 : days === "weekends" ? 180 : 90,
  })
  const slots = commitmentSlots(
    generate && schedule.success
      ? {
          ...draft,
          plan: {
            provider: "Preview",
            plan: { summary: "", firstStep: "", phases: [], schedule: schedule.data },
          },
        }
      : draft,
  )
  const fitsClock = slots.every((slot) => slotEnd(slot) > slot.start)
  const generation = useRef(0)
  useEffect(
    () => () => {
      generation.current++
    },
    [],
  )
  const [busy, setBusy] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [error, setError] = useState("")
  async function confirm() {
    const attempt = ++generation.current
    let plan = initial?.plan
    if (generate) {
      setBusy(true)
      setError("")
      try {
        if (!schedule.success || !fitsClock)
          throw new Error(
            "Confirm a valid start date, time zone and weekly minute budget (1–1200).",
          )
        plan = await generate(schedule.data)
        if (generation.current !== attempt) return
      } catch (failure) {
        setError(
          failure instanceof Error && failure.message
            ? failure.message
            : "Your plan could not be generated. Try again.",
        )
        return
      } finally {
        setBusy(false)
      }
    }
    const commitment: Commitment = {
      ...draft,
      flightPlan: plan?.plan.phases.flatMap((phase) => phase.flightPlan) ?? initial?.flightPlan,
      plan,
    }
    saveCommitment(commitment)
    onOpenChange(false)
    if (onSaved) onSaved(commitment)
    else router.push("/progress")
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Change your schedule" : `Commit to ${direction}`}</DialogTitle>
          <DialogDescription>
            {role ? `Focus role: ${role}. ` : ""}Tell us when you learn best and we will slot your{" "}
            {sprint ? "90" : "120"}-day plan into your week.
          </DialogDescription>
        </DialogHeader>
        <p className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-[14px]">
          <span>
            <span className="font-medium">Weekly study time:</span>{" "}
            {generate
              ? `${weeklyMinutes || "Set"} minutes per week, confirmed below`
              : !profile.hours
                ? "required. Set it in your preferences to continue."
                : profile.hours === "It varies"
                  ? `varies, so we plan about ${weeklyHours(draft.hours)} hours`
                  : `${profile.hours}, from your profile`}
            {draft.shortSessions ? " · short sessions" : ""}
          </span>
          <Button
            variant="link"
            disabled={busy}
            className="h-auto p-0 text-[14px]"
            onClick={() => setEditingProfile(true)}
          >
            Edit preferences
          </Button>
        </p>
        {generate && (
          <div className="space-y-3 rounded-lg border p-3 text-[14px]">
            <label className="block">
              Confirmed study minutes per week
              <Input
                disabled={busy}
                type="number"
                min={1}
                max={1200}
                value={weeklyMinutes || ""}
                onChange={(event) => setMinuteOverride(Number(event.target.value))}
              />
            </label>
            <p className="text-muted-foreground">
              Band defaults use the lower bound. Enter an exact budget for unknown or variable
              availability; clicking Start confirms it.
            </p>
            <label className="block">
              Time zone
              <Input
                disabled={busy}
                value={timeZone}
                onChange={(event) => setTimeZone(event.target.value)}
              />
            </label>
            <p>
              Sessions stay within {draft.shortSessions ? 45 : days === "weekends" ? 180 : 90}{" "}
              minutes; longer daily work is split into sessions.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-[14px]">
          <label htmlFor="plan-start" className="min-w-0">
            <span className="font-medium">Start date</span>
            <span className="block text-[12px] text-muted-foreground">
              {profile.timeline
                ? `Suggested from your timeline: ${profile.timeline}`
                : generate
                  ? "Choose the start date for this plan."
                  : "Timeline is required. Set it in your preferences."}
            </span>
          </label>
          <Input
            id="plan-start"
            disabled={busy}
            type="date"
            className="w-auto"
            value={startDate}
            min={initial ? undefined : today}
            onChange={(event) => event.target.value && setStartDate(event.target.value)}
          />
        </div>
        <Choice
          legend="When do you learn best?"
          value={timeOfDay}
          onChange={(value) => !busy && setTimeOfDay(value as TimeOfDay)}
          options={timeOfDayOptions}
        />
        <Choice
          legend="Which days?"
          value={days}
          onChange={(value) => !busy && setDays(value as StudyDays)}
          options={studyDayOptions}
        />
        <section aria-label="Your weekly schedule" className="rounded-lg bg-muted p-3 text-[14px]">
          <p className="font-medium">Your weekly slots</p>
          <ul className="mt-1.5 space-y-1 text-muted-foreground">
            {generate && schedule.success
              ? weeklyDayMinutes(schedule.data)
                  .filter((slot) => slot.minutes > 0)
                  .map((slot) => (
                    <li key={slot.day}>
                      {dayNames[slot.day]} · {slot.minutes} min
                    </li>
                  ))
              : slots.map((slot) => (
                  <li key={`${slot.day}-${slot.start}`} className="flex justify-between gap-3">
                    <span>{dayNames[slot.day]}</span>
                    <span className="font-mono">
                      {slot.start}–{slotEnd(slot)} · {slot.minutes} min
                    </span>
                  </li>
                ))}
          </ul>
        </section>
        {generate && !fitsClock && (
          <p role="alert" className="text-sm text-destructive">
            Study time crosses midnight. Choose an earlier time, more study days, or a smaller
            budget.
          </p>
        )}
        {error && (
          <p role="alert" className="text-[14px] text-destructive">
            {error}
          </p>
        )}
        {busy && (
          <p role="status" className="text-[14px] text-muted-foreground">
            Generating your personal plan and flight plan. This can take up to a minute.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              (generate ? !schedule.success || !fitsClock : !profile.hours || !profile.timeline)
            }
            onClick={confirm}
          >
            {busy ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
            {busy
              ? "Generating plan…"
              : initial
                ? "Save schedule"
                : error
                  ? "Try again"
                  : "Start my plan"}
          </Button>
        </DialogFooter>
        {/* Rendered inside the dialog so it stacks on top; Escape closes only the sheet. */}
        <ProfileSheet
          open={editingProfile}
          onOpenChange={setEditingProfile}
          defaultTab="preferences"
        />
      </DialogContent>
    </Dialog>
  )
}

function Choice({
  legend,
  value,
  onChange,
  options,
  columns = "grid-cols-1 sm:grid-cols-3",
}: {
  legend: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string; hint?: string }[]
  columns?: string
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[14px] font-medium">{legend}</legend>
      <RadioGroup value={value} onValueChange={onChange} className={columns}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-[14px] has-data-checked:border-foreground/60 has-data-checked:bg-muted"
          >
            <RadioGroupItem value={option.value} className="mt-0.5" />
            <span>
              <span className="block font-medium">{option.label}</span>
              {option.hint && (
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  {option.hint}
                </span>
              )}
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}
