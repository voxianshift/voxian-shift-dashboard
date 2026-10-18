import { Badge } from "@/components/ui/badge"
import { attendanceStatus } from "@/lib/commitment"

const colors = {
  "On track": "border-brand/40 bg-brand/10 text-brand-ink",
  Attended: "border-success/40 bg-success/10 text-success",
  Missed: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function AttendanceBadge({ status }: { status: ReturnType<typeof attendanceStatus> }) {
  return (
    <Badge variant="outline" className={colors[status]}>
      {status}
    </Badge>
  )
}
