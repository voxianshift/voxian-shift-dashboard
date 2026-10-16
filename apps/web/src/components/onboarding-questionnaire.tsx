"use client"

import { toast } from "sonner"
import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useCareerProfile } from "@/components/career-profile-provider"
import { ProfileEditor } from "@/components/profile-editor"
import { Button } from "@/components/ui/button"
import { hasAnswer, nextQuestion, questions } from "@/lib/onboarding"

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
  const total = detailed ? questions.length : 4

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
    <section className="questionnaire-panel" aria-label="Questionnaire">
      <div className="questionnaire-caption">
        <p className="eyebrow">QUESTIONNAIRE</p>
        <span>
          {question ? `Question ${index + 1} of ${total}` : "Your answers are ready to review"}
        </span>
      </div>
      <p className="question-help">
        Share what you’re comfortable with. A supported occupation is needed for your exposure
        baseline; other answers are optional.
      </p>
      {question && (
        <>
          <ProfileEditor
            key={question.field}
            profile={profile}
            onChange={update}
            fields={[question.field]}
          />
        </>
      )}
      <div className="questionnaire-controls">
        <Button
          variant="ghost"
          disabled={saving || index <= 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ArrowLeft /> Back
        </Button>
        <div>
          {question && (
            <Button variant="ghost" disabled={saving} onClick={() => advance(true)}>
              Skip for now
            </Button>
          )}
          <Button disabled={saving} onClick={() => advance()}>
            {question ? "Continue" : "Review my starting picture"}
            <ArrowRight />
          </Button>
        </div>
      </div>
      <p className="field-help mt-4">
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
