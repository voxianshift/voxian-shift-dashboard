import { z } from "zod"
import { applicationDefault } from "firebase-admin/app"

export type ChatConfig = { provider: string; label: string; apiKey?: string; model: string }

export function chatConfig(): ChatConfig | null {
  const provider = process.env.CHAT_PROVIDER || "rootsys"
  if (provider === "rootsys")
    return {
      provider,
      label: "Rootsys",
      apiKey: process.env.ROOTSYS_API_KEY,
      model: process.env.ROOTSYS_MODEL || "glm-5.3-flashx",
    }
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

export class ProviderAuthError extends Error {}

// One JSON completion from the configured provider (Rootsys OpenAI-style or Gemini).
export async function completeJson(
  config: ChatConfig,
  systemPrompt: string,
  input: unknown,
  schema: unknown,
  maxTokens = 2000,
  timeoutMs = 20_000,
  document?: { mimeType: "application/pdf"; data: string },
): Promise<string> {
  const vertex = config.provider === "vertex"
  const gemini = vertex || config.provider === "gemini"
  if (document && !gemini) throw new Error("This provider cannot read PDF images")
  const project = process.env.GOOGLE_CLOUD_PROJECT || "voxian-shift-app"
  const response = await fetch(
    vertex
      ? `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${encodeURIComponent(config.model)}:generateContent`
      : gemini
        ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`
        : "https://rootsys.cloud/v1/chat/completions",
    {
      method: "POST",
      headers: vertex
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await applicationDefault().getAccessToken()).access_token}`,
          }
        : gemini
          ? { "Content-Type": "application/json", "x-goog-api-key": config.apiKey ?? "" }
          : { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(
        gemini
          ? {
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
                responseJsonSchema: schema,
                maxOutputTokens: maxTokens,
                // Structured extraction, not reasoning: thinking would eat the output budget
                thinkingConfig: { thinkingBudget: 0 },
              },
            }
          : {
              model: config.model,
              messages: [
                {
                  role: "system",
                  content: `${systemPrompt} Return only a JSON object, without Markdown, matching this JSON Schema: ${JSON.stringify(schema)}`,
                },
                { role: "user", content: JSON.stringify(input) },
              ],
              response_format: { type: "json_object" },
              max_tokens: maxTokens,
              stream: false,
            },
      ),
    },
  )
  if (!response.ok) {
    const failure = await response.json().catch(() => null)
    const providerError = z
      .object({
        error: z.object({
          details: z.array(z.object({ reason: z.string().optional() })).optional(),
        }),
      })
      .safeParse(failure)
    const invalidKey =
      providerError.success &&
      providerError.data.error.details?.some((detail) => detail.reason === "API_KEY_INVALID")
    if (invalidKey || response.status === 401 || response.status === 403)
      throw new ProviderAuthError(`${config.label} credentials were not accepted`)
    throw new Error("AI provider unavailable")
  }
  const raw = await response.json()
  const text = gemini
    ? z
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
    : z
        .object({ choices: z.array(z.object({ message: z.object({ content: z.string() }) })) })
        .parse(raw).choices[0]?.message.content
  return text || ""
}

// Generate vector embedding using Gemini Embedding (text-embedding-004) or provider fallback
export async function generateEmbedding(
  config: ChatConfig,
  text: string,
  timeoutMs = 10_000,
): Promise<number[]> {
  if (!text || !config?.apiKey) return []
  const gemini = config.provider === "gemini" || config.provider === "vertex"
  const vertex = config.provider === "vertex"
  const project = process.env.GOOGLE_CLOUD_PROJECT || "voxian-shift-app"

  try {
    const url = vertex
      ? `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/gemini-embedding-2:predict`
      : gemini
        ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent`
        : "https://rootsys.cloud/v1/embeddings"

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (vertex) {
      headers.Authorization = `Bearer ${(await applicationDefault().getAccessToken()).access_token}`
    } else if (gemini) {
      headers["x-goog-api-key"] = config.apiKey ?? ""
    } else {
      headers.Authorization = `Bearer ${config.apiKey}`
    }

    const body = gemini
      ? JSON.stringify({
          model: "models/gemini-embedding-2",
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        })
      : JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        })

    const response = await fetch(url, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body,
    })

    if (!response.ok) return []
    const json = await response.json()

    if (gemini) {
      const parsed = z
        .object({
          embedding: z.object({
            values: z.array(z.number()),
          }),
        })
        .safeParse(json)
      return parsed.success ? parsed.data.embedding.values : []
    }

    const parsed = z
      .object({
        data: z.array(z.object({ embedding: z.array(z.number()) })),
      })
      .safeParse(json)
    return parsed.success && parsed.data.data[0] ? parsed.data.data[0].embedding : []
  } catch {
    return []
  }
}
