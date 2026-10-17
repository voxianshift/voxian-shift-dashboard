"use client"

import { useEffect, useState, useId, useRef } from "react"
import { Info, X } from "lucide-react"
import { occupationCode, occupationSearchSchema, type OccupationMatch } from "@voxian/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CareerProfile } from "@/lib/onboarding"
import { fieldHelp } from "@/lib/styles"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function OccupationPicker({
  profile,
  onChange,
  suggestions = [],
}: {
  profile: CareerProfile
  onChange: (patch: Partial<CareerProfile>) => void
  suggestions?: OccupationMatch[]
}) {
  const searchId = useId()
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(
    suggestions.length || profile.occupations.length ? "" : profile.currentWork,
  )
  const [results, setResults] = useState<OccupationMatch[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [attempt, setAttempt] = useState(0)
  const term = query.trim()
  useEffect(() => {
    if (term.length < 2) {
      setStatus("idle")
      setResults([])
      return
    }
    const controller = new AbortController()
    setStatus("loading")
    const timer = setTimeout(() => {
      fetch(`/api/occupations?q=${encodeURIComponent(term)}`, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Search unavailable")
          return occupationSearchSchema.parse(await response.json())
        })
        .then((data) => {
          if (!controller.signal.aborted) {
            setResults(data.occupations)
            setStatus("ready")
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus("error")
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term, attempt])
  // Legacy multi-role profiles without a main role show no selection until one role is chosen.
  const selected = occupationCode(
    profile.primaryOccupation || (profile.occupations.length === 1 ? profile.occupations[0]! : ""),
  )
  function choose(role: OccupationMatch | null) {
    onChange(
      role
        ? {
            occupations: [role.code],
            occupationNames: { [role.code]: role.title },
            primaryOccupation: role.code,
          }
        : { occupations: [], occupationNames: {}, primaryOccupation: "" },
    )
  }
  const matches = term.length >= 2 ? results : suggestions
  return (
    <section className="space-y-3" aria-label="Find your occupation">
      <label className="block text-[14px] font-medium" htmlFor={searchId}>
        Search your job title or duties
      </label>
      <div className="relative">
        <Input
          ref={searchInput}
          id={searchId}
          value={query}
          maxLength={800}
          className="pr-10"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. software developer, teacher, customer support"
        />
        {query.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            aria-label="Clear job title search"
            onClick={() => {
              setQuery("")
              setResults([])
              setStatus("idle")
              searchInput.current?.focus()
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <p className={fieldHelp}>Choose the one role that takes most of your time.</p>
      {status === "loading" && (
        <p role="status" className={fieldHelp}>
          Searching occupations…
        </p>
      )}
      {status === "error" && (
        <div role="alert">
          <p className={fieldHelp}>Search is unavailable. Your current selections are kept.</p>
          <Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            Retry search
          </Button>
        </div>
      )}
      {status === "ready" && !results.length && (
        <p className={fieldHelp}>
          No close matches. Try another title or a few words describing your duties.
        </p>
      )}
      {matches.map((role) => (
        <div key={role.code} className="rounded-lg border p-3 text-[14px] space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{role.title}</p>
            {role.match !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0 cursor-help rounded-full bg-mauve-soft px-2 py-0.5 text-[12px] font-medium text-mauve-ink tabular-nums">
                    {role.match}% match
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 text-[13px] leading-relaxed">
                  How closely your words match this occupation’s titles and typical tasks. A
                  relevance score, not a probability: check the description fits your work.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-muted-foreground">
            {role.category} · {role.code}
          </p>
          <Button
            type="button"
            variant="outline"
            aria-label={`${selected === role.code ? "Remove" : "Choose"} ${role.title}`}
            aria-pressed={selected === role.code}
            onClick={() => choose(selected === role.code ? null : role)}
          >
            {selected === role.code ? "Remove role" : "This fits my work"}
          </Button>
        </div>
      ))}
      {selected && (
        <div className="flex items-center justify-between gap-2 rounded-lg border p-3 text-[14px]">
          <span>
            <span className="block text-muted-foreground">Your selected role</span>
            <span className="font-medium">{profile.occupationNames[selected] ?? selected}</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove ${profile.occupationNames[selected] ?? selected}`}
            onClick={() => choose(null)}
          >
            Remove
          </Button>
        </div>
      )}
      <Tooltip>
        {/* <TooltipTrigger asChild>
          <button type="button" className={`${fieldHelp} inline-flex items-center gap-1`}>
            <Info className="size-3.5" /> Source: O*NET® 31.0 (US)
          </button>
        </TooltipTrigger> */}
        <TooltipContent className="max-w-72 text-[13px] leading-relaxed">
          Occupation data from the O*NET® 31.0 Database, U.S. Department of Labor, Employment and
          Training Administration, adapted under CC BY 4.0. Voxian adds matching and illustrative
          exposure models, not endorsed by USDOL/ETA. US classification; titles may differ locally.
        </TooltipContent>
      </Tooltip>
    </section>
  )
}
