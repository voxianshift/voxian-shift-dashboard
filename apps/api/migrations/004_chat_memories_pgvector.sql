-- Safe extension creation: if pgvector binary is not installed on the host, do not abort
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension could not be loaded: %', SQLERRM;
END $$;

-- Check if vector type is registered; if so, create column with vector(768), else fallback to jsonb/float array
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
    EXECUTE '
      CREATE TABLE IF NOT EXISTS lumi_chat_memories (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        owner_hash text NOT NULL CHECK (length(owner_hash) = 64),
        user_message text NOT NULL,
        assistant_message text NOT NULL,
        embedding vector(768),
        created_at timestamptz NOT NULL DEFAULT now()
      );
    ';
    EXECUTE 'CREATE INDEX IF NOT EXISTS lumi_chat_memories_owner ON lumi_chat_memories (owner_hash, id);';
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS lumi_chat_memories_hnsw ON lumi_chat_memories USING hnsw (embedding vector_cosine_ops);';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'HNSW index could not be created: %', SQLERRM;
    END;
  ELSE
    EXECUTE '
      CREATE TABLE IF NOT EXISTS lumi_chat_memories (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        owner_hash text NOT NULL CHECK (length(owner_hash) = 64),
        user_message text NOT NULL,
        assistant_message text NOT NULL,
        embedding jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    ';
    EXECUTE 'CREATE INDEX IF NOT EXISTS lumi_chat_memories_owner ON lumi_chat_memories (owner_hash, id);';
  END IF;
END $$;
