import type { FastifyInstance } from "fastify"
import { z } from "zod"
import type { OccupationCatalogue } from "./occupation-catalogue.ts"

export async function extractCv(buffer: Buffer, format: "pdf" | "docx" | "txt") {
  if (format === "txt") return new TextDecoder("utf-8", { fatal: true }).decode(buffer)
  if (format === "docx") {
    if (buffer.subarray(0, 2).toString() !== "PK") throw new Error("Invalid DOCX")
    const { extractRawText } = await import("mammoth")
    return (await extractRawText({ buffer })).value
  }
  if (buffer.subarray(0, 5).toString() !== "%PDF-") throw new Error("Invalid PDF")
  const { PDFParse } = await import("pdf-parse")
  const parser = new PDFParse({ data: buffer })
  try {
    return (await parser.getText({ first: 10 })).text
  } finally {
    await parser.destroy()
  }
}

export function registerCv(app: FastifyInstance, catalogue?: OccupationCatalogue) {
  app.register(async (scope) => {
    scope.addContentTypeParser(
      "application/octet-stream",
      { parseAs: "buffer" },
      (_request, body, done) => done(null, body),
    )
    scope.post("/onboarding/cv", { bodyLimit: 2 * 1024 * 1024 }, async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      if (
        request.headers.origin &&
        request.headers.origin !== (process.env.WEB_ORIGIN || "http://localhost:3000")
      )
        return reply.code(403).send({ error: "Request origin not allowed." })
      const query = z.object({ format: z.enum(["pdf", "docx", "txt"]) }).safeParse(request.query)
      if (!query.success || !Buffer.isBuffer(request.body) || !request.body.length)
        return reply.code(400).send({ error: "Choose a PDF, DOCX, or UTF-8 text CV (up to 2 MB)." })
      if (!catalogue) return reply.code(503).send({ error: "Occupation search is unavailable." })
      let text: string
      try {
        text = (await extractCv(request.body, query.data.format))
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 12_000)
        if (text.length < 20 || text.includes("\u0000")) throw new Error("No readable text")
      } catch {
        return reply.code(422).send({
          error:
            "Could not read this CV. Use a text-based PDF, DOCX, or TXT file, or search your job title instead.",
        })
      }
      try {
        // Extracted text is used only for catalogue matching; neither file nor text is stored.
        return { occupations: await catalogue.search(text, 3) }
      } catch {
        return reply
          .code(503)
          .send({ error: "CV matching is unavailable. Try again or search your job title." })
      }
    })
  })
}
