# Ticket 01: Dual-Mode Gemini Dispatcher (Studio vs Vertex)

Status: resolved
Type: task

## Description

Create a modular Gemini dispatcher helper in `apps/api/src/onboarding.ts` that handles URL and header construction based on `GEMINI_BACKEND`:

- When `GEMINI_BACKEND=studio` (or default): uses `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with `x-goog-api-key`.
- When `GEMINI_BACKEND=vertex`: uses `https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/publishers/google/models/{model}:generateContent` with `Authorization: Bearer {token}` using ADC (`firebase-admin/app`).

## Acceptance Criteria

- [x] Dual-backend dispatcher implemented.
- [x] Uses existing `applicationDefault()` for token acquisition when in `vertex` mode.
- [x] Preserves lightweight footprint with zero unnecessary dependencies.
