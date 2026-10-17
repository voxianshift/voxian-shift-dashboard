import { Pool } from "pg"
import type { FastifyError, FastifyInstance } from "fastify"
import {
  commitmentSchema,
  occupationCode,
  profileStateSchema,
  type ProfileState,
} from "@voxian/shared"
import { chatOwner, newChatOwner } from "./chat-store.ts"
import { curatedOccupationCodes } from "./navigator-pathways.ts"
import type { z } from "zod"

type Commitment = z.infer<typeof commitmentSchema>
export interface GuestStore {
  profile(owner: string): Promise<ProfileState | null>
  saveProfile(owner: string, state: ProfileState): Promise<ProfileState>
  commitment(owner: string): Promise<Commitment | null>
  saveCommitment(owner: string, commitment: Commitment | null): Promise<void>
  reset(owner: string, scope: "profile" | "all"): Promise<void>
  close(): Promise<void>
}
export class InvalidOccupationError extends Error {}

export function createGuestStore(connectionString: string): GuestStore {
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  })
  pool.on("error", () => {
    /* Request handlers report failures without logging private answers. */
  })
  return {
    async profile(owner) {
      const result = await pool.query("SELECT state FROM guest_profiles WHERE owner_hash=$1", [
        owner,
      ])
      return result.rows[0] ? profileStateSchema.parse(result.rows[0].state) : null
    },
    async saveProfile(owner, state) {
      const client = await pool.connect()
      try {
        await client.query("BEGIN")
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [owner])
        const codes = [...new Set(state.profile.occupations.map(occupationCode))]
        const primary = occupationCode(state.profile.primaryOccupation)
        const found = await client.query<{ code: string; title: string }>(
          "SELECT code,title FROM occupations WHERE code=ANY($1::text[]) AND code=ANY($2::text[])",
          [codes, curatedOccupationCodes],
        )
        if (found.rowCount !== codes.length || (primary && !codes.includes(primary)))
          throw new InvalidOccupationError(
            "Choose supported occupations and a main role from your selections.",
          )
        const saved = {
          ...state,
          profile: {
            ...state.profile,
            occupations: codes,
            primaryOccupation: primary,
            occupationNames: Object.fromEntries(found.rows.map((role) => [role.code, role.title])),
          },
        }
        await client.query("DELETE FROM career_occupation_selections WHERE owner_hash=$1", [owner])
        await client.query(
          "INSERT INTO career_occupation_selections(owner_hash,occupation_code,is_primary) SELECT $1,code,code=$3 FROM unnest($2::text[]) code",
          [owner, codes, primary],
        )
        await client.query(
          "INSERT INTO guest_profiles(owner_hash,state) VALUES ($1,$2) ON CONFLICT(owner_hash) DO UPDATE SET state=EXCLUDED.state,updated_at=now()",
          [owner, JSON.stringify(saved)],
        )
        await client.query("COMMIT")
        return saved
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    },
    async commitment(owner) {
      const result = await pool.query(
        "SELECT commitment FROM guest_commitments WHERE owner_hash=$1",
        [owner],
      )
      return result.rows[0] ? commitmentSchema.parse(result.rows[0].commitment) : null
    },
    async saveCommitment(owner, commitment) {
      if (!commitment) {
        await pool.query("DELETE FROM guest_commitments WHERE owner_hash=$1", [owner])
        return
      }
      await pool.query(
        "INSERT INTO guest_commitments(owner_hash,commitment) VALUES ($1,$2) ON CONFLICT(owner_hash) DO UPDATE SET commitment=EXCLUDED.commitment,updated_at=now()",
        [owner, JSON.stringify(commitment)],
      )
    },
    async reset(owner, scope) {
      const client = await pool.connect()
      try {
        await client.query("BEGIN")
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [owner])
        await client.query("DELETE FROM guest_profiles WHERE owner_hash=$1", [owner])
        await client.query("DELETE FROM career_occupation_selections WHERE owner_hash=$1", [owner])
        if (scope === "all") {
          await client.query("DELETE FROM guest_commitments WHERE owner_hash=$1", [owner])
          await client.query("DELETE FROM lumi_chat_turns WHERE owner_hash=$1", [owner])
          const memories = await client.query(
            "SELECT to_regclass('public.lumi_chat_memories') AS name",
          )
          if (memories.rows[0]?.name)
            await client.query("DELETE FROM lumi_chat_memories WHERE owner_hash=$1", [owner])
        }
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

export function registerGuest(app: FastifyInstance, store?: GuestStore) {
  app.register(async (routes) => {
    routes.addHook("onRequest", async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      if (
        request.method !== "GET" &&
        (request.headers["sec-fetch-site"] === "cross-site" ||
          (request.headers.origin &&
            request.headers.origin !== (process.env.WEB_ORIGIN || "http://localhost:3000")))
      )
        return reply.code(403).send({ error: "Request origin not allowed." })
      if (!store) return reply.code(503).send({ error: "Saved data is unavailable. Try again." })
      if (request.method !== "GET" && !chatOwner(request))
        return reply.code(401).send({ error: "Refresh before saving your data." })
    })
    routes.setErrorHandler<FastifyError>((error, _request, reply) => {
      const status =
        error instanceof InvalidOccupationError
          ? 400
          : typeof error.statusCode === "number" &&
              error.statusCode >= 400 &&
              error.statusCode < 500
            ? error.statusCode
            : 503
      reply.code(status).send({
        error:
          error instanceof InvalidOccupationError
            ? error.message
            : "Your data could not be saved or loaded. Try again.",
      })
    })
    routes.get("/guest/profile", async (request, reply) => {
      const owner = chatOwner(request) ?? newChatOwner(reply)
      return { state: await store!.profile(owner) }
    })
    routes.put("/guest/profile", { bodyLimit: 32_000 }, async (request, reply) => {
      const parsed = profileStateSchema.safeParse(request.body)
      if (!parsed.success)
        return reply.code(400).send({ error: "Check your profile answers and try again." })
      return { state: await store!.saveProfile(chatOwner(request)!, parsed.data) }
    })
    routes.get("/guest/commitment", async (request, reply) => {
      const owner = chatOwner(request) ?? newChatOwner(reply)
      return { commitment: await store!.commitment(owner) }
    })
    routes.put("/guest/commitment", { bodyLimit: 192_000 }, async (request, reply) => {
      const parsed = commitmentSchema.nullable().safeParse(request.body)
      if (!parsed.success)
        return reply.code(400).send({ error: "Check your plan and completed session dates." })
      await store!.saveCommitment(chatOwner(request)!, parsed.data)
      return { commitment: parsed.data }
    })
    routes.delete("/guest/state", async (request, reply) => {
      const scope = (request.query as { scope?: string }).scope
      if (scope !== "profile" && scope !== "all")
        return reply.code(400).send({ error: "Choose what to reset." })
      await store!.reset(chatOwner(request)!, scope)
      return reply.code(204).send()
    })
  })
}
