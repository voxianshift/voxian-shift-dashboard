import { ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RESOURCES } from "@/lib/mock"

export default function ResourcesPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Resources"
        description="Learning picked for your selected path. Prices aren't verified."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {RESOURCES.map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <CardDescription>{r.provider}</CardDescription>
              <CardTitle>{r.title}</CardTitle>
            </CardHeader>
            <CardFooter className="justify-between">
              <Badge variant={r.free ? "secondary" : "outline"}>{r.free ? "Free" : "Paid"}</Badge>
              <Button variant="ghost" size="sm">
                Open <ExternalLink />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
