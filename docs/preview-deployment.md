# Fork preview deployment

This fork (`vertexian-id/voxian-shift-dashboard`, repository ID `1424158894`) deploys to a shared preview in GCP project `voxian-shift-app`, region `asia-southeast1`. The upstream repository retains its separate production workflow and identity.

## Deploy a branch

1. Open **Actions → Deploy preview → Run workflow**. Use workflow from `main`.
2. Enter this fork's branch name or commit in **Fork branch or commit to deploy**.
3. Run the workflow. Checks run first; deployment uses the exact commit that passed.
4. Open <https://voxian-web-preview-184581024855.asia-southeast1.run.app> after the run succeeds. The run summary also links to it.

One shared preview supports one deployed branch at a time. Runs queue instead of cancelling an in-flight deployment. Deployments are manual; pushing to a branch does not automatically publish it. Repository Actions must be enabled by the fork owner if GitHub has disabled workflows for the fork.

## Resource boundaries

| Resource            | Preview configuration                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| WIF provider        | `github` pool, `github-preview` provider; fork repository ID and branch refs only                         |
| Deployment identity | `voxian-preview-deployer@voxian-shift-app.iam.gserviceaccount.com`                                        |
| Image repository    | `asia-southeast1-docker.pkg.dev/voxian-shift-app/voxian-preview`                                          |
| Cloud Run           | `voxian-api-preview`, `voxian-web-preview`; min 0, max 1 each                                             |
| Runtime identities  | `voxian-preview-api`, `voxian-preview-web` service accounts                                               |
| PostgreSQL          | `voxian_preview` database on existing `voxian-db`; dedicated `voxian_preview_api` role                    |
| Database secret     | `voxian-preview-database-url`, accessible only to preview API runtime and existing project administrators |
| AI                  | Vertex AI, `gemini-2.5-flash`; `CV_VECTOR_MODE=off`                                                       |

The deployment identity can update the two existing preview services, write preview images, and act as preview runtime identities. It has no production service deployment binding or access to production database credentials. Database migrations run separately under an administrator: review and apply migrations to **voxian_preview** before deploying code that requires them. The application role owns preview tables but has no production table permissions.

The frontend proxy is baked into the image using the preview API URL. API `WEB_ORIGIN` must match the numbered preview web URL above. Use that URL when testing writes.

Only the public O*NET catalogue is imported initially. No upstream guest profiles, CVs, or plans are copied. Preview uses the existing application rate limits; it has separate anonymous browser sessions because its hostname differs.

## Costs and rollback

Minimum instances are zero and maximum instances are one per service. Idle Cloud Run can scale to zero; Cloud SQL, image storage, builds, and AI usage can still incur costs. The existing project budget also covers preview usage. A project-wide SQL shutdown affects both environments because they share the instance.

To roll back application code, run the workflow with a previously verified commit. This does not reverse database migrations. Do not deploy a branch with incompatible schema changes until its preview migration has been reviewed and applied.
