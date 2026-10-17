#!/usr/bin/env bash
# Switch the production API's LLM provider.
#   gemini  Gemini on AI Studio with the free-tier key (default, RM 0)
#   vertex  Gemini on Vertex AI via the Cloud Run service account (paid; demo and judging only)
#   status  show the current provider settings
# Vertex costs count against the RM21 monthly budget kill switch; switch back with `gemini` after the demo.
set -euo pipefail

PROJECT=voxian-shift-app
REGION=asia-southeast1
SERVICE=voxian-api
SA="voxian-api@${PROJECT}.iam.gserviceaccount.com"
VERTEX_MODEL="${VERTEX_MODEL:-gemini-2.5-flash}"

case "${1:-}" in
  vertex)
    gcloud services enable aiplatform.googleapis.com --project "$PROJECT"
    gcloud projects add-iam-policy-binding "$PROJECT" \
      --member "serviceAccount:${SA}" --role roles/aiplatform.user --condition None >/dev/null
    gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" \
      --update-env-vars "CHAT_PROVIDER=vertex,VERTEX_MODEL=${VERTEX_MODEL}"
    ;;
  gemini)
    gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" \
      --update-env-vars CHAT_PROVIDER=gemini
    # Least privilege outside the demo window.
    gcloud projects remove-iam-policy-binding "$PROJECT" \
      --member "serviceAccount:${SA}" --role roles/aiplatform.user --condition None >/dev/null || true
    ;;
  status)
    gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" \
      --format 'table(spec.template.spec.containers[0].env[].name, spec.template.spec.containers[0].env[].value)' \
      | grep -E "CHAT_PROVIDER|MODEL" || true
    ;;
  *)
    echo "usage: $0 vertex|gemini|status" >&2
    exit 1
    ;;
esac
