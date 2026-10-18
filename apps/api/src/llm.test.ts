import { expect, test } from "vite-plus/test"
import { geminiSchema } from "./llm.ts"

test("gemini wire schema drops large enums and maxItems but keeps small limits", () => {
  const schema = {
    type: "object",
    properties: {
      strategy: { type: "string", enum: ["a", "b", "c", "d"] },
      resource: { type: "string", enum: ["a", "b", "c", "d", "e"] },
      picks: { type: "array", maxItems: 3, items: { type: "string" } },
      assessments: { type: "array", maxItems: 20, items: { type: "object" } },
    },
    required: ["strategy"],
  }
  expect(geminiSchema(schema)).toEqual({
    type: "object",
    properties: {
      strategy: { type: "string", enum: ["a", "b", "c", "d"] },
      resource: { type: "string" },
      picks: { type: "array", maxItems: 3, items: { type: "string" } },
      assessments: { type: "array", items: { type: "object" } },
    },
    required: ["strategy"],
  })
})
