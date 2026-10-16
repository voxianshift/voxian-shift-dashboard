import { applicationDefault, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Uses Application Default Credentials: the Cloud Run service account in prod,
// `gcloud auth application-default login` locally. Emulators are picked up from
// FIREBASE_AUTH_EMULATOR_HOST / FIRESTORE_EMULATOR_HOST when set.
function app() {
  return (
    getApps()[0] ??
    initializeApp({ credential: applicationDefault(), projectId: process.env.GOOGLE_CLOUD_PROJECT })
  )
}

export const auth = () => getAuth(app())
export const db = () => getFirestore(app())
