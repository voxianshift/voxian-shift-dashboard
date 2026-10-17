CREATE TABLE IF NOT EXISTS occupation_categories (
  code text PRIMARY KEY,
  title text NOT NULL,
  parent_code text REFERENCES occupation_categories(code),
  source text NOT NULL DEFAULT 'SOC 2018'
);
CREATE TABLE IF NOT EXISTS occupations (
  code text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category_code text NOT NULL REFERENCES occupation_categories(code),
  source text NOT NULL DEFAULT 'O*NET',
  source_version text NOT NULL,
  source_url text NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  search_document tsvector NOT NULL DEFAULT ''::tsvector
);
CREATE INDEX IF NOT EXISTS occupations_search ON occupations USING gin(search_document);
CREATE TABLE IF NOT EXISTS occupation_aliases (
  occupation_code text NOT NULL REFERENCES occupations(code),
  title text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  source_version text NOT NULL,
  PRIMARY KEY (occupation_code, title)
);
CREATE TABLE IF NOT EXISTS occupation_tasks (
  occupation_code text NOT NULL REFERENCES occupations(code),
  source_task_id text NOT NULL,
  description text NOT NULL,
  source_version text NOT NULL,
  PRIMARY KEY (occupation_code, source_task_id)
);
CREATE TABLE IF NOT EXISTS exposure_baselines (
  occupation_code text PRIMARY KEY REFERENCES occupations(code),
  model_id text NOT NULL CHECK (model_id IN ('customer-support', 'administrative-assistant')),
  model_version text NOT NULL,
  evidence_url text NOT NULL,
  evidence_note text NOT NULL,
  status text NOT NULL CHECK (status IN ('illustrative', 'validated'))
);
ALTER TABLE exposure_baselines ADD COLUMN IF NOT EXISTS task_inputs jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE TABLE IF NOT EXISTS career_occupation_selections (
  owner_hash text NOT NULL CHECK (length(owner_hash) = 64),
  occupation_code text NOT NULL REFERENCES occupations(code),
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (owner_hash, occupation_code)
);
CREATE UNIQUE INDEX IF NOT EXISTS career_primary_occupation ON career_occupation_selections(owner_hash) WHERE is_primary;
