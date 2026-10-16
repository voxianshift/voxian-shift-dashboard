import { ArrowUpRight, BookOpen, Calculator, Fingerprint } from "lucide-react"
import { PanelHeading } from "@/components/radar-panel"
import { occupationModels, taskWeights } from "@/lib/occupations"
import { computeExposure, SCORING_VERSION } from "@voxian/shared"

export default function ResourcesPage() {
  return (
    <div className="editorial-page">
      <PanelHeading kicker="04 / METHODOLOGY & PROOF" title="Trust starts with showing our work.">
        A transparent calculation. Clear assumptions. Evidence you can inspect.
        <br />
        Here’s what sits behind the signal.
      </PanelHeading>
      <div className="proof-banner">
        <Calculator className="size-7" strokeWidth={1} />
        <div>
          <p className="eyebrow">EXPOSURE MODEL / VERSION {SCORING_VERSION}</p>
          <p className="proof-formula">E = 100 × Σ(wᵢ × eᵢ)</p>
          <p>Task weight × AI capability, summed across your work.</p>
        </div>
      </div>
      <div className="scenario-layout">
        <section className="editorial-section">
          <p className="eyebrow">01 / THE INPUTS</p>
          <h2>Tasks, not job titles.</h2>
          <p>
            Each task has a relative weight (wᵢ) and an AI exposure estimate (eᵢ) between 0 and 1.
            We normalize weights so they sum to 1, then calculate the weighted exposure index.
          </p>
        </section>
        <section className="editorial-section">
          <p className="eyebrow">02 / THE LIMITS</p>
          <h2>A model with boundaries.</h2>
          <p>
            Task weights and capability estimates in this prototype are illustrative, curated demo
            inputs. The score is not an official ILO score, a measured automation rate, or an
            individual job-loss probability.
          </p>
        </section>
      </div>
      <section className="editorial-section">
        <p className="eyebrow">03 / REPRODUCE THE RESULT</p>
        <p className="mt-3">
          Choose one occupation at a time. The mixed task option averages routine and escalation
          weights; it does not average occupations.
        </p>
        {occupationModels.map((model) => (
          <div key={model.id} className="proof-table-wrap">
            <table className="proof-table">
              <caption className="text-left mt-6 font-medium">
                {model.title} · illustrative demo inputs
              </caption>
              <thead>
                <tr>
                  <th scope="col">Task</th>
                  <th scope="col">AI capability</th>
                  <th scope="col">Routine weight</th>
                  <th scope="col">Escalation weight</th>
                </tr>
              </thead>
              <tbody>
                {model.tasks.map((task, i) => (
                  <tr key={task.name}>
                    <th scope="row">{task.name}</th>
                    <td>{task.exposure.toFixed(2)}</td>
                    <td>{Math.round(task.weight * 100)}%</td>
                    <td>{Math.round(model.escalationWeights[i]! * 100)}%</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">Exposure index</th>
                  <td>/ 100</td>
                  {["routine", "escalations"].map((focus) => (
                    <td key={focus}>
                      {computeExposure(
                        model.tasks.map((task, i) => ({
                          ...task,
                          weight: taskWeights(model, focus)[i]!,
                        })),
                      ).toFixed(1)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <section className="editorial-section">
        <p className="eyebrow">04 / RESEARCH STARTING POINTS</p>
        <a
          className="source-row"
          href="https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure"
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen />
          <span>
            <strong>Generative AI and Jobs: A Refined Global Index</strong>
            <small>
              International Labour Organization · May 2025 · Occupational exposure research
            </small>
          </span>
          <ArrowUpRight />
        </a>
        <a
          className="source-row"
          href="https://www.onetonline.org/link/summary/43-4051.00"
          target="_blank"
          rel="noreferrer"
        >
          <Fingerprint />
          <span>
            <strong>Customer Service Representatives</strong>
            <small>O*NET OnLine · 43-4051.00 · Occupational tasks and activities</small>
          </span>
          <ArrowUpRight />
        </a>
        <p className="mt-4">
          Research provides context for the approach. Prototype task estimates and scenarios remain
          assumptions; they are not directly validated by these sources.
        </p>
      </section>
    </div>
  )
}
