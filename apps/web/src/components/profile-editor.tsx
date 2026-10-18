"use client"

import { useState } from "react"
import { CvUpload } from "@/components/cv-upload"
import type { OccupationMatch } from "@voxian/shared"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OccupationPicker } from "@/components/occupation-picker"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  questions,
  requiredProfileFields,
  type CareerProfile,
  type ProfileField,
} from "@/lib/onboarding"
import { answerChips } from "@/lib/styles"
import { cn } from "@/lib/utils"

// Compact chips inside a profile field
const fieldChips = cn(answerChips, "mb-2.5 [&_button]:min-h-[34px] [&_button]:text-[13px]")

export function ProfileEditor({
  profile,
  onChange: update,
  fields,
  bordered = true,
}: {
  profile: CareerProfile
  onChange: (patch: Partial<CareerProfile>) => void
  fields?: readonly ProfileField[]
  /** Divider under each field (off in the one-question-at-a-time questionnaire) */
  bordered?: boolean
}) {
  const [cvMatches, setCvMatches] = useState<OccupationMatch[]>([])
  return (
    <div>
      {(fields
        ? fields.flatMap((field) => questions.filter((question) => question.field === field))
        : questions
      ).map((question) => {
        const field = question.field
        const value = profile[field]
        return (
          <section
            className={cn(
              "py-[18px] [&_[data-slot=select-trigger]]:h-auto [&_[data-slot=select-trigger]]:min-h-11 [&_[data-slot=select-trigger]]:text-[15px] [&_[data-slot=select-trigger]]:whitespace-normal [&_input]:min-h-[42px] [&_input]:text-[16px] [&_textarea]:min-h-[42px] [&_textarea]:text-[16px]",
              bordered && "border-b",
            )}
            key={field}
          >
            <div className="mb-2.5 flex items-start justify-between gap-2 [&_label]:text-[15px] [&_label]:leading-[1.6] [&_label>span]:block [&_label>span]:text-[12px] [&_label>span]:text-muted-foreground">
              <label id={`profile-${field}-label`} htmlFor={`profile-${field}`}>
                {question.title}{" "}
                <span>
                  {field === "currentWork"
                    ? "Choose a role that matches your work"
                    : requiredProfileFields.includes(field)
                      ? "Required · used to schedule your learning"
                      : "Optional"}
                </span>
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Why we ask: ${question.title}`}
                  >
                    <HelpCircle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[14px] leading-relaxed">
                  {question.help}
                </TooltipContent>
              </Tooltip>
            </div>
            {field === "currentWork" ? (
              <div className="space-y-4">
                <OccupationPicker profile={profile} onChange={update} />
                <CvUpload
                  onAccept={(context, matches) => {
                    // Matches arrive closest-first; the top one becomes the main role, others stay as alternatives.
                    const [closest, ...others] = matches
                    update({
                      cvContext: context,
                      ...(closest && {
                        occupations: [closest.code],
                        primaryOccupation: closest.code,
                        occupationNames: { [closest.code]: closest.title },
                      }),
                    })
                    setCvMatches(others)
                  }}
                />
                {cvMatches.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Other close matches from your CV
                    </p>
                    {cvMatches.map((role) => (
                      <Button
                        key={role.code}
                        type="button"
                        variant="outline"
                        className="h-auto w-full justify-start whitespace-normal text-left"
                        onClick={() => {
                          update({
                            occupations: [role.code],
                            primaryOccupation: role.code,
                            occupationNames: { [role.code]: role.title },
                          })
                          setCvMatches([])
                        }}
                      >
                        {role.title}
                      </Button>
                    ))}
                  </div>
                )}
                {profile.cvContext && (
                  <section aria-label="Saved CV details" className="rounded-lg border p-3 text-sm">
                    <h3 className="font-medium">Reviewed CV context</h3>
                    <p className="mt-1">{profile.cvContext.jobTitles.join(" · ")}</p>
                    <p className="mt-2 text-muted-foreground">
                      {profile.cvContext.keywords.join(" · ")}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="mt-1 h-auto p-0"
                      onClick={() => {
                        update({ cvContext: null })
                        setCvMatches([])
                      }}
                    >
                      Remove CV details
                    </Button>
                  </section>
                )}
              </div>
            ) : field === "taskFocus" ? (
              <Select
                value={profile.taskFocus || "unanswered"}
                onValueChange={(v) =>
                  update({
                    taskFocus: v === "unanswered" ? "" : (v as CareerProfile["taskFocus"]),
                  })
                }
              >
                <SelectTrigger id={`profile-${field}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unanswered">Leave unanswered</SelectItem>
                  <SelectItem value="routine">Routine questions & coordination</SelectItem>
                  <SelectItem value="escalations">Complex problems & exceptions</SelectItem>
                  <SelectItem value="mixed">A bit of both</SelectItem>
                </SelectContent>
              </Select>
            ) : Array.isArray(value) ? (
              // Answer options only; an earlier custom answer (e.g. from Lumi chat) stays as a chip.
              <div className={fieldChips} role="group" aria-labelledby={`profile-${field}-label`}>
                {[...new Set([...question.options, ...value.filter(Boolean)])].map((option) => (
                  <Button
                    type="button"
                    variant="outline"
                    key={option}
                    aria-pressed={value.includes(option)}
                    onClick={() =>
                      update({
                        [field]: value.includes(option)
                          ? value.filter((v) => v !== option)
                          : [...value, option].slice(0, 8),
                      })
                    }
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : question.options.length === 0 ? (
              // Free text only where there is no sensible option list (name, concerns).
              <Input
                id={`profile-${field}`}
                maxLength={field === "preferredName" ? 80 : 800}
                value={value}
                placeholder={
                  field === "anxieties"
                    ? "Only share what you feel comfortable sharing"
                    : "Leave blank to skip"
                }
                onChange={(e) => update({ [field]: e.target.value })}
              />
            ) : (
              <div className={fieldChips} role="group" aria-labelledby={`profile-${field}-label`}>
                {[...new Set([...question.options, ...(value ? [value] : [])])].map((option) => (
                  <Button
                    type="button"
                    key={option}
                    variant="outline"
                    aria-pressed={value === option}
                    onClick={() => update({ [field]: value === option ? "" : option })}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
