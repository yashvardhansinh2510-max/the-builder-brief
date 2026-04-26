CREATE TABLE IF NOT EXISTS team_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id INTEGER NOT NULL,
  team_member_id INTEGER,
  team_member_email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'member',
  cost_per_seat TEXT DEFAULT '50.00',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
