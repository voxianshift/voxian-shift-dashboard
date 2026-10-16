import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OCCUPATIONS } from "@/lib/mock"

export default function ExplorePage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Explore occupations"
        description="See how AI exposure differs across roles."
      >
        <Input placeholder="Search occupations" className="w-64" />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OCCUPATIONS.map((o) => (
          <Card key={o.code}>
            <CardHeader>
              <CardDescription>ISCO-08 {o.code}</CardDescription>
              <CardTitle>{o.title}</CardTitle>
            </CardHeader>
            <CardFooter className="justify-between">
              <span className="text-2xl font-semibold">{o.exposure}</span>
              <Badge variant={o.status === "Available" ? "default" : "secondary"}>{o.status}</Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
