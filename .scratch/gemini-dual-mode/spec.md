# Specification: Dual-Mode Gemini Client (AI Studio & Vertex AI) with Auto-Fallback

- **Feature Slug:** `gemini-dual-mode`
- **Target:** `apps/api`
- **Status:** Approved / Ready for Implementation

---

## 1. Objectives

1. Support **Dual-Mode Execution** configured via environment variables:
   - **`studio`** (Development default): Uses `GEMINI_API_KEY` against Google AI Studio endpoint (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`).
   - **`vertex`** (Production Cloud Run default): Uses Google Cloud Application Default Credentials (ADC) against Vertex AI endpoint (`https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/publishers/google/models/{model}:generateContent`).
2. Primary Model: `gemini-3.8-flash` for high-quality structured schema and conversational reasoning.
3. Fallback Model: `gemini-3.5-flash-lite` automatically triggered if `gemini-3.8-flash` encounters HTTP 429 (rate-limit / quota) or HTTP 503 (service unavailable / high load).
4. Deterministic Grounding: Always pass `temperature: 0.2` in `generationConfig` to ensure strict factual adherence and stable structured JSON outputs.

---

## 2. Environment Variables

| Variable                | Default                 | Purpose                                                        |
| :---------------------- | :---------------------- | :------------------------------------------------------------- |
| `CHAT_PROVIDER`         | `rootsys` (or `gemini`) | Provider toggle (`gemini` activates this integration).         |
| `GEMINI_BACKEND`        | `studio`                | Backend switcher: `studio` or `vertex`.                        |
| `GEMINI_API_KEY`        | _(empty)_               | API Key for AI Studio (required when `GEMINI_BACKEND=studio`). |
| `GEMINI_MODEL`          | `gemini-3.8-flash`      | Primary Gemini model.                                          |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.5-flash-lite` | Fallback model used upon 429/503.                              |
| `GOOGLE_CLOUD_PROJECT`  | `voxian-shift-app`      | GCP Project ID (used by Vertex AI mode).                       |
| `VERTEX_REGION`         | `us-central1`           | Region for Vertex AI endpoints.                                |

---

## 3. Request Architecture

### Studio Request

- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Headers:**
  - `Content-Type: application/json`
  - `x-goog-api-key: {GEMINI_API_KEY}`

### Vertex AI Request

- **URL:** `https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/publishers/google/models/{model}:generateContent`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {accessToken}` (retrieved via ADC / `GoogleAuth`)

### Shared Payload

```json
{
  "systemInstruction": { "parts": [{ "text": "{systemPrompt}" }] },
  "contents": [{ "role": "user", "parts": [{ "text": "{inputJson}" }] }],
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseJsonSchema": "{schema}",
    "temperature": 0.2,
    "maxOutputTokens": 2000
  }
}
```

---

## 4. Fallback Logic

```text
Request (Primary: gemini-3.8-flash)
        │
        ├──► 200 OK ─────────► Parse & Return
        │
        └──► 429 / 503 ──────► Log warning & Retry with (Fallback: gemini-3.5-flash-lite)
                                     │
                                     ├──► 200 OK ─────────► Parse & Return
                                     └──► Non-200 ────────► Return user-friendly 429/503 error
```
