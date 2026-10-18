"use client"

import Link from "next/link"
import { ArrowUpRight, Calculator } from "lucide-react"
import {
  baselineIdForOccupation,
  computeExposure,
  occupationCode,
  SCORING_VERSION,
} from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { useIscoMeter } from "@/hooks/use-isco-meter"
import { PanelHeading } from "@/components/radar-panel"
import { ArchitectureDiagram } from "@/components/architecture-diagram"
import { Button } from "@/components/ui/button"
import { hasMeterInputs } from "@/lib/onboarding"
import { occupationModels, taskWeights } from "@/lib/occupations"
import { editorialPage, editorialSection, eyebrow } from "@/lib/styles"

export default function ResourcesPage() {
  const { profile, ready, confirmed } = useCareerProfile()
  const code = occupationCode(profile.primaryOccupation)
  const valid = hasMeterInputs(profile)
  const demo = occupationModels.find((model) => model.id === baselineIdForOccupation(code))
  const isco = useIscoMeter(code, profile.occupationNames[code] ?? "", ready && valid && !demo)
  const model = valid
    ? demo && confirmed
      ? demo
      : !demo && isco !== "missing"
        ? isco
        : null
    : null
  const focus = profile.taskFocus || "routine"
  const weights = model ? taskWeights(model, focus) : []
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const score = model
    ? computeExposure(model.tasks.map((task, index) => ({ ...task, weight: weights[index]! })))
    : null
  const title = profile.occupationNames[code] || demo?.title || code
  const sourceLinks = [
    {
      title: "ILO Working Paper 140 · May 2025",
      detail: demo
        ? "Research context; does not validate the demo estimates."
        : "Research behind the task exposure dataset.",
      href: "https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure",
    },
    ...(valid
      ? [
          {
            title: `${title} · O*NET ${code}`,
            detail:
              "Occupation description and activities; O*NET does not supply this exposure score.",
            href: `https://www.onetonline.org/link/summary/${code}`,
          },
        ]
      : []),
    ...(model && !demo
      ? [
          {
            title: "ILO task-level exposure data",
            detail: "Published ISCO-08 task scores used by this Meter.",
            href: "https://pgmyrek.github.io/2025_GenAI_scores_ISCO08/",
          },
          {
            title: "ESCO–O*NET occupation crosswalk",
            detail: "Mapping reference; your actual match method is shown above.",
            href: "https://esco.ec.europa.eu/en/use-esco/other-crosswalks",
          },
        ]
      : []),
  ]
  return (
    <div className="bg-background text-foreground min-h-[calc(100dvh-48px)]">
    <div className={editorialPage}>
      <PanelHeading kicker="METHODOLOGY & PROOF" title="Trust starts with showing our work.">
        See the inputs behind your Meter, how we calculate it, and where the evidence ends.
      </PanelHeading>
      <section className="mb-7 rounded-2xl border border-border bg-card/60 p-6" aria-label="Your Meter evidence">
        <p className={eyebrow}>YOUR CURRENT BASELINE</p>
        {!ready ? (
          <p role="status" className="mt-3">
            Loading your profile…
          </p>
        ) : !valid ? (
          <>
            <h2 className="mt-3 text-[24px]">Choose your main occupation first.</h2>
            <p className="mt-2 text-muted-foreground">
              Your task calculation will appear here once a supported baseline is available.
            </p>
            <Button asChild className="mt-4">
              <Link href="/home">Set up my profile</Link>
            </Button>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-[24px]">{title}</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              O*NET {code} · Main occupation only; additional roles are not averaged into the Meter.
            </p>
            {demo && !confirmed ? (
              <p className="mt-4">
                Review and calculate your baseline in the Meter before viewing a personal result.
              </p>
            ) : !demo && isco === null ? (
              <p role="status" className="mt-4">
                Loading your task evidence…
              </p>
            ) : !model ? (
              <p role="status" className="mt-4">
                Task evidence is unavailable for this occupation. No substitute score is shown.
                Return to the Meter to check coverage or try loading this page again.
              </p>
            ) : (
              <>
                <p
                  className="mt-4 text-[32px] font-medium"
                  data-methodology-score={score!.toFixed(1)}
                >
                  {score!.toFixed(1)}{" "}
                  <span className="text-[16px] text-muted-foreground">/ 100 · exposure index</span>
                </p>
                <p className="mt-2 text-[16px]">
                  {demo
                    ? "Illustrative prototype task estimates"
                    : "ILO WP140 task exposure scores · equal task weights"}
                </p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  {demo
                    ? `Task mix: ${focus === "escalations" ? "Complex problems & exceptions" : focus === "mixed" ? "A bit of both" : "Routine questions & coordination"}.${!profile.taskFocus ? " Task mix not shared; default routine weights used." : ""}`
                    : "ILO does not supply personal time-use weights. Each published task counts equally; your task-mix preference does not change these weights."}
                </p>
                {isco && isco !== "missing" && !demo && (
                  <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                    Mapped to ISCO-08 {isco.isco} · {isco.iscoTitle}.{" "}
                    {isco.crosswalkMatch === "ai"
                      ? `AI-assisted occupation match: ${isco.mappingNote}. This mapping is an estimate, not an official crosswalk match.`
                      : `ESCO–O*NET crosswalk match: ${isco.crosswalkMatch} · ${isco.mappingNote}. Occupation boundaries may differ.`}
                  </p>
                )}
              </>
            )}
            <Button asChild variant="outline" className="mt-4">
              <Link href="/meter">
                View my Meter <ArrowUpRight />
              </Link>
            </Button>
          </>
        )}
      </section>
      <div className="flex items-center gap-5 rounded-2xl border border-cyan-900/40 bg-background p-6 text-cyan-300">
        <Calculator className="size-7 shrink-0 text-cyan-400" strokeWidth={1} />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-2">EXPOSURE MODEL / VERSION {SCORING_VERSION}</p>
          <p className="my-2.5 font-mono text-[25px] max-[700px]:text-[18px] text-cyan-300">
            E = 100 × Σ(wᵢ × eᵢ) / Σwᵢ
          </p>
          <p className="text-[14px] text-muted-foreground">
            Task weight × exposure estimate, normalized across the selected occupation.
          </p>
        </div>
      </div>
      {ready && model && (
        <section className={editorialSection}>
          <p className={eyebrow}>01 / REPRODUCE YOUR RESULT</p>
          <p>
            These are the same baseline inputs and calculation used by your Meter. Temporary example
            and task-mix overrides on the Meter are not saved to your profile.
          </p>
          <div className="overflow-x-auto">
            <table className="mt-5 w-full text-left text-[15px] [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-3.5 [&_th]:border-b [&_th]:border-border [&_th]:px-3 [&_th]:py-3.5 [&_th]:font-medium">
              <caption className="mb-3 text-left">
                {title} · {demo ? "Illustrative estimates" : "ILO task data"}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Task</th>
                  <th scope="col">Exposure (0–1)</th>
                  <th scope="col">Weight</th>
                  <th scope="col">Points / 100</th>
                </tr>
              </thead>
              <tbody>
                {model.tasks.map((task, index) => {
                  const weight = weights[index]! / totalWeight
                  return (
                    <tr key={`${index}-${task.name}`}>
                      <th scope="row">{task.name}</th>
                      <td>{task.exposure.toFixed(2)}</td>
                      <td>{(weight * 100).toFixed(1)}%</td>
                      <td>{(100 * weight * task.exposure).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={2}>
                    Exposure index
                  </th>
                  <td>100%</td>
                  <td>{score!.toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Calculation uses full precision; displayed rows are rounded and may not sum exactly.
          </p>
        </section>
      )}
      <section className={editorialSection}>
        <p className={eyebrow}>02 / WHAT THIS CAN TELL YOU</p>
        <h2>Exposure is not a job-loss forecast.</h2>
        <p>
          {demo
            ? "This baseline uses curated prototype estimates, not official ILO occupational scores."
            : "Mapped task scores describe an occupation group, not your personal tasks or employer’s AI adoption."}{" "}
          The index does not predict job loss, timing, pay, or your chance of getting a new role.
          Your daily work may differ from this baseline.
        </p>
        <p>
          Goals, available time, strengths and comfort with change guide Navigator suggestions; they
          do not change this exposure calculation. Navigator directions and generated plans are AI
          guidance, not research-backed job matches or verified vacancies.
        </p>
      </section>
      <section className={editorialSection} aria-labelledby="architecture-title">
        <p className={eyebrow}>03 / SYSTEM ARCHITECTURE</p>
        <h2 id="architecture-title">How this MVP works.</h2>
        <p>
          Five layers, all on Google Cloud. The AI writes guidance; it never calculates your
          exposure score.
        </p>
        <ArchitectureDiagram />
      </section>
      <section className={editorialSection}>
        <p className={eyebrow}>04 / INSPECT THE SOURCES</p>
        {sourceLinks.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 border-b border-border py-5 hover:text-cyan-400 transition-colors"
          >
            <span>
              <strong className="text-[16px] font-medium">{source.title}</strong>
              <span className="mt-1 block text-[14px] text-muted-foreground">{source.detail}</span>
            </span>
            <ArrowUpRight className="size-4 shrink-0" />
          </a>
        ))}
      </section>
    </div>
    </div>
  )
}
