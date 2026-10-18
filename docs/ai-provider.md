# Current AI provider

Verified against live Cloud Run configuration on **19 October 2026, Asia/Kuala_Lumpur**. This page records deployment configuration; it does not certify model availability, successful responses, billing tier or remaining credits.

## Deployed configuration

| Setting                      | Observed value                                                               |
| ---------------------------- | ---------------------------------------------------------------------------- |
| API service                  | `voxian-api`, region `asia-southeast1`, project `voxian-shift-app`           |
| API revision                 | `voxian-api-00050-bcw`                                                       |
| Web revision                 | `voxian-web-00043-5nw`                                                       |
| Both image tags              | `85afce23b6434042750a1d2735dbaf3293af591f`                                   |
| Selected provider            | `CHAT_PROVIDER=gemini`                                                       |
| Configured generation model  | `GEMINI_MODEL=gemini-3.8-flash`                                              |
| Transport                    | Gemini Developer API, using server-side Google AI Studio API-key credentials |
| Request endpoint             | `generativelanguage.googleapis.com`                                          |
| Inactive alternative         | `VERTEX_MODEL=gemini-2.5-flash`; not selected while provider is `gemini`     |
| Optional CV-vector retrieval | `CV_VECTOR_MODE` unset; off by default                                       |

Google AI Studio is the tool used to manage/test Gemini API access. Gemini is the model family. Vertex AI is an alternative Google Cloud hosting/API path, not a second model automatically called alongside Gemini.

## Which features use AI?

| Feature                                                                                       | Current source or provider                                                                                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CV understanding and extraction                                                               | Shared `chatConfig()` selects Gemini Developer API; user reviews extracted context                                                                     |
| Onboarding AI assistance                                                                      | Same Gemini provider; occupation results remain catalogue-backed                                                                                       |
| The Meter                                                                                     | Deterministic ILO task-exposure calculations; no LLM-generated scores                                                                                  |
| The Curve                                                                                     | Dated adoption evidence and explicitly labelled scenarios                                                                                              |
| Navigator destination descriptions, duties, human edges, skills and source learning resources | Versioned role-library JSON; AI does not own destination identity                                                                                      |
| Navigator personalized guidance and CV phrase verification                                    | Gemini Developer API, with validated output and supplied evidence                                                                                      |
| Phased learning-plan generation                                                               | Gemini Developer API; code validates plan structure, destination and schedule                                                                          |
| Lumi chat and tool orchestration                                                              | Gemini Developer API, grounded in supplied page/profile context                                                                                        |
| Lumi memory embeddings                                                                        | Provider-aware `generateEmbedding()` uses Gemini Developer API when `CHAT_PROVIDER=gemini`; configured embedding model in code is `gemini-embedding-2` |
| Optional pgvector CV-evidence retrieval                                                       | Separate Vertex `gemini-embedding-001` implementation remains supported, but is not enabled in current production                                      |

Source: [provider selection and transports](../apps/api/src/llm.ts), [application registration](../apps/api/src/app.ts), [CV embeddings](../apps/api/src/cv-embeddings.ts), [Navigator](../apps/api/src/navigator.ts), [plan generation](../apps/api/src/plan.ts).

## Documentation and pitch wording

Use **“Gemini API (Google AI Studio)”** for current deployed AI features. Use **“Gemini via Vertex AI”** only for an explicitly selected Vertex deployment. Do not infer parallel model calls from the presence of both model environment variables. Do not describe deterministic scoring or authored role-library content as AI-generated.

[Pitch process-flow diagram, transparent PNG](diagrams/voxian-process-flow-gemini.png).

## Operations and limits

- Provider credentials stay server-side. Never copy API keys into documentation or frontend configuration.
- `GEMINI_MODEL` applies only to `CHAT_PROVIDER=gemini`; `VERTEX_MODEL` applies only to `CHAT_PROVIDER=vertex`.
- [ai-provider.sh](../scripts/ai-provider.sh) intentionally changes live Cloud Run configuration and IAM. Documentation updates do not require running it.
- AI API charges depend on actual account/project/key configuration and usage. Rate limiting is not a spending guarantee. Do not assume AI Studio means free-tier billing, or that project budget automation caps all provider spending.
- Historical Vertex smoke tests and optional Vertex implementation notes remain valid as history/capabilities, not descriptions of the active provider.

This documentation update does not change deployed services, secrets, databases or provider selection.
