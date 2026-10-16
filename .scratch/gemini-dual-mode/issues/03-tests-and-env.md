# Ticket 03: Unit Tests and Environment Configuration

Status: resolved
Type: task

## Description

Update `apps/api/.env.example` with the new environment variables (`GEMINI_BACKEND`, `GEMINI_FALLBACK_MODEL`, `VERTEX_REGION`). Update unit tests in `apps/api/src/onboarding.test.ts` to verify:

1. Studio request format and headers.
2. Vertex request format and headers.
3. Fallback execution upon 429 and 503.
4. Correct propagation of `temperature: 0.2`.

## Acceptance Criteria

- [x] `apps/api/.env.example` is fully documented.
- [x] `vp run -r test` passes without failures.
