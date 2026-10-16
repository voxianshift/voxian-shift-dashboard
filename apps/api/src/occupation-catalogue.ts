import { Pool } from "pg"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { occupationCodeSchema, occupationMatchSchema, type OccupationMatch } from "@voxian/shared"
import { chatOwner, newChatOwner } from "./chat-store.ts"

class UnknownOccupationError extends Error {}

export interface OccupationCatalogue {
  search: (query: string, limit?: number) => Promise<OccupationMatch[]>
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
      const result = await pool.query<OccupationMatch>(
        `
        WITH q AS (SELECT websearch_to_tsquery('english', $2) AS value)
        SELECT ${columns},
          CASE WHEN lower(o.title)=lower($1) OR EXISTS(SELECT 1 FROM occupation_aliases a WHERE a.occupation_code=o.code AND lower(a.title)=lower($1))
            THEN 'Matches this occupation title or an alternate job title.'
            ELSE 'Related wording in the occupation description or typical tasks; check that it fits your work.' END AS reason
        ${joins} CROSS JOIN q
        WHERE o.search_document @@ q.value OR o.code=$1 OR position(lower($1) IN lower(o.title))>0
        ORDER BY CASE WHEN o.code=$1 OR lower(o.title)=lower($1) THEN 100
          WHEN EXISTS(SELECT 1 FROM occupation_aliases a WHERE a.occupation_code=o.code AND lower(a.title)=lower($1)) THEN 90
          WHEN position(lower($1) IN lower(o.title))>0 THEN 50
          ELSE ts_rank_cd(o.search_document,q.value) END DESC, o.title
        LIMIT $3`,
        [query, searchTerms(query), Math.min(10, Math.max(1, limit))],
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
