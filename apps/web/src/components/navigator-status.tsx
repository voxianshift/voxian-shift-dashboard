"use client"

import Link from "next/link"
import { LoaderCircle } from "lucide-react"
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
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="mt-6 flex items-center gap-3 text-muted-foreground"
        >
          <LoaderCircle
            className="size-5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-foreground">Fetching your career paths…</p>
            <p className="mt-1 text-sm">
              Matching your role and preferences. This can take up to a minute.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
