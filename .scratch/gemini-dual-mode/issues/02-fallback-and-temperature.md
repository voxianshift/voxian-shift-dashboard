# Ticket 02: Auto-Fallback and Temperature Configuration

Status: resolved
Type: task

## Description

Wire `temperature: 0.2` into `generationConfig` in the Gemini request body. Implement automatic fallback: if primary model (`gemini-3.8-flash`) returns HTTP 429 or 503, immediately retry the call with fallback model (`gemini-3.5-flash-lite`).

## Acceptance Criteria

- [x] `generationConfig` includes `temperature: 0.2`.
- [x] HTTP 429 and 503 trigger an automatic single retry against `GEMINI_FALLBACK_MODEL`.
- [x] If the fallback succeeds, response is seamlessly parsed and returned.
- [x] If both fail or another status occurs, standard error handling preserves existing behavior.
