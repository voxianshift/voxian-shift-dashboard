import { randomBytes } from "node:crypto"
import { Pool } from "pg"
import { expect, test, vi } from "vite-plus/test"
import { emptyProfile, type CvContext } from "@voxian/shared"
import { createCvVectorStore } from "./cv-vector-store.ts"
import { skillRequirements } from "./skill-requirements.ts"

const cv: CvContext = {
  reviewed: true,
  confidence: 0.9,
  jobTitles: ["Developer"],
  skills: ["TypeScript", "Model API integration", "Testing", "Accessibility"],
  keywords: ["Software"],
  workHistory: [],
}
const vec = (index = 0) => Array.from({ length: 768 }, (_, i) => (i === index ? 1 : 0))
const database = process.env.TEST_DATABASE_URL

test.runIf(!!database)(
  "vector cache isolates owners and revisions, refreshes requirements and clears replaced/reset CVs",
  async () => {
    const pool = new Pool({ connectionString: database })
    const owners = [randomBytes(32).toString("hex"), randomBytes(32).toString("hex")]
    const model = `test:${randomBytes(8).toString("hex")}`
    const embed = vi.fn(async (texts: string[]) => texts.map(() => vec()))
    const store = createCvVectorStore(database!, { model, embed })
    const requirements = skillRequirements("15-1252.00", "hybrid")
    try {
      for (const [index, owner] of owners.entries())
        await pool.query("INSERT INTO guest_profiles(owner_hash,state) VALUES($1,$2)", [
          owner,
          JSON.stringify({
            profile: {
              ...emptyProfile,
              cvContext: { ...cv, skills: [...cv.skills, `Private owner ${index}`] },
            },
          }),
        ])
      const profileA = { ...cv, skills: [...cv.skills, "Private owner 0"] }
      const profileB = { ...cv, skills: [...cv.skills, "Private owner 1"] }
      const a = await store.candidates(owners[0]!, profileA, requirements)
      expect(Object.keys(a.byRequirement)).toHaveLength(3)
      expect(Object.values(a.byRequirement).flat()).not.toContain("Private owner 1")
      await store.candidates(owners[1]!, profileB, requirements)
      const calls = embed.mock.calls.filter(([texts]) => texts.length > 0).length
      await store.candidates(owners[0]!, profileA, requirements)
      expect(embed.mock.calls.filter(([texts]) => texts.length > 0)).toHaveLength(calls)
      await store.candidates(owners[0]!, profileA, [
        { ...requirements[0]!, definition: "Changed definition", version: "test-new" },
      ])
      expect(embed.mock.calls.at(-1)![0]).toHaveLength(1)
      await pool.query(
        "UPDATE guest_profiles SET state=jsonb_set(state,'{profile,preferredName}',to_jsonb('Changed'::text)) WHERE owner_hash=$1",
        [owners[0]],
      )
      expect(
        Number(
          (
            await pool.query("SELECT count(*) FROM cv_evidence_vectors WHERE owner_hash=$1", [
              owners[0],
            ])
          ).rows[0].count,
        ),
      ).toBeGreaterThan(0)
      await pool.query(
        "UPDATE guest_profiles SET state=jsonb_set(state,'{profile,cvContext}','null') WHERE owner_hash=$1",
        [owners[0]],
      )
      expect(
        Number(
          (
            await pool.query("SELECT count(*) FROM cv_evidence_vectors WHERE owner_hash=$1", [
              owners[0],
            ])
          ).rows[0].count,
        ),
      ).toBe(0)
      const before = embed.mock.calls.length
      await expect(store.candidates(owners[0]!, profileA, requirements)).rejects.toThrow(
        "CV revision",
      )
      expect(embed.mock.calls).toHaveLength(before)
      await pool.query("DELETE FROM guest_profiles WHERE owner_hash=$1", [owners[1]])
      expect(
        Number(
          (
            await pool.query("SELECT count(*) FROM cv_evidence_vectors WHERE owner_hash=$1", [
              owners[1],
            ])
          ).rows[0].count,
        ),
      ).toBe(0)
    } finally {
      await pool.query("DELETE FROM guest_profiles WHERE owner_hash=ANY($1::text[])", [owners])
      await pool.query("DELETE FROM skill_requirement_vectors WHERE model=$1", [model])
      await store.close()
      await pool.end()
    }
  },
)

test.runIf(!!database)(
  "in-flight embeddings cannot resurrect deleted guest CV evidence",
  async () => {
    const pool = new Pool({ connectionString: database })
    const owner = randomBytes(32).toString("hex")
    const model = `test:${randomBytes(8).toString("hex")}`
    let ready!: () => void
    let release!: () => void
    const started = new Promise<void>((resolve) => {
      ready = resolve
    })
    const hold = new Promise<void>((resolve) => {
      release = resolve
    })
    const store = createCvVectorStore(database!, {
      model,
      embed: async (texts) => {
        ready()
        await hold
        return texts.map(() => vec())
      },
    })
    try {
      await pool.query("INSERT INTO guest_profiles(owner_hash,state) VALUES($1,$2)", [
        owner,
        JSON.stringify({ profile: { ...emptyProfile, cvContext: cv } }),
      ])
      const pending = store.candidates(owner, cv, skillRequirements("15-1252.00", "hybrid"))
      await started
      await pool.query("DELETE FROM guest_profiles WHERE owner_hash=$1", [owner])
      const rejected = expect(pending).rejects.toThrow("CV changed")
      release()
      await rejected
      expect(
        Number(
          (
            await pool.query("SELECT count(*) FROM cv_evidence_vectors WHERE owner_hash=$1", [
              owner,
            ])
          ).rows[0].count,
        ),
      ).toBe(0)
    } finally {
      release()
      await pool.query("DELETE FROM guest_profiles WHERE owner_hash=$1", [owner])
      await pool.query("DELETE FROM skill_requirement_vectors WHERE model=$1", [model])
      await store.close()
      await pool.end()
    }
  },
)
