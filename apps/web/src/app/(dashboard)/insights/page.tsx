import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INSIGHTS } from "@/lib/mock"

export default function InsightsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Insights"
        description="Observed evidence is kept separate from forward-looking scenarios."
      />
      <Card>
        <CardHeader>
          <CardTitle>Evidence timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-6 border-l pl-6">
            {INSIGHTS.map((i) => (
              <li key={i.date} className="relative">
                <span className="absolute top-1.5 -left-[29px] size-2.5 rounded-full bg-primary" />
                <div className="flex items-center gap-2">
                  <p className="font-medium">{i.date}</p>
                  <Badge variant={i.label === "Scenario" ? "outline" : "secondary"}>
                    {i.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{i.text}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
