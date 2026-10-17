CREATE TABLE IF NOT EXISTS guest_profiles (
  owner_hash text PRIMARY KEY CHECK (length(owner_hash) = 64),
  state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guest_commitments (
  owner_hash text PRIMARY KEY CHECK (length(owner_hash) = 64),
  commitment jsonb NOT NULL CHECK (jsonb_typeof(commitment) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
