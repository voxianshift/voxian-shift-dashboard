import { readFile, readdir } from "node:fs/promises"
import { Pool } from "pg"

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 })
try {
  const directory = new URL("../migrations/", import.meta.url)
  for (const file of (await readdir(directory))
    .filter((name) => /^\d+_.*\.sql$/.test(name))
    .sort()) {
    await pool.query(await readFile(new URL(file, directory), "utf8"))
    console.log(`Applied ${file}`)
  }
} finally {
  await pool.end()
}
