import { Badge } from "@/components/ui/badge"
import { attendanceStatus } from "@/lib/commitment"

const colors = {
  "On track": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Attended: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Missed: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
}

export function AttendanceBadge({ status }: { status: ReturnType<typeof attendanceStatus> }) {
  return (
    <Badge variant="outline" className={colors[status]}>
      {status}
    </Badge>
  )
}
