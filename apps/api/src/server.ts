import { buildApp } from "./app.ts"

const app = buildApp()

// Cloud Run injects PORT and needs 0.0.0.0
await app.listen({ port: Number(process.env.PORT ?? 8080), host: "0.0.0.0" })
