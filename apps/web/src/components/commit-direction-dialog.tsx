"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FlightSegment } from "@/lib/flight-plan"
import {
  dayNames,
  hourOptions,
  localDate,
  saveCommitment,
  slotEnd,
  studyDayOptions,
  timeOfDayOptions,
  weeklyHours,
  weeklySlots,
  type Commitment,
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
  profileHours,
  flightPlan,
  initial,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathId: string
  direction: string
  role: string | null
  sprint: boolean
  profileHours: string
  flightPlan?: FlightSegment[]
  /** Editing an existing commitment keeps its start date and completed sessions. */
  initial?: Commitment
  onSaved?: (commitment: Commitment) => void
}) {
  const router = useRouter()
  const [hours, setHours] = useState<string>(
    initial?.hours ??
      ((hourOptions as readonly string[]).includes(profileHours) ? profileHours : "1–3 hours"),
  )
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initial?.timeOfDay ?? "flexible")
  const [days, setDays] = useState<StudyDays>(initial?.days ?? "flexible")
  const slots = weeklySlots(weeklyHours(hours), timeOfDay, days)
  function confirm() {
    const commitment: Commitment = {
      version: 1,
      pathId,
      direction,
      role,
      sprint,
      hours,
      timeOfDay,
      days,
      startDate: initial?.startDate ?? localDate(new Date()),
      completed: initial?.completed ?? [],
      flightPlan: flightPlan ?? initial?.flightPlan,
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
        <Choice
          legend="Weekly study time"
          value={hours}
          onChange={setHours}
          options={hourOptions.map((value) => ({ value, label: value }))}
          columns="grid-cols-2 sm:grid-cols-4"
        />
        <Choice
          legend="When do you learn best?"
          value={timeOfDay}
          onChange={(value) => setTimeOfDay(value as TimeOfDay)}
          options={timeOfDayOptions}
        />
        <Choice
          legend="Which days?"
          value={days}
          onChange={(value) => setDays(value as StudyDays)}
          options={studyDayOptions}
        />
        <section aria-label="Your weekly schedule" className="rounded-lg bg-muted p-3 text-[14px]">
          <p className="font-medium">Your weekly slots</p>
          <ul className="mt-1.5 space-y-1 text-muted-foreground">
            {slots.map((slot) => (
              <li key={slot.day} className="flex justify-between gap-3">
                <span>{dayNames[slot.day]}</span>
                <span className="font-mono">
                  {slot.start}–{slotEnd(slot)} · {slot.minutes} min
                </span>
              </li>
            ))}
          </ul>
        </section>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirm}>
            <CalendarCheck /> {initial ? "Save schedule" : "Start my plan"}
          </Button>
        </DialogFooter>
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
