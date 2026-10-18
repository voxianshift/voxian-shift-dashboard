import { applicationDefault } from "firebase-admin/app"
import { z } from "zod"

export const cvEmbeddingModel = "vertex:gemini-embedding-001:SEMANTIC_SIMILARITY:768"
export const cvVectorSchema = z
  .array(z.number().finite())
  .length(768)
  .refine((values) => values.some((value) => value !== 0))
export interface CvEmbeddings {
  model: string
  embed(texts: string[], signal?: AbortSignal): Promise<number[][]>
}
export function createCvEmbeddings(): CvEmbeddings {
  return {
    model: cvEmbeddingModel,
    async embed(texts, signal = AbortSignal.timeout(25_000)) {
      if (!texts.length) return []
      if (texts.length > 400 || texts.some((text) => !text.trim() || text.length > 4000))
        throw new Error("Invalid embedding batch")
      const token = await applicationDefault().getAccessToken()
      signal.throwIfAborted()
      const project = process.env.GOOGLE_CLOUD_PROJECT || "voxian-shift-app"
      const region = process.env.CV_EMBEDDING_REGION || "us-central1"
      if (!/^[a-z0-9-]+$/.test(project) || !/^[a-z0-9-]+$/.test(region))
        throw new Error("Invalid embedding location")
      const failure = new AbortController()
      const batchSignal = AbortSignal.any([signal, failure.signal])
      const vectors: number[][] = []
      let next = 0
      try {
        await Promise.all(
          Array.from({ length: Math.min(6, texts.length) }, async () => {
            while (next < texts.length) {
              batchSignal.throwIfAborted()
              const index = next++
              const response = await fetch(
                `https://${region}-aiplatform.googleapis.com/v1/projects/${project}/locations/${region}/publishers/google/models/gemini-embedding-001:predict`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.access_token}`,
                  },
                  signal: batchSignal,
                  body: JSON.stringify({
                    instances: [{ content: texts[index], task_type: "SEMANTIC_SIMILARITY" }],
                    parameters: { outputDimensionality: 768, autoTruncate: false },
                  }),
                },
              )
              if (!response.ok)
                throw new Error(`CV embedding provider unavailable (${response.status})`)
              const body = z
                .object({
                  predictions: z
                    .array(z.object({ embeddings: z.object({ values: cvVectorSchema }) }))
                    .length(1),
                })
                .parse(await response.json())
              vectors[index] = body.predictions[0]!.embeddings.values
            }
          }),
        )
      } catch (error) {
        failure.abort()
        throw error
      }
      return vectors
    },
  }
}
