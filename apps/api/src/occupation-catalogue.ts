import { Pool } from "pg"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { occupationCodeSchema, occupationMatchSchema, type OccupationMatch } from "@voxian/shared"
import { chatOwner, newChatOwner } from "./chat-store.ts"

class UnknownOccupationError extends Error {}

export interface OccupationCatalogue {
  search: (query: string, limit?: number) => Promise<OccupationMatch[]>
  tasks: (code: string) => Promise<{ id: string; description: string }[]>
  selections: (
    owner: string,
  ) => Promise<{ occupations: OccupationMatch[]; primaryOccupation: string }>
  select: (owner: string, codes: string[], primary: string) => Promise<void>
  close: () => Promise<void>
}
const columns = `o.code, o.title, o.description, c.title AS category, o.source_version AS "sourceVersion", b.model_id AS "baselineId"`
const joins = `FROM occupations o JOIN occupation_categories c ON c.code=o.category_code LEFT JOIN exposure_baselines b ON b.occupation_code=o.code`
const genericWords = new Set(
  "i am a an the my work job role as in at and or of for with to is on do mostly daily day tasks include includes handle responsible test scenario persistence".split(
    " ",
  ),
)
export function searchTerms(query: string) {
  return [
    ...new Set(
      (query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
        (word) => word.length > 1 && !genericWords.has(word),
      ),
    ),
  ]
    .slice(0, 24)
    .join(" OR ")
}
export function createOccupationCatalogue(connectionString: string): OccupationCatalogue {
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  })
  pool.on("error", () => {
    /* Queries surface failures without logging profile data. */
  })
  return {
    async search(query, limit = 3) {
      // Match % per title: F0.5 of word overlap (plural-normalised, see voxian_words) (precision = share of the title's words
      // found in your text, recall = share of your words the title covers). Best of official +
      // alternate titles, blended 80/20 with full-text relevance over description and tasks.
      // Exact title or alternate title = 100.
      const result = await pool.query<OccupationMatch>(
        `
        WITH q AS (
          SELECT websearch_to_tsquery('english', $2) AS ts, lower($1) AS raw,
            voxian_words($1) AS words),
        titles AS (
          SELECT a.occupation_code AS code, a.title FROM occupation_aliases a, q
          WHERE to_tsvector('english', a.title) @@ q.ts
          UNION ALL
          SELECT o.code, o.title FROM occupations o, q WHERE to_tsvector('english', o.title) @@ q.ts),
        overlap AS (
          SELECT t.code, lower(t.title) = q.raw AS exact,
            cardinality(ARRAY(SELECT unnest(w) INTERSECT SELECT unnest(q.words)))::float AS hit,
            greatest(cardinality(w), 1) AS title_words, greatest(cardinality(q.words), 1) AS query_words
          FROM titles t CROSS JOIN q
          CROSS JOIN LATERAL (SELECT voxian_words(t.title) AS w) x),
        best AS (
          SELECT code, bool_or(exact) AS exact,
            -- ponytail: one-word titles ("Developer") count half unless exact; ambiguity needs context to rank better
            max(CASE WHEN hit = 0 THEN 0 ELSE
              1.25 * (hit / title_words) * (hit / query_words) / (0.25 * (hit / title_words) + hit / query_words)
              * CASE WHEN title_words = 1 AND NOT exact THEN 0.5 ELSE 1 END END) AS title_score
          FROM overlap GROUP BY code),
        scored AS (
          SELECT o.code, o.code = $1 OR coalesce(b.exact, false) AS exact,
            coalesce(b.title_score, 0) AS title_score, ts_rank_cd(o.search_document, q.ts, 32) AS text_rank
          FROM occupations o CROSS JOIN q LEFT JOIN best b ON b.code = o.code
          WHERE b.code IS NOT NULL OR o.search_document @@ q.ts OR o.code = $1)
        SELECT ${columns},
          CASE WHEN s.exact THEN 100
            ELSE least(99, round(100 * (0.8 * s.title_score + 0.2 * s.text_rank)))::int END AS match,
          CASE WHEN s.exact THEN 'Matches this occupation title or an alternate job title.'
            WHEN s.title_score >= 0.5 THEN 'Shares key words with this occupation title or one of its alternate job titles.'
            ELSE 'Related wording in the occupation description or typical tasks; check that it fits your work.' END AS reason
        ${joins} JOIN scored s ON s.code = o.code
        ORDER BY match DESC, o.title
        LIMIT $3`,
        [query, searchTerms(query), Math.min(10, Math.max(1, limit))],
      )
      return result.rows
    },
    async tasks(code) {
      const result = await pool.query<{ id: string; description: string }>(
        "SELECT source_task_id AS id, description FROM occupation_tasks WHERE occupation_code=$1 ORDER BY source_task_id::int LIMIT 12",
        [code],
      )
      return result.rows
    },
    async selections(owner) {
      const result = await pool.query<OccupationMatch & { is_primary: boolean }>(
        `
        SELECT ${columns}, 'Confirmed by you.' AS reason, s.is_primary
        ${joins} JOIN career_occupation_selections s ON s.occupation_code=o.code
        WHERE s.owner_hash=$1 ORDER BY s.is_primary DESC, o.title`,
        [owner],
      )
      return {
        occupations: result.rows.map((role) => occupationMatchSchema.parse(role)),
        primaryOccupation: result.rows.find((role) => role.is_primary)?.code ?? "",
      }
    },
    async select(owner, codes, primary) {
      const client = await pool.connect()
      try {
        await client.query("BEGIN")
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [owner])
        const found = await client.query(
          "SELECT code FROM occupations WHERE code=ANY($1::text[])",
          [codes],
        )
        if (found.rowCount !== codes.length) throw new UnknownOccupationError("Unknown occupation")
        await client.query("DELETE FROM career_occupation_selections WHERE owner_hash=$1", [owner])
        await client.query(
          "INSERT INTO career_occupation_selections(owner_hash,occupation_code,is_primary) SELECT $1,code,code=$3 FROM unnest($2::text[]) code",
          [owner, codes, primary],
        )
        await client.query("COMMIT")
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    },
    close: () => pool.end(),
  }
}

