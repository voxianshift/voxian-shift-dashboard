# Vertex AI and Firebase audit

Read-only audit performed **19 October 2026, Asia/Kuala_Lumpur**, against main repository and live project `voxian-shift-app`. Repository HEAD and deployed API image both identify commit `85afce23b6434042750a1d2735dbaf3293af591f`. Existing documentation merge conflicts were not resolved or changed as part of this audit.

## Conclusion

The deployed application's selected AI provider is Gemini Developer API (Google AI Studio credentials), and application persistence uses PostgreSQL directly. It is inaccurate to describe the repository or cloud project as containing no Vertex AI or Firebase components: optional implementation paths, configuration and provisioned Firebase resources remain.

## Active application paths

| Area                                                                       | Finding                                                                    | Evidence                                                                               |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Selected generation provider                                               | `CHAT_PROVIDER=gemini`, `GEMINI_MODEL=gemini-3.8-flash`                    | Cloud Run API revision `voxian-api-00050-bcw`; `apps/api/src/llm.ts`                   |
| Gemini transport                                                           | `generativelanguage.googleapis.com`, API-key authentication                | `completeJson()` and provider-aware `generateEmbedding()` in `llm.ts`                  |
| Vertex generation                                                          | Supported alternative, not selected                                        | `VERTEX_MODEL=gemini-2.5-flash` remains in live environment; provider is `gemini`      |
| Optional CV-vector retrieval                                               | Off in current production                                                  | `CV_VECTOR_MODE` not configured; `app.ts` creates store only for `shadow` or `active`  |
| Guest profiles, commitments, sessions, occupation catalogue and chat store | Direct PostgreSQL via `pg`                                                 | `app.ts`, `guest-store.ts`, `occupation-catalogue.ts`, `chat-store.ts`                 |
| Firebase Auth / Firestore application calls                                | No callers of local Firebase helper found in registered application routes | `firebase.ts` exports `auth()` and `db()`, but no application file imports that helper |

Configuration and call-path review do not prove zero historical API traffic or zero billed usage. Successful live model responses, Billing exports and request-volume metrics were not audited.

## Vertex code retained

- `apps/api/src/llm.ts`: Vertex generation and Lumi embedding alternatives use ADC when provider is explicitly `vertex`.
- `apps/api/src/cv-embeddings.ts`: separate CV retrieval implementation calls Vertex `gemini-embedding-001` with ADC; it does not follow `CHAT_PROVIDER`.
- `scripts/ai-provider.sh`: can enable Vertex API, grant `roles/aiplatform.user`, and switch provider. It was not executed during this audit.
- Source content may mention Vertex AI as a career skill. Those mentions describe learning requirements rather than application infrastructure.

The API runtime account's directly listed project roles were `roles/cloudsql.client` and `roles/datastore.user`; no directly assigned `roles/aiplatform.user` appeared in that project-role query. This is not a full inherited-IAM analysis.

## Firebase remnants in repository

- `firebase-admin` remains an API dependency and workspace catalogue entry. Its `applicationDefault()` helper is imported by optional Vertex transports; importing that package does not itself imply Firebase Auth or Firestore requests.
- `apps/api/src/firebase.ts` contains unused Firebase Auth and Firestore helpers.
- `.firebaserc`, `firebase.json`, `dataconnect/` schema and connector files remain.
- Root `emulators` script starts Firebase Data Connect emulator.
- Current GitHub deployment workflow builds API/web containers and deploys Cloud Run; it does not deploy Firebase Hosting or Data Connect.

## Provisioned cloud resources

Live metadata queries confirmed:

- Firestore Native database `(default)` in `asia-southeast1`.
- Firebase Data Connect service `voxian`, connector `default`, schema `main` in `asia-southeast1`, created 16 October 2026.
- Enabled APIs include `aiplatform.googleapis.com`, `firebasedataconnect.googleapis.com`, `firestore.googleapis.com`, Firebase management, Hosting, Installations, Remote Config and Rules APIs.
- API runtime service account retains project role `roles/datastore.user`.

Provisioning and API enablement establish presence, not current application traffic, stored-data contents or cost. No Firestore documents, user records or credentials were read. No cloud resources or permissions were changed.

## Cleanup options, not performed

1. Remove unused Firebase helper, emulator script and Data Connect configuration after preserving any required infrastructure history.
2. Remove optional Vertex transport/switching only if Gemini Developer API is intended as the sole supported provider.
3. Before removing `firebase-admin`, replace ADC usage or migrate/retire optional Vertex CV-vector retrieval; package removal alone would break retained code.
4. Review Firestore data, Data Connect dependencies and IAM ownership before deleting resources or revoking `roles/datastore.user`. Cloud SQL is the active application database and must be preserved.
5. Re-audit deployments and relevant request/billing metrics before claiming the cloud project has no Firebase/Vertex usage.

No cleanup, service disabling, IAM mutation, deployment or database change was performed.

## Safe cleanup completed after audit — 19 October 2026

User authorized removal of safely unused components. Removed unused `apps/api/src/firebase.ts`, `.firebaserc`, `firebase.json`, Data Connect schema/connector configuration and root Firebase emulator script. No callers of the deleted helper were found. API tests after removal: 106 passed, 6 database-dependent tests skipped.

Removed project-level `roles/datastore.user` from `voxian-api@voxian-shift-app.iam.gserviceaccount.com`. Preserved `roles/cloudsql.client`. Pre-change IAM policy and removed local files were backed up outside the repository under `~/.codex/backups/voxian-firebase-cleanup-20261019/`.

Retained Cloud SQL instance `voxian-db`, application data, Firestore database, SQL Connect service/connector/schema, enabled APIs and `firebase-admin` dependency. Optional Vertex code still imports the SDK's ADC helper. Cloud resource deletion was not performed because stored-data contents and trial consequences were not fully verified. Google documents that service deletion leaves underlying databases intact, but this audit did not establish project-specific billing eligibility after deletion: [service deletion](https://firebase.google.com/docs/reference/sql-connect/mcp/tools_list/delete_service), [trial conditions](https://firebase.google.com/docs/sql-connect/pricing).

User-supplied Firebase console screenshot shows standard Cloud SQL pricing starts **14 January 2027**, superseding the earlier 16 January estimate. No database configuration was changed during cleanup. Documentation merge conflicts were later resolved on `codex/gemini-docs-firebase-cleanup` before release validation.
