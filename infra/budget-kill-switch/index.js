// Budget kill switch: when the project's budget is reached, set every Cloud Run
// service in REGION to internal-only ingress and stop every Cloud SQL instance
// (activation policy NEVER). Nothing is deleted.
// Restore Cloud Run: gcloud run services update <name> --ingress all --region <region>
// Restore Cloud SQL: gcloud sql instances patch <name> --activation-policy ALWAYS
import { cloudEvent } from "@google-cloud/functions-framework"

const { PROJECT_ID, REGION, K_SERVICE } = process.env
const INTERNAL = "INGRESS_TRAFFIC_INTERNAL_ONLY"

async function token() {
  const res = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    { headers: { "Metadata-Flavor": "Google" } },
  )
  return (await res.json()).access_token
}

cloudEvent("killSwitch", async (event) => {
  const alert = JSON.parse(Buffer.from(event.data.message.data, "base64").toString())
  console.log(`cost ${alert.costAmount} / budget ${alert.budgetAmount} ${alert.currencyCode}`)
  if (alert.costAmount < alert.budgetAmount) return

  const headers = { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }
  const base = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services`
  const { services = [] } = await (await fetch(base, { headers })).json()

  for (const s of services) {
    const name = s.name.split("/").pop()
    // skip itself so later alerts still reach it
    if (name === K_SERVICE || s.ingress === INTERNAL) continue
    const res = await fetch(`https://run.googleapis.com/v2/${s.name}?updateMask=ingress`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ ingress: INTERNAL }),
    })
    console.log(`${name}: ingress -> internal (${res.status})`)
  }

  // Cloud SQL bills every running hour, even with no traffic
  const sqlBase = `https://sqladmin.googleapis.com/v1/projects/${PROJECT_ID}/instances`
  const { items = [] } = await (await fetch(sqlBase, { headers })).json()
  for (const db of items) {
    if (db.settings?.activationPolicy === "NEVER") continue
    const res = await fetch(`${sqlBase}/${db.name}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ settings: { activationPolicy: "NEVER" } }),
    })
    console.log(`${db.name}: Cloud SQL stopped (${res.status})`)
  }
})
