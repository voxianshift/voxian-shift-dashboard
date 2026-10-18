import { z } from "zod"
import { applicationDefault } from "firebase-admin/app"

export type ChatConfig = { provider: string; label: string; apiKey?: string; model: string }

export function chatConfig(): ChatConfig | null {
  const provider = process.env.CHAT_PROVIDER || "gemini"
  // Gemini on Vertex AI: service-account auth (Cloud Run) or local ADC, no API key
  if (provider === "vertex")
    return {
      provider,
      label: "Gemini on Vertex AI",
      apiKey: "adc",
      model: process.env.VERTEX_MODEL || "gemini-2.5-flash",
    }
  if (provider === "gemini")
    return {
      provider,
      label: "Gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    }
  return null
}

/**
 * Gemini/Vertex reject complex response schemas with a bare INVALID_ARGUMENT: enums past ~4
 * values (5 resource IDs) or large maxItems on nested object arrays (20 CV assessments × 4 paths).
 * Drop both from the wire schema; callers' zod parse still enforces them and prompts state limits.
 */
export function geminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(geminiSchema)
  if (!schema || typeof schema !== "object") return schema
  return Object.fromEntries(
    Object.entries(schema)
      .filter(
        ([key, value]) =>
          !(key === "enum" && Array.isArray(value) && value.length > 4) &&
          !(key === "maxItems" && typeof value === "number" && value > 5),
      )
      .map(([key, value]) => [key, geminiSchema(value)]),
  )
}

export class ProviderAuthError extends Error {}
export class ProviderQuotaError extends Error {}
export class ProviderTimeoutError extends Error {}

// One JSON completion from the configured Gemini provider (Vertex AI or Gemini API).
export async function completeJson(
  config: ChatConfig,
  systemPrompt: string,
  input: unknown,
  schema: unknown,
  maxTokens = 2000,
  timeoutMs = 15_000,
  document?: { mimeType: "application/pdf"; data: string },
): Promise<string> {
  const vertex = config.provider === "vertex"
  const project = process.env.GOOGLE_CLOUD_PROJECT || "voxian-shift-app"
  let response: Response
  try {
    response = await fetch(
      vertex
        ? `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${encodeURIComponent(config.model)}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
      {
        method: "POST",
        headers: vertex
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(await applicationDefault().getAccessToken()).access_token}`,
            }
          : { "Content-Type": "application/json", "x-goog-api-key": config.apiKey ?? "" },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: JSON.stringify(input) },
                ...(document ? [{ inlineData: document }] : []),
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: geminiSchema(schema),
            maxOutputTokens: maxTokens,
            // Structured extraction, not reasoning: thinking would eat the output budget
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    )
  } catch (err: unknown) {
    const errorObj = err as { name?: string; message?: string; code?: number }
    if (
      errorObj?.name === "TimeoutError" ||
      errorObj?.message?.toLowerCase().includes("timeout") ||
      errorObj?.code === 23
    ) {
      throw new ProviderTimeoutError(`${config.label} request timed out after ${timeoutMs}ms`)
    }
    throw err
  }

  if (!response.ok) {
    const failure = await response.json().catch(() => null)
    const providerError = z
      .object({
        error: z.object({
          code: z.number().optional(),
          message: z.string().optional(),
          status: z.string().optional(),
          details: z.array(z.object({ reason: z.string().optional() })).optional(),
        }),
      })
      .safeParse(failure)
    const invalidKey =
      providerError.success &&
      providerError.data.error.details?.some((detail) => detail.reason === "API_KEY_INVALID")
    if (invalidKey || response.status === 401 || response.status === 403)
      throw new ProviderAuthError(`${config.label} credentials were not accepted`)
    // 402: AI Studio prepaid credits depleted.
    if (
      response.status === 402 ||
      response.status === 429 ||
      providerError.data?.error?.status === "RESOURCE_EXHAUSTED"
    )
      throw new ProviderQuotaError(`${config.label} quota exceeded or rate limited`)
    throw new Error(
      `AI provider unavailable (${response.status} ${providerError.data?.error.status ?? ""}): ${providerError.data?.error.message?.slice(0, 200) ?? ""}`,
    )
  }
  const raw = await response.json()
  const text = z
    .object({
      candidates: z.array(
        z.object({
          content: z.object({
            parts: z.array(
              z.object({ text: z.string().optional(), thought: z.boolean().optional() }),
            ),
          }),
        }),
      ),
    })
    .parse(raw)
    .candidates[0]?.content.parts.filter((part) => !part.thought)
    .map((part) => part.text || "")
    .join("")
  return text || ""
}

// Generate a vector embedding with Gemini Embedding (Vertex AI or Gemini API)
export async function generateEmbedding(
  config: ChatConfig,
  text: string,
  timeoutMs = 10_000,
): Promise<number[]> {
  if (!text || !config?.apiKey) return []
  const vertex = config.provider === "vertex"
  const project = process.env.GOOGLE_CLOUD_PROJECT || "voxian-shift-app"

  try {
    const url = vertex
      ? `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/gemini-embedding-2:predict`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent`

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (vertex) {
      headers.Authorization = `Bearer ${(await applicationDefault().getAccessToken()).access_token}`
    } else {
      headers["x-goog-api-key"] = config.apiKey ?? ""
    }

    const body = JSON.stringify({
      model: "models/gemini-embedding-2",
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    })

    const response = await fetch(url, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body,
    })

    if (!response.ok) return []
    const json = await response.json()

    const parsed = z
      .object({
        embedding: z.object({
          values: z.array(z.number()),
        }),
      })
      .safeParse(json)
    return parsed.success ? parsed.data.embedding.values : []
  } catch {
    return []
  }
}
