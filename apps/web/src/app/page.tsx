import { SCORING_VERSION } from "@voxian/shared"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Voxian Shift</h1>
      <Badge variant="secondary">Scoring v{SCORING_VERSION}</Badge>
    </main>
  )
}
