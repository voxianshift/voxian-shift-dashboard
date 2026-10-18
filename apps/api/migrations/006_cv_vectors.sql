-- Separate from Lumi memory. Exact search is sufficient for the bounded CV corpus.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS skill_requirement_vectors (
  requirement_id text NOT NULL,
  model text NOT NULL,
  content_hash text NOT NULL CHECK (length(content_hash)=64),
  version text NOT NULL,
  embedding vector(768) NOT NULL,
  PRIMARY KEY (requirement_id,model)
);
CREATE TABLE IF NOT EXISTS cv_evidence_vectors (
  owner_hash text NOT NULL REFERENCES guest_profiles(owner_hash) ON DELETE CASCADE,
  cv_revision text NOT NULL CHECK (length(cv_revision)=64),
  model text NOT NULL,
  content_hash text NOT NULL CHECK (length(content_hash)=64),
  phrase text NOT NULL CHECK (length(phrase) BETWEEN 1 AND 180),
  embedding vector(768) NOT NULL,
  PRIMARY KEY (owner_hash,model,content_hash)
);

CREATE OR REPLACE FUNCTION clear_replaced_cv_vectors() RETURNS trigger AS $$
BEGIN
  IF (OLD.state->'profile'->'cvContext') IS DISTINCT FROM (NEW.state->'profile'->'cvContext') THEN
    DELETE FROM cv_evidence_vectors WHERE owner_hash=NEW.owner_hash;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS guest_cv_vectors_cleanup ON guest_profiles;
CREATE TRIGGER guest_cv_vectors_cleanup AFTER UPDATE OF state ON guest_profiles
  FOR EACH ROW EXECUTE FUNCTION clear_replaced_cv_vectors();
