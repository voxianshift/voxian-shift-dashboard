"use client"

import { toast } from "sonner"
import { FormField } from "@/components/form-field"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6 p-6">
      <PageHeader title="Profile" description="How you appear in Voxian Shift." />
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground">AR</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Aina Rahman</CardTitle>
            <CardDescription>Customer Support Specialist</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <FormField id="name" label="Full name" defaultValue="Aina Rahman" />
          <FormField
            id="email"
            label="Email"
            type="email"
            defaultValue="aina@example.com"
            disabled
          />
          <FormField id="role" label="Current role" defaultValue="Customer Support Specialist" />
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => toast.success("Profile saved (demo only)")}>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
