ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS tier            VARCHAR(10)  DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS tagline         TEXT,
  ADD COLUMN IF NOT EXISTS scores          JSONB,
  ADD COLUMN IF NOT EXISTS source_attribution JSONB,
  ADD COLUMN IF NOT EXISTS momentum        INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signals_count   INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags            TEXT[];
