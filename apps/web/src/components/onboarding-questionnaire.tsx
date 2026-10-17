"use client"

import { toast } from "sonner"
import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useCareerProfile } from "@/components/career-profile-provider"
import { ProfileEditor } from "@/components/profile-editor"
import { Button } from "@/components/ui/button"
import {
  askedQuestions,
  hasAnswer,
  nextQuestion,
  questions,
  requiredProfileFields,
} from "@/lib/onboarding"
import { eyebrow, fieldHelp } from "@/lib/styles"
import { cn } from "@/lib/utils"

export function OnboardingQuestionnaire({
  detailed,
  onReview,
}: {
  detailed: boolean
  onReview: () => void
}) {
  const { profile, update, skipped, skip, saveOccupations } = useCareerProfile()
  const [saving, setSaving] = useState(false)
  const [index, setIndex] = useState(() => {
    const next = nextQuestion(profile, skipped, detailed)
    return next ? questions.indexOf(next) : -1
  })
  const question = questions[index]
  const asked = askedQuestions(detailed)
  const total = asked.length
  const position = question ? asked.indexOf(question) : -1

  async function advance(skipping = false) {
    if (saving) return
    if (question?.field === "currentWork") {
      setSaving(true)
      try {
        update(await saveOccupations(profile))
      } catch {
        toast.error("Occupation choices could not be saved. Try again.")
        return
      } finally {
        setSaving(false)
      }
    }
    if (!question) {
      onReview()
      return
    }
    const leaveOut = skipping || !hasAnswer(profile, question.field)
    if (leaveOut) skip(question.field)
    const next = nextQuestion(profile, leaveOut ? [...skipped, question.field] : skipped, detailed)
    if (next) setIndex(questions.indexOf(next))
    else onReview()
  }

  return (
    <section className="mt-7 border-t pt-6" aria-label="Questionnaire">
      <div className="mb-[18px] flex justify-between gap-[15px]">
        <p className={eyebrow}>QUESTIONNAIRE</p>
        <span className="text-[13px] text-muted-foreground">
          {question ? `Question ${position + 1} of ${total}` : "Your answers are ready to review"}
        </span>
      </div>
      <p className="text-[14px] leading-[1.8] text-muted-foreground">
        Share what you’re comfortable with. A supported occupation is needed for your exposure
        baseline, and your weekly time and timeline plan your schedule; other answers are optional.
      </p>
      {question && (
        <>
          <ProfileEditor
            key={question.field}
            profile={profile}
            onChange={update}
            fields={[question.field]}
            bordered={false}
          />
        </>
      )}
      <div className="flex flex-wrap justify-between gap-2.5 [&_button]:min-h-10 [&_button]:text-[14px]">
        <Button
          variant="ghost"
          disabled={saving || position === 0 || index <= 0}
          onClick={() =>
            setIndex(position > 0 ? questions.indexOf(asked[position - 1]!) : index - 1)
          }
        >
          <ArrowLeft /> Back
        </Button>
        <div className="flex flex-wrap justify-between gap-2.5">
          {question && !requiredProfileFields.includes(question.field) && (
            <Button variant="ghost" disabled={saving} onClick={() => advance(true)}>
              Skip for now
            </Button>
          )}
          <Button
            disabled={
              saving ||
              (!!question &&
                requiredProfileFields.includes(question.field) &&
                !hasAnswer(profile, question.field))
            }
            onClick={() => advance()}
          >
            {question ? "Continue" : "Review my starting picture"}
            <ArrowRight />
          </Button>
        </div>
      </div>
      <p className={cn(fieldHelp, "mt-4")}>
        Answers update your draft automatically. Switching modes keeps your answers.
      </p>
      {question && (
        <Button variant="link" onClick={onReview} className="mt-2 px-0">
          Review current answers
        </Button>
      )}
    </section>
  )
}
