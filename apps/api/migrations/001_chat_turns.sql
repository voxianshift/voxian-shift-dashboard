CREATE TABLE IF NOT EXISTS lumi_chat_turns (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_hash text NOT NULL CHECK (length(owner_hash) = 64),
  user_message text NOT NULL CHECK (length(user_message) BETWEEN 1 AND 2000),
  assistant_message text NOT NULL CHECK (length(assistant_message) BETWEEN 1 AND 1200),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lumi_chat_turns_owner_id ON lumi_chat_turns (owner_hash, id);
