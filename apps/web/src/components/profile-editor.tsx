"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OccupationPicker } from "@/components/occupation-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { questions, type CareerProfile, type ProfileField } from "@/lib/onboarding"
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
  return (
    <div>
      {questions
        .filter((question) => !fields || fields.includes(question.field))
        .map((question) => {
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
                <label htmlFor={`profile-${field}`}>
                  {question.title}{" "}
                  <span>
                    {field === "currentWork" ? "Choose a role that matches your work" : "Optional"}
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
                <>
                  <OccupationPicker profile={profile} onChange={update} />
                  <Textarea
                    id={`profile-${field}`}
                    maxLength={800}
                    placeholder="Or describe your work, including other roles…"
                    value={profile.currentWork}
                    onChange={(e) => update({ currentWork: e.target.value })}
                  />
                </>
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
                <>
                  <div className={fieldChips}>
                    {question.options.map((option) => (
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
                  <Input
                    id={`profile-${field}`}
                    key={value.join("; ")}
                    defaultValue={value.join("; ")}
                    placeholder="Or add your own; separate with semicolons"
                    maxLength={800}
                    onBlur={(e) =>
                      update({
                        [field]: e.target.value
                          .split(";")
                          .map((v) => v.trim())
                          .filter(Boolean)
                          .slice(0, 8),
                      })
                    }
                  />
                </>
              ) : (
                <>
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
                  {question.options.length > 0 && (
                    <div className={cn(fieldChips, "mt-2")}>
                      {question.options.map((option) => (
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
                </>
              )}
            </section>
          )
        })}
    </div>
  )
}
