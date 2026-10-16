"use client"

import { useEffect, useState, useId } from "react"
import { Info } from "lucide-react"
import { occupationCode, occupationSearchSchema, type OccupationMatch } from "@voxian/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const primaryId = useId()
  const [query, setQuery] = useState(
    suggestions.length || profile.occupations.length ? "" : profile.currentWork,
  )
  const [results, setResults] = useState<OccupationMatch[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [attempt, setAttempt] = useState(0)
  // Empty search box: match against the work description the person already gave
  const term = query.trim() || profile.currentWork.trim()
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
  function toggle(role: OccupationMatch) {
    const code = role.code
    const current = [...new Set(profile.occupations.map(occupationCode))]
    const occupations = current.includes(code)
      ? current.filter((id) => id !== code)
      : [...current, code].slice(0, 5)
    const names = { ...profile.occupationNames, [code]: role.title }
    onChange({
      occupations,
      occupationNames: Object.fromEntries(occupations.map((id) => [id, names[id] ?? id])),
      primaryOccupation: occupations.includes(occupationCode(profile.primaryOccupation))
        ? occupationCode(profile.primaryOccupation)
        : occupations.length === 1
          ? occupations[0]!
          : "",
    })
  }
  const matches = term.length >= 2 ? results : suggestions
  return (
    <section className="space-y-3" aria-label="Find your occupation">
      <label className="block text-[14px] font-medium" htmlFor={searchId}>
        Search your job title or duties
      </label>
      <Input
        id={searchId}
        value={query}
        maxLength={800}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="e.g. software developer, teacher, customer support"
      />
      <p className={fieldHelp}>
        Choose up to five roles that fit. Matching a role does not guarantee an exposure baseline.
      </p>
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
          <p className="leading-relaxed line-clamp-3">{role.description}</p>
          <p className="text-muted-foreground">{role.reason}</p>
          <p className={fieldHelp}>
            {role.baselineId
              ? "Illustrative Meter baseline available"
              : "Baseline being prepared · role can still be saved"}
          </p>
          <Button
            type="button"
            variant="outline"
            aria-label={`${profile.occupations.map(occupationCode).includes(role.code) ? "Remove" : "Choose"} ${role.title}`}
            aria-pressed={profile.occupations.map(occupationCode).includes(role.code)}
            disabled={
              profile.occupations.length >= 5 &&
              !profile.occupations.map(occupationCode).includes(role.code)
            }
            onClick={() => toggle(role)}
          >
            {profile.occupations.map(occupationCode).includes(role.code)
              ? "Remove role"
              : "This fits my work"}
          </Button>
        </div>
      ))}
      {profile.occupations.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-[14px] font-medium">Your selected roles</p>
          {profile.occupations.map((id) => (
            <div key={id} className="flex items-center justify-between gap-2 text-[14px]">
              <span>
                {profile.occupationNames[id] ??
                  (id === "customer-support"
                    ? "Customer Support Specialist"
                    : id === "administrative-assistant"
                      ? "Administrative & Executive Assistant"
                      : id)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove ${profile.occupationNames[id] ?? id}`}
                onClick={() => {
                  const occupations = profile.occupations.filter((code) => code !== id)
                  onChange({
                    occupations,
                    primaryOccupation:
                      occupations.length === 1
                        ? occupations[0]!
                        : occupations.includes(profile.primaryOccupation)
                          ? profile.primaryOccupation
                          : "",
                  })
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {profile.occupations.length > 1 && (
            <>
              <label htmlFor={primaryId} className={fieldHelp}>
                Which role takes most of your time?
              </label>
              <Select
                value={profile.primaryOccupation || "unselected"}
                onValueChange={(value) =>
                  onChange({ primaryOccupation: value === "unselected" ? "" : value })
                }
              >
                <SelectTrigger id={primaryId} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Choose your main role</SelectItem>
                  {profile.occupations.map((id) => (
                    <SelectItem value={id} key={id}>
                      {profile.occupationNames[id] ?? id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={`${fieldHelp} inline-flex items-center gap-1`}>
            <Info className="size-3.5" /> Source: O*NET® 31.0 (US)
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-72 text-[13px] leading-relaxed">
          Occupation data from the O*NET® 31.0 Database, U.S. Department of Labor, Employment and
          Training Administration, adapted under CC BY 4.0. Voxian adds matching and illustrative
          exposure models, not endorsed by USDOL/ETA. US classification; titles may differ locally.
        </TooltipContent>
      </Tooltip>
    </section>
  )
}
