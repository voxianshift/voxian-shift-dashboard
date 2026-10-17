# Deployment runbook

See [the audited architecture](../ARCHITECTURE.md) for local setup, storage ownership, migration ordering and the complete runtime flow.

## Verified snapshot — 18 October 2026

Both Cloud Run services serve application commit `df08dec` with 100% traffic. Migrations 001–005 are applied to production. The API uses `pg` directly against Cloud SQL PostgreSQL 18. Current provider is `CHAT_PROVIDER=vertex`, `VERTEX_MODEL=gemini-2.5-flash`. Automated SQL backups report disabled.

Trial provisioning is recorded in the repository and instance metadata, but active billing entitlement and expiry remain unverified. Consult [official Cloud SQL trial terms](https://firebase.google.com/docs/sql-connect/pricing) and the project billing console; do not assume ongoing zero cost.

**Estimated trial end: 16 January 2027**, based on live instance creation on 16 October 2026 and the published three-month trial period. Exact expiry and continued eligibility remain unverified; the API has no expiry field and console pages failed to load.

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
     --set-secrets DATABASE_URL=voxian-database-url:latest,ROOTSYS_API_KEY=voxian-rootsys-api-key:latest \
     --set-env-vars WEB_ORIGIN=https://voxian-web-184581024855.asia-southeast1.run.app,CHAT_PROVIDER=rootsys,ROOTSYS_MODEL=glm-5.3-flashx
   ```

   `WEB_ORIGIN` must match the URL people open exactly; the API rejects chat and role saves from any other origin.

4. Web proxy: nothing to set at runtime. Next bakes the `/api/*` target into the build, so `apps/web/Dockerfile` takes `API_BASE_URL` as a build arg (default: the API's Cloud Run URL), passed by the deploy workflow and `cloudbuild.yaml`.

5. Merge the PR. Then check `/api/occupations?q=customer` through the web URL, send one Lumi message, save a role and clear the profile.

## Notes

- Hackathon rule is Google Cloud only. Rootsys is an external LLM; for the submission, switch to `CHAT_PROVIDER=gemini` with a Gemini key secret.
- Cloud SQL stops when the RM 4 budget kill switch fires; restore with `gcloud sql instances patch voxian-db --activation-policy ALWAYS`.

## Status 2026-10-17

All steps above were applied: API service account has Cloud SQL client, secret access and Vertex AI user; migrations 001–003 and the O*NET 31.0 import ran on `voxian-db`; `voxian-api` runs with the Cloud SQL socket, `DATABASE_URL` secret, `WEB_ORIGIN` and `CHAT_PROVIDER=vertex` (Gemini on Vertex AI via the service account, no API key). The Rootsys key secret is no longer used in production.

## AI provider switching

As of 18 October 2026, production runs `CHAT_PROVIDER=vertex`. The Gemini key secret remains bound but is not how Vertex authenticates. The following script can intentionally switch providers; these commands change live configuration and, for Vertex, IAM permissions. Provider billing/quotas must be checked separately from the database trial:

```sh
scripts/ai-provider.sh vertex   # enables Vertex AI, grants roles/aiplatform.user to voxian-api, sets CHAT_PROVIDER=vertex
scripts/ai-provider.sh status
scripts/ai-provider.sh gemini   # selects AI Studio credentials and removes the Vertex role
```

`VERTEX_MODEL` defaults to `gemini-2.5-flash`; override with `VERTEX_MODEL=... scripts/ai-provider.sh vertex`. Live audit confirmed the RM4 calendar-month budget, Pub/Sub topic, Eventarc trigger, Ready kill-switch handler and incoming budget-message logs. Latest observed report was RM0.22 of RM4 at 18 October 2026, 00:54:50 MYT. Threshold-crossing shutdown was not fired or verified. Budget automation is not a guaranteed hard spending cap; see [kill-switch details](../ARCHITECTURE.md#live-budget-kill-switch--verified-18-october-2026). Generated plans show "Generated by Gemini on Vertex AI" while it is active.
