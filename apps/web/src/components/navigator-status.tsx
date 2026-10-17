"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useNavigator } from "@/components/navigator-provider"

export function NavigatorStatus() {
  const { status, error, retry } = useNavigator()
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-[30px] font-medium tracking-[-0.8px]">Your next move starts with you.</h1>
      {status === "missing" ? (
        <>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Choose your main occupation so Navigator can prepare directions for your work. Goals and
            other preferences are optional.
          </p>
          <Button asChild className="mt-6">
            <Link href="/home">Set up my profile</Link>
          </Button>
        </>
      ) : status === "error" ? (
        <div role="alert">
          <p className="mt-4 text-[16px] text-muted-foreground">
            {error || "Your career paths could not be prepared."}
          </p>
          <Button className="mt-6" onClick={retry}>
            Retry career paths
          </Button>
        </div>
      ) : (
        <p role="status" className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          Preparing directions from your saved occupations and career preferences…
        </p>
      )}
    </div>
  )
}
