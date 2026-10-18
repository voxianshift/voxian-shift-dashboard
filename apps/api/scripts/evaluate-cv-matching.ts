import { writeFile, mkdir } from "node:fs/promises"
import { z } from "zod"
import { cvAssessmentSchema } from "@voxian/shared"
import { chatConfig, completeJson } from "../src/llm.ts"
import frozen from "../data/evaluations/cv-frozen-requirements.json" with { type: "json" }
import { cvMatchingPrompt, skillRequirementsVersion } from "../src/skill-requirements.ts"
import data from "../data/evaluations/cv-skill-matching.json" with { type: "json" }

const cases = z
  .array(
    z.strictObject({
      id: z.string(),
      label: z.string(),
      evidence: z.array(z.string()),
      expected: z.enum(["supported", "not_supported"]),
      rationale: z.string(),
    }),
  )
  .parse(data.cases)
const catalogue = frozen.requirements
const schema = z
  .strictObject({ assessments: z.array(cvAssessmentSchema).length(cases.length) })
  .refine(
    (body) =>
      new Set(body.assessments.map((item) => item.requirementId)).size === cases.length &&
      body.assessments.every((item) => cases.some((example) => example.id === item.requirementId)),
  )
if (!process.argv.includes("--live")) {
  for (const example of cases)
    if (!catalogue.some((item) => item.label === example.label))
      throw new Error(`Missing requirement: ${example.id}`)
  console.log(
    `Validated ${cases.length} synthetic cases; ${catalogue.length} frozen historical requirement records. Use --live to run two provider requests.`,
  )
} else {
  const config = chatConfig()
  if (!config?.apiKey) throw new Error("Configured provider credentials are required")
  const runs = []
  for (const variant of ["label-only", "defined-requirements"] as const) {
    const started = Date.now()
    const input = cases.map((example) => ({
      requirementId: example.id,
      requirement:
        variant === "label-only"
          ? { label: example.label }
          : { ...catalogue.find((item) => item.label === example.label)!, id: example.id },
      cvEvidence: example.evidence,
    }))
    const raw = await completeJson(
      config,
      `${cvMatchingPrompt}\nEach supplied case is independent: assess only its own cvEvidence and requirement. Use its requirementId. Return JSON {assessments:[...]}. Keep every reason under 120 characters.`,
      input,
      z.toJSONSchema(schema),
      10000,
      60000,
    )
    const result = schema.parse(JSON.parse(raw))
    const rows = cases.map((example) => {
      const verdict = result.assessments.find((item) => item.requirementId === example.id)!
      const citationValid =
        verdict.status !== "supported" || example.evidence.includes(verdict.evidence)
      const actual = verdict.status === "supported" && citationValid ? "supported" : "not_supported"
      return {
        ...example,
        actual,
        citationValid,
        status: verdict.status,
        quote: verdict.evidence,
        reason: verdict.reason,
        correct: actual === example.expected,
      }
    })
    const tp = rows.filter(
      (row) => row.actual === "supported" && row.expected === "supported",
    ).length
    const fp = rows.filter(
      (row) => row.actual === "supported" && row.expected !== "supported",
    ).length
    const fn = rows.filter(
      (row) => row.actual !== "supported" && row.expected === "supported",
    ).length
    runs.push({
      variant,
      milliseconds: Date.now() - started,
      correct: rows.filter((row) => row.correct).length,
      total: rows.length,
      truePositives: tp,
      falsePositives: fp,
      falseNegatives: fn,
      precision: tp + fp ? tp / (tp + fp) : null,
      recall: tp / (tp + fn),
      rows,
    })
  }
  const report = {
    date: new Date().toISOString(),
    provider: config.label,
    model: config.model,
    requirementsVersion: skillRequirementsVersion,
    frozenImplementation: frozen.frozenImplementation,
    casesVersion: data.version,
    limitation: data.provenance,
    retrievalGate:
      "Current occupation sends all 12 requirements and up to 74 CV evidence phrases. Exhaustive candidate coverage is 100%; vectors cannot increase coverage. This test measures verdict quality, not vector ranking. Retain direct matching until larger-corpus retrieval benchmark demonstrates benefit.",
    runs,
  }
  const target = new URL("../../../docs/evaluations/", import.meta.url)
  await mkdir(target, { recursive: true })
  await writeFile(new URL("cv-skill-matching.json", target), `${JSON.stringify(report, null, 2)}\n`)
  console.log(
    JSON.stringify(
      {
        provider: report.provider,
        model: report.model,
        runs: runs.map(({ rows: _rows, ...metrics }) => metrics),
      },
      null,
      2,
    ),
  )
}
