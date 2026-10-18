import { afterEach, expect, test, vi } from "vite-plus/test"
import { createCvEmbeddings } from "./cv-embeddings.ts"
vi.mock("firebase-admin/app", () => ({
  applicationDefault: () => ({ getAccessToken: async () => ({ access_token: "test-token" }) }),
}))
afterEach(() => vi.unstubAllGlobals())
test("Vertex embedding transport uses predict instances, bounded dimensions and validates response", async () => {
  const values = Array.from({ length: 768 }, (_, i) => (i === 0 ? 1 : 0))
  const fetch = vi.fn(async (_url: unknown, _init?: RequestInit) =>
    Response.json({ predictions: [{ embeddings: { values } }] }),
  )
  vi.stubGlobal("fetch", fetch)
  expect(await createCvEmbeddings().embed(["Hosted model API"])).toEqual([values])
  const body = JSON.parse(fetch.mock.calls[0]![1]!.body as string)
  expect(body.instances).toEqual([
    { content: "Hosted model API", task_type: "SEMANTIC_SIMILARITY" },
  ])
  expect(body.parameters.outputDimensionality).toBe(768)
  expect(await createCvEmbeddings().embed([])).toEqual([])
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ predictions: [{ embeddings: { values: [1, 2] } }] })),
  )
  await expect(createCvEmbeddings().embed(["Example"])).rejects.toThrow()
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ error: "sensitive upstream error" }, { status: 403 })),
  )
  await expect(createCvEmbeddings().embed(["Example"])).rejects.toThrow(
    "CV embedding provider unavailable (403)",
  )
})
