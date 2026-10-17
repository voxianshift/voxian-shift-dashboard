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
      label: "Gemini",
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
): Promise<string> {
  const vertex = config.provider === "vertex"
  const gemini = vertex || config.provider === "gemini"
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
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify(
        gemini
          ? {
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
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
