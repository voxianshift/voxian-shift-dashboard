import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { EXPOSURE, SKILLS, TASKS } from "@/lib/mock"

export default function SkillAnalysePage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Skill analyse"
        description={`Exposure E = 100 × Σ weight × exposure = ${EXPOSURE.toFixed(1)}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Task audit</CardTitle>
          <CardDescription>How each task contributes to your score.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 font-medium">Task</th>
                <th className="py-2 font-medium">Weight</th>
                <th className="py-2 font-medium">AI exposure</th>
                <th className="py-2 font-medium">Contribution</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {TASKS.map((t) => (
                <tr key={t.name} className="border-b last:border-0">
                  <td className="py-3">{t.name}</td>
                  <td className="py-3">{t.weight.toFixed(2)}</td>
                  <td className="py-3">{t.exposure.toFixed(2)}</td>
                  <td className="py-3">+{(t.weight * t.exposure * 100).toFixed(1)}</td>
                  <td className="py-3 text-right">
                    <Badge variant={t.moat ? "secondary" : "outline"}>
                      {t.moat ? "Human moat" : "High automation"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Skill gaps</CardTitle>
          <CardDescription>
            Self-assessed today; aim for 70+ before your target role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SKILLS.map((s) => (
            <div key={s.name} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>{s.name}</span>
                <span className="text-muted-foreground">{s.level}</span>
              </div>
              <Progress value={s.level} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
