"use client"

import { useState, useId, useRef } from "react"
import { Info, X } from "lucide-react"
import { libraryMatch, matchRoles, occupationCode, type OccupationMatch } from "@voxian/shared"
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
  const term = query.trim()
  const results =
    term.length >= 2
      ? matchRoles(term, 5)
          .map(libraryMatch)
          .filter((role) => role !== null)
      : []
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
              searchInput.current?.focus()
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <p className={fieldHelp}>Choose the one role that takes most of your time.</p>
      {term.length >= 2 && !results.length && (
        <p className={fieldHelp}>
          No close matches. Try another title, such as Bookkeeper or HR Recruiter.
        </p>
      )}
      {matches.map((role) => (
        <div key={role.code} className="rounded-lg border p-3 text-[14px] space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{role.title}</p>
            {role.match !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0 cursor-help rounded-full bg-brand-soft px-2 py-0.5 text-[12px] font-medium text-brand-ink tabular-nums">
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
        <TooltipTrigger asChild>
          <button type="button" className={`${fieldHelp} inline-flex items-center gap-1`}>
            <Info className="size-3.5" /> Source: Voxian Shift role library · ILO WP140
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-72 text-[13px] leading-relaxed">
          27 roles from the Voxian Shift role library, each with its ILO WP140 ISCO-08 code. Each
          role links to an O*NET® 31.0 occupation (U.S. Department of Labor, Employment and Training
          Administration, adapted under CC BY 4.0), not endorsed by USDOL/ETA.
        </TooltipContent>
      </Tooltip>
    </section>
  )
}
