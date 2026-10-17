-- Stemmed word index on alternate titles, used to score how well a query matches each title
CREATE INDEX IF NOT EXISTS occupation_aliases_title_ts ON occupation_aliases USING gin (to_tsvector('english', title));

-- Content words for title matching: unstemmed (English stemming merges "customer" and "customs"),
-- plural -s removed, filler words dropped
CREATE OR REPLACE FUNCTION voxian_words(input text) RETURNS text[] LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT coalesce(array_agg(DISTINCT regexp_replace(w, 's$', '')), '{}')
  FROM unnest(regexp_split_to_array(lower(input), '[^a-z0-9]+')) w
  WHERE length(w) > 1 AND w !~ '^(and|the|for|all|other|with|of|or|in|on|at|to|my|i|am|a|an|is|do|work|job)$'
$$;
