import { pathIdSchema } from "@voxian/shared"
import { curatedOccupationCodes } from "../src/navigator-pathways.ts"
import { skillRequirements } from "../src/skill-requirements.ts"
import { createCvVectorStore } from "../src/cv-vector-store.ts"
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")
const store = createCvVectorStore(process.env.DATABASE_URL)
try {
  const requirements = curatedOccupationCodes.flatMap((code) =>
    pathIdSchema.options.flatMap((id) => skillRequirements(code, id)),
  )
  console.log(
    JSON.stringify({ requirements: requirements.length, embedded: await store.seed(requirements) }),
  )
} finally {
  await store.close()
}
