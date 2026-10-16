"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { AuthShell } from "@/components/auth/auth-shell"
import { FormField } from "@/components/auth/form-field"
import { Button } from "@/components/ui/button"
import { forgotSchema } from "@/lib/auth-schemas"

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
  })

  if (sentTo) {
    return (
      <AuthShell
        title="Check your email"
        description={`If an account exists for ${sentTo}, we sent a reset link.`}
      >
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MailCheck className="size-5" />
          </div>
        </div>
        {/* Static: stands in for the link in the email */}
        <Button asChild className="w-full">
          <Link href="/reset-password">Open reset link</Link>
        </Button>
        <BackToLogin />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit((v) => setSentTo(v.email))} className="space-y-3" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={formState.errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <BackToLogin />
    </AuthShell>
  )
}

function BackToLogin() {
  return (
    <p className="text-center text-base text-muted-foreground">
      <Link
        href="/login"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </p>
  )
}
