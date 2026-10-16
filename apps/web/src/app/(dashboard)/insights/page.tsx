"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { INSIGHTS } from "@/lib/mock"

const scenarios = [
  {
    name: "Augmentation",
    path: "M510 170 C610 150 720 110 900 95",
    detail:
      "AI handles routine work. People take on judgment, relationships, and exceptions. Build skills that help you guide automated workflows.",
  },
  {
    name: "Autonomy",
    path: "M510 170 C620 135 740 55 900 30",
    detail:
      "More workflows run with less direct supervision. Explore quality assurance, escalation ownership, and automation operations as possible next steps.",
  },
  {
    name: "Regulation",
    path: "M510 170 C650 165 750 155 900 150",
    detail:
      "Human oversight remains central where accountability matters. Develop evidence review, audit, and compliance skills.",
  },
]

export default function InsightsPage() {
  const [selected, setSelected] = useState(0)
  return (
    <div className="editorial-page">
      <PanelHeading kicker="02 / THE CURVE" title="Follow the change. Not the headlines.">
        A view of task automation over time. Observed signals on one side.
        <br />
        Possible futures on the other. No countdown to a disappearing job.
      </PanelHeading>
      <div className="curve-key">
        <span>
          <i /> Observed signals
        </span>
        <span>
          <i /> Illustrative scenarios
        </span>
        <span className="ml-auto">2024 — 2028</span>
      </div>
      <div className="curve-chart">
        <svg
          viewBox="0 0 960 290"
          role="img"
          aria-label={`Illustrative automation trajectory, 2024 to 2028. Selected scenario: ${scenarios[selected]!.name}. Not a measured forecast.`}
        >
          <defs>
            <pattern id="grid" width="96" height="55" patternUnits="userSpaceOnUse">
              <path d="M 96 0 L 0 0 0 55" fill="none" stroke="currentColor" strokeOpacity=".08" />
            </pattern>
          </defs>
          <rect x="35" y="0" width="890" height="245" fill="url(#grid)" />
          <rect x="510" y="0" width="415" height="245" fill="#b69aa9" opacity=".07" />
          <text x="48" y="25">
            TASK AUTOMATION →
          </text>
          <path
            d="M55 220 C160 215 170 205 280 195 S420 180 510 170"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {scenarios.map((s, i) => (
            <path
              key={s.name}
              d={s.path}
              fill="none"
              stroke={i === selected ? "#a17f94" : "#c7c2c5"}
              strokeWidth={i === selected ? 3 : 1.5}
              strokeDasharray="5 6"
            />
          ))}
          <line x1="510" x2="510" y1="35" y2="245" stroke="#b69aa9" strokeDasharray="3 4" />
          <circle cx="510" cy="170" r="5" fill="#a17f94" />
          <text x="490" y="25">
            NOW
          </text>
          {["2024", "2025", "2026", "2027", "2028"].map((y, i) => (
            <text key={y} x={55 + i * 211} y="275">
              {y}
            </text>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Conceptual trajectories only. Lines show possible directions, not measured values or
        probabilities.
      </p>
      <div className="scenario-layout">
        <section className="editorial-section">
          <p className="eyebrow">EXPLORE A SCENARIO</p>
          <div className="segment-control">
            {scenarios.map((s, i) => (
              <Button
                key={s.name}
                variant="ghost"
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                {s.name}
              </Button>
            ))}
          </div>
          <h2>{scenarios[selected]!.name}</h2>
          <p>{scenarios[selected]!.detail}</p>
          <Link className="inline-flex items-center gap-2 mt-5 text-[14px]" href="/roadmap">
            Plan for the possibilities <ArrowUpRight className="size-3.5" />
          </Link>
        </section>
        <section className="editorial-section">
          <p className="eyebrow">REGIONAL CONTEXT / JAPAC</p>
          <h2>Relationships still matter.</h2>
          <p>
            Local business practices, adoption costs, and human oversight can change how quickly
            automation reaches a workplace. These scenarios are prompts for planning, not regional
            predictions.
          </p>
        </section>
      </div>
      <div className="editorial-section">
        <p className="eyebrow">SIGNAL TIMELINE · DEMO CONTEXT</p>
        <div className="timeline-grid">
          {INSIGHTS.map((i) => (
            <div key={i.date}>
              <span className="small-tag">{i.label}</span>
              <h2>{i.date}</h2>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
