"use client"

import { useEffect, useState, useId } from "react"
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
  useEffect(() => {
    if (query.trim().length < 2) {
      setStatus("idle")
      setResults([])
      return
    }
    const controller = new AbortController()
    setStatus("loading")
    const timer = setTimeout(() => {
      fetch(`/api/occupations?q=${encodeURIComponent(query.trim())}`, {
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
  }, [query, attempt])
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
  const matches = query.trim().length >= 2 ? results : suggestions
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
          <p className="font-medium">{role.title}</p>
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
      <p className={fieldHelp}>
        Occupation data:{" "}
        <a
          className="underline"
          href="https://www.onetcenter.org/database.html"
          target="_blank"
          rel="noreferrer"
        >
          O*NET® 31.0 Database
        </a>
        , from the U.S. Department of Labor, Employment and Training Administration, adapted under{" "}
        <a
          className="underline"
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 4.0
        </a>
        . Voxian adds matching and illustrative exposure models; these additions are not endorsed by
        USDOL/ETA. US classification; titles may differ locally.
      </p>
    </section>
  )
}
