# Deployment runbook

See [the audited architecture](../ARCHITECTURE.md) for local setup, storage ownership, migration ordering and the complete runtime flow.

## AI and image snapshot — 19 October 2026

Live images are tagged `85afce23b6434042750a1d2735dbaf3293af591f`: web revision `voxian-web-00043-5nw`, API revision `voxian-api-00050-bcw`. Current AI provider is `CHAT_PROVIDER=gemini`, using `GEMINI_MODEL=gemini-3.8-flash` through Gemini Developer API (Google AI Studio credentials). `VERTEX_MODEL=gemini-2.5-flash` is configured but inactive. `CV_VECTOR_MODE` is unset, so optional Vertex CV-vector retrieval is off. See [AI provider reference](ai-provider.md). These observations verify configuration, not successful model responses or billing entitlement.

Earlier infrastructure audit recorded migrations 001–005, direct `pg` access to Cloud SQL PostgreSQL 18 and disabled automated backups. Those database details were not re-audited on 19 October.

Trial provisioning is recorded in the repository and instance metadata, but active billing entitlement and expiry remain unverified. Consult [official Cloud SQL trial terms](https://firebase.google.com/docs/sql-connect/pricing) and the project billing console; do not assume ongoing zero cost.

**Console-reported standard-pricing start: 14 January 2027**, shown in the user-supplied Firebase Cloud SQL trial screenshot. This replaces the earlier 16 January estimate. Current invoices and continued eligibility were not independently rechecked; the database trial does not establish zero cost for AI or other services.

## Pipeline and historical setup

Pushing to `main` deploys both Cloud Run services through `.github/workflows/deploy.yml`. Apply reviewed SQL migrations before releasing code that requires them. The workflow does not run migrations. The setup commands below record earlier provisioning; inspect current configuration before reapplying them. `gcloud run deploy --image` keeps existing env vars, secrets and Cloud SQL connections, so this is a one-time setup.

Project `voxian-shift-app`, region `asia-southeast1`, Cloud SQL instance `voxian-db` (Postgres 18, recorded Cloud SQL trial provisioning; current trial entitlement is unverified). Changes to instance configuration can affect trial eligibility; review current terms before changing size, IP configuration or replicas.

## Already created (2026-10-17)

- Secret Manager API enabled.
- Cloud SQL user `voxian_api` on `voxian-db` (random password, not stored anywhere except the secret below).
- Secret `voxian-database-url`: `postgresql://voxian_api:…@localhost/voxian?host=/cloudsql/voxian-shift-app:asia-southeast1:voxian-db` (Cloud Run Unix socket form).
- Secret `voxian-rootsys-api-key`: copy of the local `ROOTSYS_API_KEY`.

## Applied 2026-10-17 (kept for re-runs)

1. Let the API service account use Cloud SQL and read the secrets:

   ```sh
   SA=voxian-api@voxian-shift-app.iam.gserviceaccount.com
   gcloud projects add-iam-policy-binding voxian-shift-app --member=serviceAccount:$SA --role=roles/cloudsql.client --condition=None
   gcloud secrets add-iam-policy-binding voxian-database-url --member=serviceAccount:$SA --role=roles/secretmanager.secretAccessor
   gcloud secrets add-iam-policy-binding voxian-rootsys-api-key --member=serviceAccount:$SA --role=roles/secretmanager.secretAccessor
   ```

2. Migrate and import O*NET into Cloud SQL from your machine through the Cloud SQL Auth Proxy (`brew install cloud-sql-proxy`). `DATABASE_URL` uses the proxy port and the `voxian_api` password from the secret:

   ```sh
   cloud-sql-proxy voxian-shift-app:asia-southeast1:voxian-db --port 5434
   DATABASE_URL=postgresql://voxian_api:<password>@127.0.0.1:5434/voxian pnpm --filter @voxian/api db:migrate
   DATABASE_URL=postgresql://voxian_api:<password>@127.0.0.1:5434/voxian pnpm --filter @voxian/api db:import-occupations /tmp/voxian-onet-31.0
   ```

   O*NET download steps are in `docs/occupation-catalogue.md`. If migrations fail on schema permissions, grant `voxian_api` CREATE on schema `public` as the `postgres` user.

3. Configure the API service:

   ```sh
   gcloud run services update voxian-api --region asia-southeast1 \
     --add-cloudsql-instances voxian-shift-app:asia-southeast1:voxian-db \
     --update-secrets DATABASE_URL=voxian-database-url:latest,GEMINI_API_KEY=voxian-gemini-api-key:latest \
     --update-env-vars WEB_ORIGIN=https://voxian-web-184581024855.asia-southeast1.run.app,CHAT_PROVIDER=gemini,GEMINI_MODEL=gemini-3.8-flash
   ```

   `WEB_ORIGIN` must match the URL people open exactly; the API rejects chat and role saves from any other origin.

4. Web proxy: nothing to set at runtime. Next bakes the `/api/*` target into the build, so `apps/web/Dockerfile` takes `API_BASE_URL` as a build arg (default: the API's Cloud Run URL), passed by the deploy workflow and `cloudbuild.yaml`.

5. Merge the PR. Then check `/api/occupations?q=customer` through the web URL, send one Lumi message, save a role and clear the profile.

## Notes

- Production uses Gemini Developer API with server-side API-key credentials. Rootsys remains a legacy/local code option, not the selected deployed provider.
- Cloud SQL stops when the RM21 monthly budget kill switch fires; restore with `gcloud sql instances patch voxian-db --activation-policy ALWAYS`.

## Status 2026-10-17

Historical snapshot, superseded for AI provider configuration by the 19 October snapshot above. At that time, API service account has Cloud SQL client, secret access and Vertex AI user; migrations 001–003 and the O*NET 31.0 import ran on `voxian-db`; `voxian-api` runs with the Cloud SQL socket, `DATABASE_URL` secret, `WEB_ORIGIN` and `CHAT_PROVIDER=vertex` (Gemini on Vertex AI via the service account, no API key).

## AI provider switching

As of 19 October 2026, production runs `CHAT_PROVIDER=gemini` and uses server-side Gemini API credentials. Vertex remains an explicitly selectable alternative; its model environment variable alone does not activate it. The following script can intentionally switch providers; these commands change live configuration and, for Vertex, IAM permissions. Provider billing/quotas must be checked separately from the database trial:

```sh
scripts/ai-provider.sh vertex   # enables Vertex AI, grants roles/aiplatform.user to voxian-api, sets CHAT_PROVIDER=vertex
scripts/ai-provider.sh status
scripts/ai-provider.sh gemini   # selects AI Studio credentials and removes the Vertex role
```

`VERTEX_MODEL` defaults to `gemini-2.5-flash`; override with `VERTEX_MODEL=... scripts/ai-provider.sh vertex`. Live audit confirmed the calendar-month budget, raised to RM21 (approximately US$5.15) on 18 October 2026, Pub/Sub topic, Eventarc trigger, Ready kill-switch handler and incoming budget-message logs. Latest observed report before the increase was RM0.22 of the old RM4 budget at 18 October 2026, 00:54:50 MYT. The budget amount, existing project filter, alert thresholds and Pub/Sub topic were verified after the increase. Threshold-crossing shutdown was not fired or verified. Budget automation is not a guaranteed hard spending cap; see [kill-switch details](../ARCHITECTURE.md#live-budget-kill-switch--verified-18-october-2026). Generated plans use the selected provider label: "Gemini" for the current API provider, or "Gemini on Vertex AI" only when Vertex is explicitly selected.
