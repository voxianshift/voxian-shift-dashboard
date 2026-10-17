import { createHash, randomBytes } from "node:crypto"
import { Pool } from "pg"
import type { FastifyRequest, FastifyReply } from "fastify"

export type ChatMessage = { role: "user" | "assistant"; text: string }
export type ChatMemory = { userMessage: string; assistantMessage: string }
export interface ChatStore {
  history: (owner: string) => Promise<ChatMessage[]>
  append: (owner: string, message: string, reply: string) => Promise<void>
  saveMemory?: (
    owner: string,
    userMessage: string,
    assistantReply: string,
    embedding?: number[],
  ) => Promise<void>
  searchMemories?: (
    owner: string,
    queryEmbedding: number[],
    limit?: number,
  ) => Promise<ChatMemory[]>
  clear: (owner: string) => Promise<void>
  close: () => Promise<void>
}

export function createChatStore(connectionString: string): ChatStore {
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  })
  pool.on("error", () => {
    /* Queries report connection failures to the route. */
  })
  return {
    async history(owner) {
      const result = await pool.query<{ user_message: string; assistant_message: string }>(
        "SELECT user_message, assistant_message FROM lumi_chat_turns WHERE owner_hash = $1 ORDER BY id",
        [owner],
      )
      return result.rows.flatMap((row) => [
        { role: "user" as const, text: row.user_message },
        { role: "assistant" as const, text: row.assistant_message },
      ])
    },
    async append(owner, message, reply) {
      // One row commits both sides of a turn together.
      await pool.query(
        "INSERT INTO lumi_chat_turns (owner_hash, user_message, assistant_message) VALUES ($1, $2, $3)",
        [owner, message, reply],
      )
    },
    async saveMemory(owner, userMessage, assistantReply, embedding) {
      if (!embedding || embedding.length === 0) {
        await pool
          .query(
            "INSERT INTO lumi_chat_memories (owner_hash, user_message, assistant_message) VALUES ($1, $2, $3)",
            [owner, userMessage, assistantReply],
          )
          .catch(() => {})
        return
      }
      const vectorStr = `[${embedding.join(",")}]`
      await pool
        .query(
          "INSERT INTO lumi_chat_memories (owner_hash, user_message, assistant_message, embedding) VALUES ($1, $2, $3, $4)",
          [owner, userMessage, assistantReply, vectorStr],
        )
        .catch(async () => {
          // Fallback if vector type is not enabled, store as JSONB string or skip
          await pool
            .query(
              "INSERT INTO lumi_chat_memories (owner_hash, user_message, assistant_message, embedding) VALUES ($1, $2, $3, $4)",
              [owner, userMessage, assistantReply, JSON.stringify(embedding)],
            )
            .catch(() => {})
        })
    },
    async searchMemories(owner, queryEmbedding, limit = 3) {
      if (!queryEmbedding || queryEmbedding.length === 0) return []
      try {
        const vectorStr = `[${queryEmbedding.join(",")}]`
        const res = await pool.query<{ user_message: string; assistant_message: string }>(
          "SELECT user_message, assistant_message FROM lumi_chat_memories WHERE owner_hash = $1 AND embedding IS NOT NULL ORDER BY embedding <=> $2 LIMIT $3",
          [owner, vectorStr, limit],
        )
        return res.rows.map((r) => ({
          userMessage: r.user_message,
          assistantMessage: r.assistant_message,
        }))
      } catch {
        // Fallback to recent turns if vector cosine distance is not supported
        try {
          const res = await pool.query<{ user_message: string; assistant_message: string }>(
            "SELECT user_message, assistant_message FROM lumi_chat_memories WHERE owner_hash = $1 ORDER BY id DESC LIMIT $2",
            [owner, limit],
          )
          return res.rows.map((r) => ({
            userMessage: r.user_message,
            assistantMessage: r.assistant_message,
          }))
        } catch {
          return []
        }
      }
    },
    async clear(owner) {
      await pool
        .query(
          "WITH cleared_roles AS (DELETE FROM career_occupation_selections WHERE owner_hash = $1), cleared_memories AS (DELETE FROM lumi_chat_memories WHERE owner_hash = $1) DELETE FROM lumi_chat_turns WHERE owner_hash = $1",
          [owner],
        )
        .catch(async () => {
          await pool.query("DELETE FROM lumi_chat_turns WHERE owner_hash = $1", [owner])
        })
    },
    close: () => pool.end(),
  }
}

const cookieName = "voxian_chat"
export function chatOwner(request: FastifyRequest): string | null {
  const token = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1)
  return token && /^[A-Za-z0-9_-]{43}$/.test(token)
    ? createHash("sha256").update(token).digest("hex")
    : null
}

export function newChatOwner(reply: FastifyReply): string {
  const token = randomBytes(32).toString("base64url")
  reply.header(
    "Set-Cookie",
    `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  )
  return createHash("sha256").update(token).digest("hex")
}
