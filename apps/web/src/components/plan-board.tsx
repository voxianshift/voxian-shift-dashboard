"use client"

import { planResource } from "@voxian/shared"
import { ArrowUpRight, Check, Lock, Undo2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  commitmentSlots,
  planBoard,
  slotEnd,
  type BoardItem,
  type BoardStatus,
  type Commitment,
} from "@/lib/commitment"

const tabs: { id: BoardStatus; label: string; empty: string }[] = [
  { id: "inProgress", label: "In Progress", empty: "Nothing is due right now." },
  { id: "missed", label: "Missed", empty: "No missed sessions. Nice." },
  { id: "upcoming", label: "Upcoming", empty: "Nothing left to schedule." },
  { id: "past", label: "Past", empty: "Logged sessions will appear here." },
]
const badge: Record<BoardStatus, string> = {
  inProgress: "border-brand/40 bg-brand/10 text-brand-ink",
  missed: "border-destructive/40 bg-destructive/10 text-destructive",
  upcoming: "border-foreground/20 text-muted-foreground",
  past: "border-success/40 bg-success/10 text-success",
}

const shortDate = (date: string) =>
  new Date(`${date}T00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

export function PlanBoard({
  commitment,
  today,
  saving,
  logLocked,
  onToggle,
}: {
  commitment: Commitment
  today: string
  saving: boolean
  /** Today's session is still more than 30 minutes away. */
  logLocked: boolean
  onToggle: (date: string) => void
}) {
  const { phases, items } = planBoard(commitment, today)
  const requested = useSearchParams().get("tab")
  const [tab, setTab] = useState<string | null>(null)
  // The sidebar's "missed" link can land here while Progress is already open.
  useEffect(() => {
    if (requested) setTab(requested)
  }, [requested])
  if (!phases.length && !items.length) return null
  const slots = commitmentSlots(commitment)
  const when = (item: BoardItem) => {
    if (item.dates.length > 1)
      return `${shortDate(item.dates[0]!)} – ${shortDate(item.dates.at(-1)!)} · ${item.dates.length} sessions`
    const date = item.dates[0]!
    const daySlots = slots.filter((slot) => slot.day === new Date(`${date}T00:00`).getDay())
    return daySlots.length
      ? `${shortDate(date)} · ${daySlots[0]!.start}–${slotEnd(daySlots.at(-1)!)}`
      : shortDate(date)
  }
  const done = new Set(commitment.completed)
  const counts = Object.fromEntries(
    tabs.map(({ id }) => [
      id,
      items.filter((item) => item.status === id).length +
        phases.filter((phase) => phase.status === id).length,
    ]),
  ) as Record<BoardStatus, number>
  const initial = tabs.find(({ id }) => counts[id])?.id ?? "upcoming"

  function action(item: BoardItem) {
    const resource = planResource(commitment.plan?.plan, item.resourceId)
    if (item.status === "missed") {
      const date = item.dates.find((day) => day < today && !done.has(day))!
      return (
        <Button size="sm" variant="outline" disabled={saving} onClick={() => onToggle(date)}>
          <Check /> Mark {shortDate(date)} attended
        </Button>
      )
    }
    if (item.status === "past") {
      const date = item.dates.findLast((day) => done.has(day))!
      return (
        <Button size="sm" variant="ghost" disabled={saving} onClick={() => onToggle(date)}>
          <Undo2 /> Undo
        </Button>
      )
    }
    if (item.status === "inProgress" && item.dates.includes(today) && !done.has(today))
      return (
        <Button size="sm" disabled={saving || logLocked} onClick={() => onToggle(today)}>
          {logLocked ? <Lock /> : <Check />}{" "}
          {logLocked ? "Unlocks 30 min before session" : "Log session"}
        </Button>
      )
    if (item.status === "upcoming" && resource?.href)
      return (
        <Button size="sm" variant="outline" asChild>
          <a href={resource.href} target="_blank" rel="noreferrer">
            Prepare <ArrowUpRight />
          </a>
        </Button>
      )
    return null
  }

  return (
    <section aria-labelledby="board-title" className="mt-4 rounded-xl border p-5">
      <h2 id="board-title" className="text-[18px] tracking-[-0.4px]">
        Plan tasks
      </h2>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Phases, daily tasks and weekly milestones, sorted by where they stand today.
      </p>
      <Tabs value={tab ?? initial} onValueChange={setTab} className="mt-3">
        <TabsList className="max-w-full flex-wrap group-data-horizontal/tabs:h-auto">
          {tabs.map(({ id, label }) => (
            <TabsTrigger key={id} value={id} disabled={!counts[id]}>
              {label} ({counts[id]})
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(({ id, empty }) => {
          const tabPhases = phases.filter((phase) => phase.status === id)
          const tabItems = items.filter((item) => item.status === id)
          return (
            <TabsContent key={id} value={id}>
              {!tabPhases.length && !tabItems.length && (
                <p className="py-4 text-muted-foreground">{empty}</p>
              )}
              <ul className="mt-2 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                {tabPhases.map((phase) => {
                  const next = items.find(
                    (item) =>
                      item.phase === phase.index &&
                      (item.status === "inProgress" || item.status === "upcoming"),
                  )
                  return (
                    <li
                      key={`phase-${phase.index}`}
                      className="col-span-full rounded-lg border border-foreground/30 bg-muted/50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Phase 0{phase.index + 1}</Badge>
                        <p className="font-medium">{phase.title}</p>
                        <span className="ml-auto font-mono text-[12px] text-muted-foreground">
                          {phase.done} of {phase.total} sessions
                        </span>
                      </div>
                      <p className="mt-2 text-[13px]">
                        <span className="text-muted-foreground">Goal: </span>
                        {phase.deliverable}
                      </p>
                      {phase.resources.length > 0 && (
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          Main resources:{" "}
                          {phase.resources
                            .map(
                              (resourceId) =>
                                planResource(commitment.plan?.plan, resourceId)?.title,
                            )
                            .join(" · ")}
                        </p>
                      )}
                      {next && (
                        <p className="mt-1 text-[13px] text-muted-foreground">Next: {next.title}</p>
                      )}
                    </li>
                  )
                })}
                {tabItems.map((item) => {
                  const resource = planResource(commitment.plan?.plan, item.resourceId)
                  const phase = phases[item.phase]
                  return (
                    <li key={item.id} className="flex flex-col gap-2 rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2 text-[12px]">
                        <Badge variant="outline" className={badge[item.status]}>
                          {tabs.find((tab) => tab.id === item.status)!.label}
                        </Badge>
                        <span className="font-mono text-muted-foreground">{when(item)}</span>
                      </div>
                      <p className="font-medium">{item.title}</p>
                      {item.doneWhen && (
                        <p className="text-[13px]">
                          <span className="text-muted-foreground">Done when: </span>
                          {item.doneWhen}
                        </p>
                      )}
                      {phase && (
                        <p className="text-[12px] text-muted-foreground">
                          Builds toward: {phase.deliverable}
                        </p>
                      )}
                      {resource && (
                        <div className="rounded-md bg-muted px-3 py-2 text-[13px]">
                          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                            {item.suggested ? "Suggested for this phase" : "Recommended resource"}
                          </p>
                          <a
                            href={resource.href ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                          >
                            {resource.title} <ArrowUpRight className="size-3.5" />
                          </a>
                          <p className="text-[12px] text-muted-foreground">
                            {resource.detail} · {resource.cost}
                          </p>
                          {resource.note && (
                            <p className="mt-1 text-[12px] text-muted-foreground">
                              {resource.note}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="mt-auto flex justify-end">{action(item)}</div>
                    </li>
                  )
                })}
              </ul>
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}
