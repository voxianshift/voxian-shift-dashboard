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
import { loginSchema } from "@/lib/auth-schemas"

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })
  const { errors } = formState

  return (
    <AuthShell title="Welcome back" description="Sign in to see how AI is changing your work.">
      <div className="space-y-3">
        <GoogleButton />
        <OrDivider />
        <form onSubmit={handleSubmit(() => router.push("/home"))} className="space-y-3" noValidate>
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
      <p className="text-center text-base text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}
