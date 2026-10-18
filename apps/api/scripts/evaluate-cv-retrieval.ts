import { mkdir, writeFile } from "node:fs/promises"
import { randomBytes } from "node:crypto"
import { Pool } from "pg"
import { z } from "zod"
import { cvAssessmentSchema, emptyProfile, type CvContext } from "@voxian/shared"
import frozen from "../data/evaluations/cv-frozen-requirements.json" with { type: "json" }
import { cvMatchingPrompt } from "../src/skill-requirements.ts"
import { createCvEmbeddings } from "../src/cv-embeddings.ts"
import { createCvVectorStore, requirementEmbeddingText } from "../src/cv-vector-store.ts"
import { chatConfig, completeJson } from "../src/llm.ts"
import diagnostic from "../data/evaluations/cv-skill-matching.json" with { type: "json" }
import holdout from "../data/evaluations/cv-skill-holdout.json" with { type: "json" }
const isHoldout = process.argv.includes("--holdout")
const fixture = isHoldout ? holdout : diagnostic
const repeatCount = isHoldout ? 2 : 1

if (!process.argv.includes("--live"))
  throw new Error(
    "Use --live; this diagnostic invokes Vertex embeddings and two configured LLM requests using synthetic data only",
  )
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")
const config = chatConfig()
if (!config?.apiKey) throw new Error("Configured LLM provider is required")
const catalogue = frozen.requirements
const distractions = [
  "Built responsive React interfaces from supplied designs.",
  "Scheduled weekly team meetings.",
  "Maintained CSS design tokens.",
  "Prepared monthly task status updates.",
  "Configured a relational database for a web app.",
  "Coordinated a frontend framework upgrade.",
  "Maintained customer contact records.",
  "Deployed static websites.",
  "Added payment checkout forms.",
  "Organized marketing assets.",
  "Maintained website backup procedures.",
  "Implemented REST endpoints for inventory.",
  "Reviewed pull requests for formatting.",
  "Updated application documentation.",
  "Estimated implementation tasks.",
]
const examples = fixture.cases.map((item) => ({
  ...item,
  requirement: catalogue.find((r) => r.label === item.label)!,
  allEvidence: [...new Set([...item.evidence, ...distractions])],
}))
const texts = [
  ...new Set(
    examples.flatMap((item) => [requirementEmbeddingText(item.requirement), ...item.allEvidence]),
  ),
]
const client = createCvEmbeddings()
const embeddingStart = Date.now()
const values = await client.embed(texts, AbortSignal.timeout(180_000))
const embeddingMilliseconds = Date.now() - embeddingStart
const vectors = new Map(texts.map((text, i) => [text, values[i]!]))
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const owner = randomBytes(32).toString("hex")
// Synthetic benchmark shares precomputed vectors in memory to avoid paying repeatedly for identical fixtures.
const store = createCvVectorStore(process.env.DATABASE_URL, {
  model: client.model,
  embed: async (input) =>
    input.map((text) => {
      const value = vectors.get(text)
      if (!value) throw new Error("Missing benchmark vector")
      return value
    }),
})
const prepared = []
try {
  for (const example of examples) {
    const cv: CvContext = {
      reviewed: true,
      confidence: 1,
      jobTitles: ["Synthetic evaluation"],
      skills: example.allEvidence.slice(0, 20),
      keywords: ["Synthetic evaluation"],
      workHistory: [],
    }
    // The marker keyword also needs an embedding; omit it from evidence by using an existing phrase.
    cv.keywords = [example.allEvidence[0]!]
    await pool.query(
      "INSERT INTO guest_profiles(owner_hash,state) VALUES($1,$2) ON CONFLICT(owner_hash) DO UPDATE SET state=EXCLUDED.state",
      [owner, JSON.stringify({ profile: { ...emptyProfile, cvContext: cv } })],
    )
    const started = Date.now()
    const result = await store.candidates(owner, cv, [example.requirement])
    prepared.push({
      ...example,
      candidates: result.byRequirement[example.requirement.id]!,
      retrievalMilliseconds: Date.now() - started,
    })
  }
  const schema = z
    .strictObject({ assessments: z.array(cvAssessmentSchema).length(examples.length) })
    .refine(
      (body) =>
        new Set(body.assessments.map((item) => item.requirementId)).size === examples.length &&
        body.assessments.every((item) => examples.some((e) => e.id === item.requirementId)),
    )
  const runs: {
    variant: "exhaustive" | "vector-candidates"
    repeat: number
    invalidCitations: number
    milliseconds: number
    inputCharacters: number
    correct: number
    total: number
    falsePositives: number
    falseNegatives: number
    rows: unknown[]
  }[] = []
  for (let repeat = 1; repeat <= repeatCount; repeat++) {
    for (const variant of ["exhaustive", "vector-candidates"] as const) {
      const input = prepared.map((item) => ({
        requirementId: item.id,
        requirement: { ...item.requirement, id: item.id },
        cvEvidence: variant === "exhaustive" ? item.allEvidence : item.candidates,
      }))
      const started = Date.now()
      const raw = await completeJson(
        config,
        `${cvMatchingPrompt}\nEach case is independent. Use its own cvEvidence and requirementId only. Return JSON {assessments:[...]}. Keep reasons under 100 characters.`,
        input,
        z.toJSONSchema(schema),
        10000,
        60000,
      )
      const verdicts = schema.parse(JSON.parse(raw)).assessments
      const rows = prepared.map((item) => {
        const verdict = verdicts.find((v) => v.requirementId === item.id)!
        const allowed = variant === "exhaustive" ? item.allEvidence : item.candidates
        const supported = verdict.status === "supported" && allowed.includes(verdict.evidence)
        return {
          id: item.id,
          expected: item.expected,
          actual: supported ? "supported" : "not_supported",
          status: verdict.status,
          evidence: verdict.evidence,
          reason: verdict.reason,
          invalidCitation: verdict.status === "supported" && !allowed.includes(verdict.evidence),
        }
      })
      const falsePositives = rows.filter(
        (r) => r.actual === "supported" && r.expected !== "supported",
      ).length
      runs.push({
        variant,
        repeat,
        invalidCitations: rows.filter((row) => row.invalidCitation).length,
        milliseconds: Date.now() - started,
        inputCharacters: JSON.stringify(input).length,
        correct: rows.filter((r) => r.actual === r.expected).length,
        total: rows.length,
        falsePositives,
        falseNegatives: rows.filter((r) => r.actual !== "supported" && r.expected === "supported")
          .length,
        rows,
      })
    }
  }
  const positives = prepared.filter((item) => item.expected === "supported")
  const recovered = positives.filter((item) =>
    item.evidence.some((phrase) => item.candidates.includes(phrase)),
  ).length
  const report = {
    date: new Date().toISOString(),
    fixture: fixture.version,
    provenance: fixture.provenance,
    repeatCount,
    model: client.model,
    verifier: { provider: config.label, model: config.model },
    embeddingRequests: texts.length,
    embeddingMilliseconds,
    positiveEvidenceRecall: recovered / positives.length,
    recovered,
    totalPositive: positives.length,
    meanDatabaseRetrievalMilliseconds:
      prepared.reduce((sum, item) => sum + item.retrievalMilliseconds, 0) / prepared.length,
    inputCharacterReduction: 1 - runs[1]!.inputCharacters / runs[0]!.inputCharacters,
    diagnosticGatePassed:
      recovered / positives.length >= 0.98 &&
      runs.every((run) => run.invalidCitations === 0) &&
      runs
        .filter((run) => run.variant === "vector-candidates")
        .every((run) => {
          const direct = runs.find(
            (item) => item.variant === "exhaustive" && item.repeat === run.repeat,
          )!
          return (
            run.falsePositives <= direct.falsePositives &&
            run.falseNegatives <= direct.falseNegatives &&
            run.inputCharacters < direct.inputCharacters * 0.8
          )
        }),
    limitation:
      "Synthetic examples and fixed distractors, not real CVs or a production accuracy/cost estimate. Cached vectors exclude cold embedding latency from database timings. No automatic rollout.",
    retrieval: prepared.map((item) => ({
      id: item.id,
      label: item.label,
      expected: item.expected,
      goldEvidence: item.evidence,
      candidates: item.candidates,
    })),
    runs,
  }
  const target = new URL("../../../docs/evaluations/", import.meta.url)
  await mkdir(target, { recursive: true })
  await writeFile(
    new URL(isHoldout ? "cv-vector-holdout.json" : "cv-vector-retrieval.json", target),
    JSON.stringify(report, null, 2) + "\n",
  )
  console.log(
    JSON.stringify(
      { ...report, retrieval: undefined, runs: runs.map(({ rows: _rows, ...metrics }) => metrics) },
      null,
      2,
    ),
  )
} finally {
  await pool.query("DELETE FROM guest_profiles WHERE owner_hash=$1", [owner])
  await store.close()
  await pool.end()
}