export function registerOccupations(app: FastifyInstance, catalogue?: OccupationCatalogue) {
  app.get("/occupations", async (request, reply) => {
    const parsed = z.object({ q: z.string().trim().min(2).max(800) }).safeParse(request.query)
    if (!parsed.success)
      return reply.code(400).send({ error: "Enter a job title or a few words about your work." })
    if (!catalogue) return reply.code(503).send({ error: "Occupation search is unavailable." })
    try {
      return { occupations: await catalogue.search(parsed.data.q, 3) }
    } catch {
      return reply.code(503).send({ error: "Occupation search could not load. Try again." })
    }
  })
  // Typical tasks for one occupation (O*NET task statements), used by the Meter breakdown
  app.get("/occupations/:code/tasks", async (request, reply) => {
    const parsed = z.object({ code: occupationCodeSchema }).safeParse(request.params)
    if (!parsed.success) return reply.code(400).send({ error: "Unknown occupation code." })
    if (!catalogue) return reply.code(503).send({ error: "Occupation tasks are unavailable." })
    try {
      return { tasks: await catalogue.tasks(parsed.data.code) }
    } catch {
      return reply.code(503).send({ error: "Occupation tasks could not load. Try again." })
    }
  })
  app.get("/onboarding/occupations", async (request, reply) => {
    reply.header("Cache-Control", "no-store")
    if (!catalogue) return reply.code(503).send({ error: "Occupation storage is unavailable." })
    const owner = chatOwner(request) ?? newChatOwner(reply)
    try {
      return await catalogue.selections(owner)
    } catch {
      return reply.code(503).send({ error: "Saved occupations could not load. Try again." })
    }
  })
  app.put("/onboarding/occupations", { bodyLimit: 4000 }, async (request, reply) => {
    reply.header("Cache-Control", "no-store")
    if (
      request.headers.origin &&
      request.headers.origin !== (process.env.WEB_ORIGIN || "http://localhost:3000")
    )
      return reply.code(403).send({ error: "Request origin not allowed." })
    const owner = chatOwner(request)
    if (!owner) return reply.code(401).send({ error: "Refresh before saving your occupations." })
    const parsed = z
      .strictObject({
        occupations: z.array(occupationCodeSchema).max(5),
        primaryOccupation: z.union([occupationCodeSchema, z.literal("")]),
      })
      .refine(
        (value) =>
          new Set(value.occupations).size === value.occupations.length &&
          (!value.primaryOccupation || value.occupations.includes(value.primaryOccupation)),
      )
      .safeParse(request.body)
    if (!parsed.success)
      return reply
        .code(400)
        .send({ error: "Choose up to five occupations and a main role from your selections." })
    if (!catalogue) return reply.code(503).send({ error: "Occupation storage is unavailable." })
    try {
      await catalogue.select(owner, parsed.data.occupations, parsed.data.primaryOccupation)
      return await catalogue.selections(owner)
    } catch {
      return reply
        .code(503)
        .send({ error: "Occupations could not be saved. Check your selections and try again." })
    }
  })
}
