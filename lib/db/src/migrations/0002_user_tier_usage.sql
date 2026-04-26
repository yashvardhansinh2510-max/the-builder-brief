CREATE TABLE IF NOT EXISTS user_tier_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  month VARCHAR(7) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  limit_value INTEGER,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_key, month)
);
