import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BRANCHES, EXPOSURE, MILESTONES, ROLE, TASKS } from "@/lib/mock"

export default function HomePage() {
  const moat = TASKS.filter((t) => t.moat).length
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Welcome back, Aina" description={`${ROLE.title} · ${ROLE.code}`}>
        <Button asChild>
          <Link href="/roadmap">Open roadmap</Link>
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Task exposure score</CardDescription>
            <CardTitle className="text-4xl">{EXPOSURE.toFixed(1)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={EXPOSURE} />
            <p className="text-sm text-muted-foreground">
              Share of your weighted tasks that current AI can do.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Human-moat tasks</CardDescription>
            <CardTitle className="text-4xl">
              {moat}
              <span className="text-lg text-muted-foreground"> / {TASKS.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tasks where people still clearly outperform AI.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Roadmap progress</CardDescription>
            <CardTitle className="text-4xl">
              {MILESTONES.filter((m) => m.done).length}
              <span className="text-lg text-muted-foreground"> / {MILESTONES.length} phases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">120-day paced plan · 2–4 hours a week</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your possible paths</CardTitle>
          <CardDescription>
            Suggestions based on your strengths, not guaranteed promotions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {BRANCHES.map((b) => (
            <div key={b.name} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${b.color}`} />
                <p className="font-medium">{b.name}</p>
              </div>
              <Badge variant="outline">{b.fit}</Badge>
              <p className="text-sm text-muted-foreground">{b.roles.join(" → ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
