"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { AuthShell, OrDivider } from "@/components/auth/auth-shell"
import { FormField } from "@/components/auth/form-field"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { registerSchema } from "@/lib/auth-schemas"

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })
  const { errors } = formState

  return (
    <AuthShell title="Create account" description="Start your AI exposure check in a few minutes.">
      <div className="space-y-3">
        <GoogleButton label="Sign up with Google" />
        <OrDivider />
        <form onSubmit={handleSubmit(() => router.push("/home"))} className="space-y-3" noValidate>
          <FormField
            id="name"
            label="Full name"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <FormField
            id="password"
            label="Password"
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
            Create account
          </Button>
        </form>
      </div>
      <p className="text-center text-base text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
