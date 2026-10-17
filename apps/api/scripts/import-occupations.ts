import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { Pool } from "pg"
import { z } from "zod"
import { demoBaselines, occupationCodeSchema } from "@voxian/shared"

const directory = process.argv[2]
if (!directory || !process.env.DATABASE_URL)
  throw new Error(
    "Usage: db:import-occupations <O*NET 31.0 JSON directory>; DATABASE_URL is required",
  )
async function rows<T extends z.ZodType>(file: string, schema: T) {
  const data = JSON.parse(await readFile(resolve(directory!, `${file}.json`), "utf8"))
  return z.object({ row: z.array(schema).min(1) }).parse(data).row
}
const [occupations, aliases, tasks] = await Promise.all([
  rows(
    "occupation_data",
    z.object({
      onetsoc_code: occupationCodeSchema,
      title: z.string().min(1).max(200),
      description: z.string().max(2000),
    }),
  ),
  rows(
    "job_titles",
    z.object({ onetsoc_code: occupationCodeSchema, job_title: z.string().min(1).max(200) }),
  ),
  rows(
    "task_statements",
    z.object({
      onetsoc_code: occupationCodeSchema,
      task_id: z.number().int(),
      task: z.string().min(1).max(3000),
    }),
  ),
])
if (occupations.length !== 1016 || aliases.length !== 54269 || tasks.length !== 18838)
  throw new Error("Expected complete O*NET 31.0 files. Check dataset version before importing.")
// SOC 2018 major groups: https://www.bls.gov/soc/2018/major_groups.htm
const categories = [
  ["11", "Management"],
  ["13", "Business and Financial Operations"],
  ["15", "Computer and Mathematical"],
  ["17", "Architecture and Engineering"],
  ["19", "Life, Physical, and Social Science"],
  ["21", "Community and Social Service"],
  ["23", "Legal"],
  ["25", "Educational Instruction and Library"],
  ["27", "Arts, Design, Entertainment, Sports, and Media"],
  ["29", "Healthcare Practitioners and Technical"],
  ["31", "Healthcare Support"],
  ["33", "Protective Service"],
  ["35", "Food Preparation and Serving Related"],
  ["37", "Building and Grounds Cleaning and Maintenance"],
  ["39", "Personal Care and Service"],
  ["41", "Sales and Related"],
  ["43", "Office and Administrative Support"],
  ["45", "Farming, Fishing, and Forestry"],
  ["47", "Construction and Extraction"],
  ["49", "Installation, Maintenance, and Repair"],
  ["51", "Production"],
  ["53", "Transportation and Material Moving"],
  ["55", "Military Specific"],
].map(([code, title]) => ({ code, title: `${title} Occupations` }))
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 })
const client = await pool.connect()
try {
  await client.query("BEGIN")
  await client.query("SELECT pg_advisory_xact_lock(817302)")
  await client.query(
    `INSERT INTO occupation_categories(code,title) SELECT code,title FROM jsonb_to_recordset($1) AS x(code text,title text) ON CONFLICT(code) DO UPDATE SET title=EXCLUDED.title`,
    [JSON.stringify(categories)],
  )
  await client.query(
    `INSERT INTO occupations(code,title,description,category_code,source_version,source_url)
    SELECT onetsoc_code,title,description,left(onetsoc_code,2),'31.0','https://www.onetcenter.org/dl_files/database/db_31_0_json/occupation_data.json'
    FROM jsonb_to_recordset($1) AS x(onetsoc_code text,title text,description text)
    ON CONFLICT(code) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,source_version=EXCLUDED.source_version,imported_at=now()`,
    [JSON.stringify(occupations)],
  )
  await client.query("DELETE FROM occupation_aliases WHERE source_version='31.0'")
  await client.query(
    `INSERT INTO occupation_aliases(occupation_code,title,source_version)
    SELECT DISTINCT onetsoc_code,job_title,'31.0' FROM jsonb_to_recordset($1) AS x(onetsoc_code text,job_title text)
    ON CONFLICT(occupation_code,title) DO UPDATE SET source_version=EXCLUDED.source_version`,
    [JSON.stringify(aliases)],
  )
  await client.query("DELETE FROM occupation_tasks WHERE source_version='31.0'")
  await client.query(
    `INSERT INTO occupation_tasks(occupation_code,source_task_id,description,source_version)
    SELECT onetsoc_code,task_id,task,'31.0' FROM jsonb_to_recordset($1) AS x(onetsoc_code text,task_id text,task text)
    ON CONFLICT(occupation_code,source_task_id) DO UPDATE SET description=EXCLUDED.description,source_version=EXCLUDED.source_version`,
    [JSON.stringify(tasks)],
  )
  await client.query(`UPDATE occupations o SET search_document =
    setweight(to_tsvector('english',o.title),'A') ||
    setweight(to_tsvector('english',coalesce((SELECT string_agg(a.title,' ') FROM occupation_aliases a WHERE a.occupation_code=o.code),'')),'A') ||
    setweight(to_tsvector('english',o.description),'B') ||
    setweight(to_tsvector('english',coalesce((SELECT string_agg(t.description,' ') FROM occupation_tasks t WHERE t.occupation_code=o.code),'')),'C')`)
  for (const [id, baseline] of Object.entries(demoBaselines)) {
    await client.query(
      `INSERT INTO exposure_baselines(occupation_code,model_id,model_version,evidence_url,evidence_note,status,task_inputs)
      VALUES($1,$2,'demo-v1','/resources','Illustrative Voxian prototype estimates. O*NET provides occupation metadata, not these exposure estimates.','illustrative',$3)
      ON CONFLICT(occupation_code) DO UPDATE SET task_inputs=EXCLUDED.task_inputs`,
      [baseline.code, id, JSON.stringify(baseline)],
    )
  }
  await client.query("COMMIT")
  console.log(
    `Imported O*NET 31.0: ${categories.length} categories, ${occupations.length} occupations, ${aliases.length} aliases, ${tasks.length} tasks; 2 illustrative baselines.`,
  )
} catch (error) {
  await client.query("ROLLBACK")
  throw error
} finally {
  client.release()
  await pool.end()
}
