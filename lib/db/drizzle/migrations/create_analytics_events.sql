CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events (event);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at DESC);
