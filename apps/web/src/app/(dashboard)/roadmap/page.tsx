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
    <div className="editorial-page">
      <PanelHeading kicker="03 / NAVIGATOR" title="One starting point. More than one future.">
        Your existing skills are a starting point. Explore three possible directions,
        <br />
        then turn one into a practical next step.
      </PanelHeading>
      {confirmed && (
        <div className="navigator-profile-note">
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
      <div className="navigator-map">
        <div className="present-node">
          <Compass strokeWidth={1} className="size-8" />
          <span className="eyebrow mt-3">YOU ARE HERE</span>
          <p>{model?.title || profile.currentWork || "Your starting point"}</p>
          <span className="small-tag mt-3">DAY 0</span>
        </div>
        <div className="branch-list">
          {branches.map((b, i) => (
            <button
              key={b.name}
              aria-pressed={branch === i}
              onClick={() => {
                setBranch(i)
                setLocked(false)
              }}
              className={`branch-option ${branch === i ? "selected" : ""}`}
            >
              <GitBranch className="size-5" strokeWidth={1.3} />
              <span>
                <span className="eyebrow">
                  PATH 0{i + 1} / {b.fit.toUpperCase()}
                </span>
                <strong>{b.name}</strong>
                <small>{b.roles[0]}</small>
              </span>
              <ArrowRight className="ml-auto size-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="plan-heading">
        <div>
          <p className="eyebrow">YOUR SELECTED DIRECTION</p>
          <h2>{selected.name}</h2>
        </div>
        <div className="segment-control">
          <Button variant="ghost" aria-pressed={!sprint} onClick={() => setSprint(false)}>
            Paced · 120 days
          </Button>
          <Button variant="ghost" aria-pressed={sprint} onClick={() => setSprint(true)}>
            Sprint · 90 days
          </Button>
        </div>
      </div>
      <div className="role-chain">
        {selected.roles.map((r, i) => (
          <span key={r}>
            {i > 0 && <ArrowRight className="size-3 text-muted-foreground" />}
            {r}
          </span>
        ))}
      </div>
      <div className="milestone-grid">
        {MILESTONES.map((m, i) => (
          <section key={m.phase}>
            <span className="eyebrow">
              PHASE 0{i + 1} ·{" "}
              {sprint ? ["DAYS 1–20", "DAYS 21–55", "DAYS 56–90"][i] : m.days.toUpperCase()}
            </span>
            <h3>{m.phase}</h3>
            <p>
              {i === 0
                ? "Audit routine work and identify tasks you can delegate to AI with human review."
                : i === 1
                  ? `Build a small, reviewed project around ${selected.roles[0]!.toLowerCase()} skills. Document where human judgment improves the result.`
                  : `Use your project to start a career conversation about ${selected.roles[0]}. Collect feedback and choose your next learning goal.`}
            </p>
          </section>
        ))}
      </div>
      <div className="plan-action">
        <p>
          Suggested plan · {sprint ? "90" : "120"} days
          <br />
          <span>
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
