import type { OccupationCatalogue } from "./occupation-catalogue.ts"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { chatConfig, completeJson, ProviderAuthError } from "./llm.ts"
import { copilotChatRequestSchema, copilotChatResultSchema } from "@voxian/shared"

export function registerCopilot(app: FastifyInstance, _catalogue?: OccupationCatalogue) {
  let quota = { started: 0, count: 0 }

  app.post("/copilot/chat", { bodyLimit: 48_000 }, async (request, reply) => {
    reply.header("Cache-Control", "no-store")
    const origin = request.headers.origin
    if (origin && origin !== (process.env.WEB_ORIGIN || "http://localhost:3000")) {
      return reply.code(403).send({ error: "Request origin not allowed." })
    }

    const parsed = copilotChatRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: "Check your message and try again." })
    }
    const input = parsed.data

    const config = chatConfig()
    // Strict LLM check (Option B)
    if (!config?.apiKey) {
      return reply
        .code(503)
        .send({ error: "AI copilot is not configured. AI credentials are required." })
    }

    const now = Date.now()
    if (now - quota.started >= 60_000) quota = { started: now, count: 0 }
    if (quota.count >= 25) {
      return reply
        .code(429)
        .header("Retry-After", "60")
        .send({ error: "Copilot is busy. Please try again in a minute." })
    }
    quota.count++

    try {
      const systemPrompt = `You are Lumi, the proactive AI career copilot for Voxian Shift.
You are embedded as a persistent assistant in the user's dashboard.
The user is currently viewing the route: ${input.route}.
The user's career profile is:
- Preferred Name: ${input.profile.preferredName || "User"}
- Current Work: ${input.profile.currentWork || "Not specified"}
- Primary Role: ${input.profile.primaryOccupation ? input.profile.occupationNames[input.profile.primaryOccupation] || input.profile.primaryOccupation : "Not set"}
- Goals: ${input.profile.goals.join(", ") || "None specified"}
- Target Direction: ${input.profile.direction || "Exploring"}
- Weekly Study Hours: ${input.profile.hours || "Not set"}

Key Knowledge:
- G2 Exposure: Refers to Generative AI exposure level 2, where generative AI can significantly augment or automate core cognitive and communication tasks.
- Pages in dashboard:
  * /home: Profile overview, status, and starting point.
  * /meter: AI exposure radar, task breakdown, and vulnerability vs resilience analysis.
  * /roadmap: Career transition pathways, Navigator strategies, and weekly study commitment flight plan.
  * /skill-analyse: Deep-dive into technical, operational, and soft skill transitions.
  * /progress: Active study tracking, streak, and flight plan progress.
  * /resources: Learning modules, certifications, and guided pathways.

Your Job:
1. Provide a concise, clear, and encouraging reply (max 3-4 sentences).
2. Answer questions accurately based on the current page and user's profile.
3. If relevant to what the user asks or needs, include at most 2 actions:
   - "PICK_TARGET_ROLE": when recommending a career target role. Must have a valid occupationId (e.g. O*NET code like "15-1252.00") and human title.
   - "NAVIGATE": when recommending visiting a specific page (e.g. href: "/roadmap", label: "View Roadmap").
4. Provide 2-3 relevant follow-up questions in suggestedQuestions for the user to click next.
Return pure JSON matching the specified schema.`

      const schema = z.toJSONSchema(copilotChatResultSchema)
      let text: string
      try {
        text = await completeJson(config, systemPrompt, input, schema)
      } catch (error) {
        if (error instanceof ProviderAuthError) {
          return reply.code(503).send({
            error: `${config.label} credentials were not accepted. Please check API configuration.`,
          })
        }
        throw error
      }

      const result = copilotChatResultSchema.parse(JSON.parse(text || "{}"))
      return reply.send(result)
    } catch (err) {
      request.log.error(err)
      return reply.code(502).send({
        error: "AI copilot could not complete your request. Please try again.",
      })
    }
  })
}
