"use client"

import { baselineIdForOccupation } from "@voxian/shared"

import { useState } from "react"
import { ArrowRight, Check, Compass, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { MILESTONES } from "@/lib/mock"
import { useCareerProfile } from "@/components/career-profile-provider"
import { occupationModels } from "@/lib/occupations"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { editorialPage, eyebrow, segmentButton, segmentControl, smallTag } from "@/lib/styles"

export default function RoadmapPage() {
  const { profile, confirmed } = useCareerProfile()
  const model = confirmed
    ? occupationModels.find((m) => m.id === baselineIdForOccupation(profile.primaryOccupation))
    : occupationModels[0]
  const branches = model?.branches || occupationModels[0].branches
  const recommended =
    profile.strengths.includes("Solving problems") || profile.direction === "Stay and adapt"
      ? 0
      : profile.strengths.includes("Spotting mistakes")
        ? 2
        : 1
  const [branchOverride, setBranch] = useState<number | null>(null)
  const [paceOverride, setSprint] = useState<boolean | null>(null)
  const branch = branchOverride ?? recommended
  const sprint = paceOverride ?? (confirmed && profile.hours === "5+ hours")
  const [locked, setLocked] = useState(false)
  const selected = branches[branch]!
  return (
    <div className={editorialPage}>
      <PanelHeading kicker="03 / NAVIGATOR" title="One starting point. More than one future.">
        Your existing skills are a starting point. Explore three possible directions,
        <br />
        then turn one into a practical next step.
      </PanelHeading>
      {confirmed && (
        <div className="mb-5 bg-muted p-[18px] text-[14px] leading-[1.8] [&_a]:underline [&_a]:underline-offset-3">
          <p>
            {profile.goals.length
              ? `Your priorities: ${profile.goals.join(" · ")}`
              : "Your priorities are still open."}{" "}
            {profile.timeline && `Preferred timing: ${profile.timeline}.`}{" "}
            {profile.risk && `Comfort with change: ${profile.risk}.`}
          </p>
          {!model && (
            <p>
              These are customer-support example paths, not personalized matches for your
              occupation.
            </p>
          )}
          <Link href="/home">Update your profile</Link>
        </div>
      )}
      <div className="grid grid-cols-[1fr_2fr] gap-[65px] border-y bg-[radial-gradient(circle,#b69aa929_1px,transparent_1px)] bg-size-[16px_16px] px-10 py-8 max-[700px]:grid-cols-1 max-[700px]:gap-[25px] max-[700px]:px-2.5 max-[700px]:py-[25px]">
        <div className="flex flex-col items-center justify-center text-center text-[16px] leading-[1.7]">
          <Compass strokeWidth={1} className="size-8 text-[#a28a9a]" />
          <span className={cn(eyebrow, "mt-3")}>YOU ARE HERE</span>
          <p>{model?.title || profile.currentWork || "Your starting point"}</p>
          <span className={cn(smallTag, "mt-3")}>DAY 0</span>
        </div>
        <div className="flex flex-col gap-3.5">
          {branches.map((b, i) => (
            <button
              key={b.name}
              aria-pressed={branch === i}
              onClick={() => {
                setBranch(i)
                setLocked(false)
              }}
              className={cn(
                "flex items-center gap-4 border bg-background p-[17px] text-left",
                branch === i && "border-mauve bg-mauve-tint",
              )}
            >
              <GitBranch className="size-5" strokeWidth={1.3} />
              <span>
                <span className={eyebrow}>
                  PATH 0{i + 1} / {b.fit.toUpperCase()}
                </span>
                <strong className="my-[5px] block text-[16px] font-medium">{b.name}</strong>
                <small className="text-[14px] text-muted-foreground">{b.roles[0]}</small>
              </span>
              <ArrowRight className="ml-auto size-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-[30px] flex items-center justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <p className={eyebrow}>YOUR SELECTED DIRECTION</p>
          <h2 className="mt-[5px] text-[24px] tracking-[-0.8px]">{selected.name}</h2>
        </div>
        <div className={segmentControl}>
          <Button
            variant="ghost"
            className={segmentButton}
            aria-pressed={!sprint}
            onClick={() => setSprint(false)}
          >
            Paced · 120 days
          </Button>
          <Button
            variant="ghost"
            className={segmentButton}
            aria-pressed={sprint}
            onClick={() => setSprint(true)}
          >
            Sprint · 90 days
          </Button>
        </div>
      </div>
      <div className="my-[22px] flex flex-wrap gap-3.5 text-[14px]">
        {selected.roles.map((r, i) => (
          <span key={r} className="flex items-center gap-3.5">
            {i > 0 && <ArrowRight className="size-3 text-muted-foreground" />}
            {r}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 border-y max-[700px]:grid-cols-1 max-[700px]:gap-[15px]">
        {MILESTONES.map((m, i) => (
          <section
            key={m.phase}
            className={cn(
              "px-5 py-6 max-[700px]:px-0 max-[700px]:py-5",
              i === 0 ? "pl-0" : "border-l max-[700px]:border-t max-[700px]:border-l-0",
            )}
          >
            <span className={eyebrow}>
              PHASE 0{i + 1} ·{" "}
              {sprint ? ["DAYS 1–20", "DAYS 21–55", "DAYS 56–90"][i] : m.days.toUpperCase()}
            </span>
            <h3 className="mt-3.5 mb-2.5 text-[15px]">{m.phase}</h3>
            <p className="text-[16px] leading-[1.9] text-muted-foreground">
              {i === 0
                ? "Audit routine work and identify tasks you can delegate to AI with human review."
                : i === 1
                  ? `Build a small, reviewed project around ${selected.roles[0]!.toLowerCase()} skills. Document where human judgment improves the result.`
                  : `Use your project to start a career conversation about ${selected.roles[0]}. Collect feedback and choose your next learning goal.`}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-[25px] flex items-center justify-between gap-5 text-[14px]">
        <p>
          Suggested plan · {sprint ? "90" : "120"} days
          <br />
          <span className="text-[13px] text-muted-foreground">
            {confirmed && profile.hours ? `Your availability: ${profile.hours} per week. ` : ""}Demo
            guidance; adjust steps to your schedule.
          </span>
        </p>
        <Button onClick={() => setLocked(!locked)}>
          {locked ? <Check /> : <Compass />}
          {locked ? "Direction selected" : "Choose this direction"}
        </Button>
      </div>
      {locked && (
        <p role="status" className="mt-4 text-[14px] text-muted-foreground">
          {selected.name} selected for this session. Start with your task audit in phase 1.
        </p>
      )}
    </div>
  )
}
