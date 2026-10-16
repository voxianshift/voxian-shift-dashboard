import { CircleCheck, Circle } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MILESTONES } from "@/lib/mock"

export default function RoadmapPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Roadmap"
        description="Your plan toward Escalation Lead on the Strategic Client Advocate path."
      >
        <Tabs defaultValue="lean">
          <TabsList>
            <TabsTrigger value="lean">Paced · 120 days</TabsTrigger>
            <TabsTrigger value="intensive">Sprint · 90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>
      <div className="space-y-3">
        {MILESTONES.map((m) => (
          <Card key={m.phase}>
            <CardHeader className="flex-row items-start gap-3">
              {m.done ? (
                <CircleCheck className="mt-0.5 size-5 text-success" />
              ) : (
                <Circle className="mt-0.5 size-5 text-muted-foreground" />
              )}
              <div className="space-y-1">
                <CardDescription>{m.days}</CardDescription>
                <CardTitle>{m.phase}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">{m.goal}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
