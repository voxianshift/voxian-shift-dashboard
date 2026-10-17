import { expect, test } from "vite-plus/test"
import { randomBytes } from "node:crypto"
import { createChatStore } from "./chat-store.ts"

test.skipIf(!process.env.TEST_DATABASE_URL)(
  "Postgres retains ordered turns across fresh connections and isolates owners",
  async () => {
    const url = process.env.TEST_DATABASE_URL!
    const owner = randomBytes(32).toString("hex")
    const other = randomBytes(32).toString("hex")
    const first = createChatStore(url)
    try {
      await first.append(
        owner,
        "My work includes 'quotes' and $1; DROP TABLE lumi_chat_turns;",
        "Lumi’s first reply",
      )
      await first.append(owner, "Second message", "Second reply")
      await first.append(other, "Other guest", "Private reply")
    } finally {
      await first.close()
    }
    const reopened = createChatStore(url)
    try {
      const messages = await reopened.history(owner)
      expect(messages).toHaveLength(4)
      expect(messages[0]!.text).toContain("DROP TABLE")
      expect(messages[3]).toEqual({ role: "assistant", text: "Second reply" })
      expect(await reopened.history(other)).toHaveLength(2)
      await reopened.clear(owner)
      expect(await reopened.history(owner)).toEqual([])
      expect(await reopened.history(other)).toHaveLength(2)
    } finally {
      await reopened.clear(owner)
      await reopened.clear(other)
      await reopened.close()
    }
  },
)
