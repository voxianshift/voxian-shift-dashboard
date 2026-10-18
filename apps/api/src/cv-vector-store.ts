import { createHash } from "node:crypto"
import { Pool } from "pg"
import { cvContextSchema, cvEvidence, type CvContext } from "@voxian/shared"
import { createCvEmbeddings, cvVectorSchema, type CvEmbeddings } from "./cv-embeddings.ts"
import { type SkillRequirement } from "./skill-requirements.ts"

export const cvRevision = (cv: CvContext) =>
  createHash("sha256")
    .update(JSON.stringify(cvContextSchema.parse(cv)))
    .digest("hex")
const hash = (text: string) => createHash("sha256").update(text).digest("hex")
const vector = (values: number[]) => JSON.stringify(cvVectorSchema.parse(values))
export const requirementEmbeddingText = (item: SkillRequirement) =>
  `${item.label}. ${item.definition} Equivalent terms: ${item.aliases.join(", ")}. Context: ${item.context}`
export type CvCandidates = {
  model: string
  evidenceCount: number
  byRequirement: Record<string, string[]>
}
export interface CvVectorStore {
  candidates(owner: string, cv: CvContext, requirements: SkillRequirement[]): Promise<CvCandidates>
  seed(requirements: SkillRequirement[]): Promise<number>
  close(): Promise<void>
}
export function createCvVectorStore(
  connection: string,
  embeddings: CvEmbeddings = createCvEmbeddings(),
): CvVectorStore {
  const pool = new Pool({
    connectionString: connection,
    max: 3,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  })
  pool.on("error", () => {})
  const pending = new Map<string, Promise<CvCandidates>>()
  async function current(owner: string, revision: string) {
    const result = await pool.query(
      "SELECT state->'profile'->'cvContext' AS cv FROM guest_profiles WHERE owner_hash=$1",
      [owner],
    )
    if (!result.rows[0]?.cv || cvRevision(result.rows[0].cv) !== revision)
      throw new Error("CV revision no longer current")
  }
  async function cachedRequirements(requirements: SkillRequirement[]) {
    const result = await pool.query<{ requirement_id: string; content_hash: string }>(
      "SELECT requirement_id,content_hash FROM skill_requirement_vectors WHERE model=$1 AND requirement_id=ANY($2::text[])",
      [embeddings.model, requirements.map((item) => item.id)],
    )
    return requirements.filter(
      (item) =>
        !result.rows.some(
          (row) =>
            row.requirement_id === item.id &&
            row.content_hash === hash(requirementEmbeddingText(item)),
        ),
    )
  }
  return {
    async seed(requirements) {
      const missing = await cachedRequirements(requirements)
      const values = await embeddings.embed(
        missing.map(requirementEmbeddingText),
        AbortSignal.timeout(180_000),
      )
      for (const [index, item] of missing.entries())
        await pool.query(
          "INSERT INTO skill_requirement_vectors(requirement_id,model,content_hash,version,embedding) VALUES($1,$2,$3,$4,$5::vector) ON CONFLICT(requirement_id,model) DO UPDATE SET content_hash=EXCLUDED.content_hash,version=EXCLUDED.version,embedding=EXCLUDED.embedding",
          [
            item.id,
            embeddings.model,
            hash(requirementEmbeddingText(item)),
            item.version,
            vector(values[index]!),
          ],
        )
      return missing.length
    },
    async candidates(owner, cv, requirements) {
      if (!/^[a-f0-9]{64}$/.test(owner)) throw new Error("Invalid CV owner")
      const revision = cvRevision(cv)
      const evidence = cvEvidence(cv)
      if (!evidence.length || !requirements.length)
        return { model: embeddings.model, evidenceCount: evidence.length, byRequirement: {} }
      const key = `${owner}:${revision}:${hash(JSON.stringify(requirements))}`
      const existing = pending.get(key)
      if (existing) return existing
      const operation = (async () => {
        await current(owner, revision)
        const missing = await cachedRequirements(requirements)
        const saved = await pool.query<{ content_hash: string }>(
          "SELECT content_hash FROM cv_evidence_vectors WHERE owner_hash=$1 AND cv_revision=$2 AND model=$3",
          [owner, revision, embeddings.model],
        )
        const phrases = evidence.filter(
          (phrase) => !saved.rows.some((row) => row.content_hash === hash(phrase)),
        )
        const values = await embeddings.embed(
          [...missing.map(requirementEmbeddingText), ...phrases],
          AbortSignal.timeout(25_000),
        )
        const client = await pool.connect()
        try {
          await client.query("BEGIN")
          await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [owner])
          const savedProfile = await client.query(
            "SELECT state->'profile'->'cvContext' AS cv FROM guest_profiles WHERE owner_hash=$1 FOR UPDATE",
            [owner],
          )
          if (!savedProfile.rows[0]?.cv || cvRevision(savedProfile.rows[0].cv) !== revision)
            throw new Error("CV changed during embedding")
          for (const [index, item] of missing.entries())
            await client.query(
              "INSERT INTO skill_requirement_vectors(requirement_id,model,content_hash,version,embedding) VALUES($1,$2,$3,$4,$5::vector) ON CONFLICT(requirement_id,model) DO UPDATE SET content_hash=EXCLUDED.content_hash,version=EXCLUDED.version,embedding=EXCLUDED.embedding",
              [
                item.id,
                embeddings.model,
                hash(requirementEmbeddingText(item)),
                item.version,
                vector(values[index]!),
              ],
            )
          for (const [index, phrase] of phrases.entries())
            await client.query(
              "INSERT INTO cv_evidence_vectors(owner_hash,cv_revision,model,content_hash,phrase,embedding) VALUES($1,$2,$3,$4,$5,$6::vector) ON CONFLICT(owner_hash,model,content_hash) DO UPDATE SET cv_revision=EXCLUDED.cv_revision,phrase=EXCLUDED.phrase,embedding=EXCLUDED.embedding",
              [
                owner,
                revision,
                embeddings.model,
                hash(phrase),
                phrase,
                vector(values[missing.length + index]!),
              ],
            )
          await client.query("COMMIT")
        } catch (error) {
          await client.query("ROLLBACK")
          throw error
        } finally {
          client.release()
        }
        const rows = await pool.query<{ requirement_id: string; phrase: string }>(
          `SELECT r.requirement_id,c.phrase FROM skill_requirement_vectors r
          JOIN jsonb_to_recordset($4::jsonb) AS wanted(id text,hash text) ON wanted.id=r.requirement_id AND wanted.hash=r.content_hash
          CROSS JOIN LATERAL (SELECT phrase FROM cv_evidence_vectors WHERE owner_hash=$1 AND cv_revision=$2 AND model=$3 ORDER BY embedding <=> r.embedding,content_hash LIMIT 3) c
          WHERE r.model=$3`,
          [
            owner,
            revision,
            embeddings.model,
            JSON.stringify(
              requirements.map((item) => ({
                id: item.id,
                hash: hash(requirementEmbeddingText(item)),
              })),
            ),
          ],
        )
        const byRequirement = Object.fromEntries(
          requirements.map((item) => {
            const closest = rows.rows
              .filter((row) => row.requirement_id === item.id)
              .map((row) => row.phrase)
            const exact = evidence.filter((phrase) =>
              [item.label, ...item.aliases].some((alias) =>
                phrase.toLowerCase().includes(alias.toLowerCase()),
              ),
            )
            return [item.id, [...new Set([...closest, ...exact])]]
          }),
        )
        if (requirements.some((item) => !byRequirement[item.id]?.length))
          throw new Error("Incomplete CV candidate retrieval")
        return { model: embeddings.model, evidenceCount: evidence.length, byRequirement }
      })()
      pending.set(key, operation)
      try {
        return await operation
      } finally {
        pending.delete(key)
      }
    },
    close: () => pool.end(),
  }
}
