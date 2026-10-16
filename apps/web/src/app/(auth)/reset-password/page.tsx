"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { AuthShell } from "@/components/auth/auth-shell"
import { FormField } from "@/components/auth/form-field"
import { Button } from "@/components/ui/button"
import { resetSchema } from "@/lib/auth-schemas"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  })
  const { errors } = formState

  function onSubmit() {
    toast.success("Password updated. Sign in with your new password.")
    router.push("/login")
  }

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a password with at least 8 characters."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <FormField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormField
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
      <p className="text-center text-base text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
