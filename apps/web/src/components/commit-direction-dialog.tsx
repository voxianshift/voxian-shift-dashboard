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
  const [dayStartTimes, setDayStartTimes] = useState<Commitment["dayStartTimes"]>(
    initial?.dayStartTimes ?? {},
  )
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [timeDraft, setTimeDraft] = useState("")
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
      dayStartTimes,
      days,
      startDate,
      completed: initial?.completed ?? [],
    },
    profile,
  )
  const [hourOverride, setHourOverride] = useState<number | null>(
    initial?.plan?.plan.schedule ? initial.plan.plan.schedule.weeklyMinutes / 60 : null,
  )
  const hours =
    hourOverride ?? (profile.hours === "Under 1 hour" ? 0.5 : weeklyHours(profile.hours))
  const weeklyMinutes = Math.round(hours * 60)
  const [timeZone, setTimeZone] = useState("UTC")
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
  }, [])
  const [dayMinutes, setDayMinutes] = useState<Record<string, number> | null>(
    initial?.plan?.plan.schedule?.dayMinutes ?? null,
  )
  const [editingMinutes, setEditingMinutes] = useState<number | null>(null)
  const [minuteDraft, setMinuteDraft] = useState("")
  const studyDays =
    days === "weekdays" ? [1, 2, 3, 4, 5] : days === "weekends" ? [6, 0] : [1, 2, 3, 4, 5, 6, 0]
  const previewSchedule: PlanScheduleInput = {
    startDate,
    timeZone,
    weeklyMinutes,
    studyDays,
    sessionLimitMinutes: draft.shortSessions ? 30 : days === "weekends" ? 180 : 90,
    ...(dayMinutes
      ? { dayMinutes: Object.fromEntries(studyDays.map((day) => [day, dayMinutes[day] ?? 0])) }
      : {}),
  }
  const allocations = weeklyDayMinutes(previewSchedule)
  const minutesLeft = weeklyMinutes - allocations.reduce((total, slot) => total + slot.minutes, 0)
  const schedule = planScheduleSchema
    .refine((value) => value.weeklyMinutes % 30 === 0)
    .safeParse(previewSchedule)
  const slots = commitmentSlots(
    generate || initial?.plan?.plan.schedule
      ? {
          ...draft,
          plan: {
            provider: "Preview",
            plan: { summary: "", firstStep: "", phases: [], schedule: previewSchedule },
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
    if (busy || minutesLeft !== 0 || editingMinutes !== null) return
    const attempt = ++generation.current
    let plan = initial?.plan
    setBusy(true)
    setError("")
    try {
      if (generate || initial?.plan?.plan.schedule) {
        if (!schedule.success || !fitsClock || minutesLeft !== 0)
          throw new Error(
            "Choose a valid start date and study hours in half-hour steps, up to 20 hours per week.",
          )
        plan = generate
          ? await generate(schedule.data)
          : { ...initial!.plan!, plan: { ...initial!.plan!.plan, schedule: schedule.data } }
        if (generation.current !== attempt) return
      }
      const commitment: Commitment = {
        ...draft,
        flightPlan: plan?.plan.phases.flatMap((phase) => phase.flightPlan) ?? initial?.flightPlan,
        plan,
      }
      await saveCommitment(commitment)
      if (generation.current !== attempt) return
      onOpenChange(false)
      if (onSaved) onSaved(commitment)
      else router.push("/progress")
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Your plan could not be saved. Try again.",
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="shrink-0 border-b p-5 pr-12">
          <DialogTitle>{initial ? "Change your schedule" : `Commit to ${direction}`}</DialogTitle>
          <DialogDescription>
            {role ? `Focus role: ${role}. ` : ""}Tell us when you learn best and we will slot your{" "}
            {sprint ? "90" : "120"}-day plan into your week.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-[14px]">
            <span>
              <span className="font-medium">Weekly study time:</span>{" "}
              {generate
                ? `${hours} hours per week`
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
                Study hours per week
                <Input
                  disabled={busy}
                  type="number"
                  min={0.5}
                  max={20}
                  step={0.5}
                  value={hours || ""}
                  onChange={(event) => setHourOverride(Number(event.target.value))}
                />
              </label>
              <p className="text-muted-foreground">
                Prefilled from your preferences. Adjust in half-hour steps.
              </p>
              <p className="text-muted-foreground">Device time zone: {timeZone}</p>
              <p>
                Sessions stay within {draft.shortSessions ? 30 : days === "weekends" ? 180 : 90}{" "}
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
          <section
            aria-label="Your weekly schedule"
            className="rounded-xl border border-border bg-background p-4 text-[14px]"
          >
            <p className="font-medium">Your weekly slots</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px]">
              <p className="text-muted-foreground">
                {timeZone} · {hours} hours per week
              </p>
              <p aria-live="polite" className="ml-auto text-right font-medium text-destructive">
                {minutesLeft > 0
                  ? `${minutesLeft} min left to allocate`
                  : minutesLeft < 0
                    ? `${Math.abs(minutesLeft)} min over budget`
                    : null}
              </p>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const daySlots = slots.filter((slot) => slot.day === day)
                const allocated = allocations.find((slot) => slot.day === day)?.minutes ?? 0
                return (
                  <li
                    key={day}
                    className={`rounded-lg border p-3 ${daySlots.length ? "border-brand/60 bg-card text-foreground ring-1 ring-brand/20" : "border-border bg-muted/40 text-muted-foreground"}`}
                  >
                    <p className="font-medium">{dayNames[day]}</p>
                    {daySlots.length ? (
                      <div className="mt-1 text-[12px]">
                        <div className="flex h-6 items-center font-mono tabular-nums">
                          {timeOfDay === "flexible" ? (
                            editingDay === day ? (
                              <>
                                <Input
                                  autoFocus
                                  aria-label={`${dayNames[day]} start time`}
                                  inputMode="numeric"
                                  maxLength={5}
                                  placeholder="HH:MM"
                                  value={timeDraft}
                                  onChange={(event) => setTimeDraft(event.target.value)}
                                  onBlur={(event) => {
                                    // Native type="time" follows the OS 12/24h locale; force 24h text.
                                    const match = /^([01]?\d|2[0-3]):?([0-5]\d)$/.exec(
                                      event.currentTarget.value.trim(),
                                    )
                                    const value = match
                                      ? `${match[1]!.padStart(2, "0")}:${match[2]}`
                                      : null
                                    if (value)
                                      setDayStartTimes((current) => ({ ...current, [day]: value }))
                                    setEditingDay(null)
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault()
                                      event.currentTarget.blur()
                                    }
                                    if (event.key === "Escape") {
                                      event.preventDefault()
                                      event.stopPropagation()
                                      setEditingDay(null)
                                    }
                                  }}
                                  className="h-6 w-[5ch] shrink-0 rounded-none border-0 bg-transparent p-0 font-mono text-[12px] leading-6 shadow-none focus-visible:ring-0 md:text-[12px] dark:bg-transparent"
                                />
                                <span>–{slotEnd(daySlots.at(-1)!)}</span>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                aria-label={`Edit ${dayNames[day]} study time`}
                                className="h-6 cursor-pointer p-0 text-left underline decoration-muted-foreground/60 underline-offset-4 hover:decoration-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                                onClick={() => {
                                  setTimeDraft(daySlots[0]!.start)
                                  setEditingDay(day)
                                }}
                              >
                                {daySlots[0]!.start}–{slotEnd(daySlots.at(-1)!)}
                              </button>
                            )
                          ) : (
                            <span>
                              {daySlots[0]!.start}–{slotEnd(daySlots.at(-1)!)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-[12px]">Rest day</p>
                    )}
                    {studyDays.includes(day) && (
                      <div className="flex h-6 items-center text-[12px] text-muted-foreground">
                        {editingMinutes === day ? (
                          <>
                            <Input
                              autoFocus
                              aria-label={`${dayNames[day]} study minutes`}
                              type="number"
                              min={0}
                              max={1200}
                              step={30}
                              value={minuteDraft}
                              onChange={(event) => setMinuteDraft(event.target.value)}
                              onBlur={(event) => {
                                const value = Number(event.currentTarget.value)
                                if (
                                  event.currentTarget.value !== "" &&
                                  Number.isInteger(value) &&
                                  value >= 0 &&
                                  value <= 1200 &&
                                  value % 30 === 0
                                )
                                  setDayMinutes(
                                    Object.fromEntries(
                                      allocations.map((slot) => [
                                        slot.day,
                                        slot.day === day ? value : slot.minutes,
                                      ]),
                                    ),
                                  )
                                setEditingMinutes(null)
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault()
                                  event.currentTarget.blur()
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  setEditingMinutes(null)
                                }
                              }}
                              className="h-6 w-[4ch] rounded-none border-0 bg-transparent p-0 text-[12px] shadow-none focus-visible:ring-0 md:text-[12px] dark:bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span> min</span>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            aria-label={`Edit ${dayNames[day]} study minutes`}
                            className="h-6 cursor-pointer p-0 underline decoration-muted-foreground/60 underline-offset-4 hover:decoration-foreground"
                            onClick={() => {
                              setMinuteDraft(String(allocated))
                              setEditingMinutes(day)
                            }}
                          >
                            {allocated} min
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
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
        </div>
        <DialogFooter className="m-0 shrink-0 p-5">
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              minutesLeft !== 0 ||
              editingMinutes !== null ||
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
