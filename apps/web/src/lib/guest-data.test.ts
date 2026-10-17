import { afterEach, expect, test, vi } from "vite-plus/test"
import { loadCommitment, saveCommitment, type Commitment } from "./commitment"

const commitment: Commitment = {
  version: 1,
  pathId: "hybrid",
  direction: "Grow with AI",
  role: "Platform Engineer",
  sprint: true,
  hours: "1–3 hours",
  timeOfDay: "morning",
  days: "weekdays",
  startDate: "2026-10-19",
  completed: ["2026-10-19"],
}
afterEach(() => vi.unstubAllGlobals())

test("database commitment wins over old browser data", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ commitment }))
  const getItem = vi.fn(() => JSON.stringify({ ...commitment, direction: "Stale" }))
  vi.stubGlobal("fetch", fetch)
  vi.stubGlobal("localStorage", { getItem })
  expect(await loadCommitment()).toEqual(commitment)
  expect(getItem).not.toHaveBeenCalled()
})

test("existing browser commitment migrates only after successful database write", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ commitment: null }))
    .mockResolvedValueOnce(Response.json({ commitment }))
  const removeItem = vi.fn()
  vi.stubGlobal("fetch", fetch)
  vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(commitment), removeItem })
  expect(await loadCommitment()).toEqual(commitment)
  expect(fetch).toHaveBeenLastCalledWith(
    "/api/guest/commitment",
    expect.objectContaining({ method: "PUT", body: JSON.stringify(commitment) }),
  )
  expect(removeItem).toHaveBeenCalledWith("voxian-commitment-v1")
})

test("failed progress save rejects and keeps browser migration data", async () => {
  const removeItem = vi.fn()
  vi.stubGlobal("localStorage", { removeItem })
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async () => Response.json({ error: "Offline" }, { status: 503 })),
  )
  await expect(saveCommitment(commitment)).rejects.toThrow("Offline")
  expect(removeItem).not.toHaveBeenCalled()
  await expect(loadCommitment()).rejects.toThrow("Offline")
})

test("invalid progress dates never reach API", async () => {
  const fetch = vi.fn()
  vi.stubGlobal("fetch", fetch)
  await expect(saveCommitment({ ...commitment, completed: ["2026-02-30"] })).rejects.toThrow()
  expect(fetch).not.toHaveBeenCalled()
})
