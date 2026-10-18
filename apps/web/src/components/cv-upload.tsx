"use client"

import { useId, useState } from "react"
import {
  cvUploadResultSchema,
  type CvContext,
  type CvUploadResult,
  type OccupationMatch,
} from "@voxian/shared"
import { Loader2, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CvUpload({
  onAccept,
}: {
  onAccept: (context: CvContext, occupations: OccupationMatch[], filename: string) => void
}) {
  const id = useId()
  const [result, setResult] = useState<CvUploadResult | null>(null)
  const [filename, setFilename] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function upload(file: File) {
    setError("")
    setResult(null)
    const format = file.name.split(".").at(-1)?.toLowerCase()
    if (
      !format ||
      !["pdf", "doc", "docx", "txt"].includes(format) ||
      !file.size ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Choose a PDF, DOC, DOCX, or TXT CV up to 2 MB.")
      return
    }
    setBusy(true)
    try {
      const response = await fetch(`/api/onboarding/cv?format=${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
        signal: AbortSignal.timeout(65_000),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "CV processing is unavailable. Try again or search your job title.",
        )
      setResult(cvUploadResultSchema.parse(data))
      setFilename(file.name)
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== "ZodError"
          ? failure.message
          : "CV details could not be read. Try another file or search your job title.",
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <section aria-label="CV upload" className="rounded-xl border border-dashed p-4 text-sm">
      <label htmlFor={id} className="mb-3 flex items-center gap-2 font-medium">
        <Upload className="size-4" /> Upload your CV / résumé
      </label>
      <Input
        id={id}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
          event.target.value = ""
        }}
      />
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        PDF (up to 20 pages), DOC, DOCX or TXT · 2 MB. AI processes your CV to extract career
        details. Only reviewed details and derived matching embeddings may be saved; file and raw
        text are not stored. Scanned PDFs require Gemini/Vertex.
      </p>
      {busy && (
        <p role="status" className="mt-3 flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Reading CV and matching roles…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-destructive">
          {error}
        </p>
      )}
      {result?.status === "needs_review" && (
        <p role="status" className="mt-3">
          CV evidence is too uncertain to use. No details or role guesses were added. Upload a
          clearer CV or search your job title.
        </p>
      )}
      {result?.status === "ready" && (
        <div className="mt-4 space-y-3 rounded-lg border p-3">
          <h3 className="font-medium">Review CV details</h3>
          <p className="text-xs text-muted-foreground">
            {filename} · {result.provider} · AI extraction confidence{" "}
            {Math.round(result.extraction.confidence * 100)}%. This is not role-match accuracy.
            Check details before using them.
          </p>
          <div>
            <p className="font-medium">Job titles</p>
            <p>{result.extraction.jobTitles.join(" · ")}</p>
          </div>
          {result.extraction.skills.length > 0 && (
            <div>
              <p className="font-medium">Skills</p>
              <p className="text-muted-foreground">{result.extraction.skills.join(" · ")}</p>
            </div>
          )}
          {result.extraction.workHistory.length > 0 && (
            <div>
              <p className="font-medium">Work experience</p>
              <ul className="mt-1 space-y-2">
                {result.extraction.workHistory.map((work, i) => (
                  <li key={i}>
                    <p>
                      {work.title}
                      {work.employerContext ? ` · ${work.employerContext}` : ""}
                    </p>
                    <p className="text-muted-foreground">{work.duties.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="font-medium">Planning keywords</p>
            <p className="text-muted-foreground">{result.extraction.keywords.join(" · ")}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            These details personalize your plan. You still choose your occupation; AI does not set
            your exposure score.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onAccept({ ...result.extraction, reviewed: true }, result.occupations, filename)
                setResult(null)
              }}
            >
              Use reviewed CV details
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setResult(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
