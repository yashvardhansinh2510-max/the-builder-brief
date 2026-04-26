-- Create enums for monetization
CREATE TYPE earnings_status AS ENUM ('pending', 'processing', 'paid', 'failed');
CREATE TYPE payout_method AS ENUM ('stripe', 'bank_transfer', 'paypal');

-- Create creator_earnings table with tier-based revenue tracking
CREATE TABLE IF NOT EXISTS creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id INTEGER NOT NULL REFERENCES subscribers(id),
  month VARCHAR(7) NOT NULL,
  total_revenue NUMERIC(12, 2) DEFAULT 0,
  subscriber_fees NUMERIC(12, 2) DEFAULT 0,
  referral_bonuses NUMERIC(12, 2) DEFAULT 0,
  marketplace_shares NUMERIC(12, 2) DEFAULT 0,
  platform_fee NUMERIC(12, 2) DEFAULT 0,
  net_payout NUMERIC(12, 2) DEFAULT 0,
  pro_revenue NUMERIC(12, 2) DEFAULT 0,
  max_revenue NUMERIC(12, 2) DEFAULT 0,
  incubator_revenue NUMERIC(12, 2) DEFAULT 0,
  status earnings_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(creator_id, month)
);

-- Create payout_history table
CREATE TABLE IF NOT EXISTS payout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id INTEGER NOT NULL REFERENCES subscribers(id),
  amount NUMERIC(12, 2) NOT NULL,
  method payout_method NOT NULL,
  status earnings_status DEFAULT 'pending',
  transaction_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_subscriptions table with tier tracking
CREATE TABLE IF NOT EXISTS creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id INTEGER NOT NULL REFERENCES subscribers(id),
  subscriber_id INTEGER NOT NULL REFERENCES subscribers(id),
  monthly_price NUMERIC(10, 2) NOT NULL,
  tier VARCHAR(20) DEFAULT 'pro',
  status VARCHAR(20) DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT TRUE,
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id INTEGER NOT NULL REFERENCES subscribers(id),
  key TEXT UNIQUE NOT NULL,
  name TEXT,
  last_used TIMESTAMP WITH TIME ZONE,
  rate_limit NUMERIC(10, 0) DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_tiers table
CREATE TABLE IF NOT EXISTS referral_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES subscribers(id),
  tier VARCHAR(20) NOT NULL,
  total_referrals NUMERIC(10, 0) DEFAULT 0,
  total_commission NUMERIC(12, 2) DEFAULT 0,
  commission_rate NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_month ON creator_earnings(creator_id, month);
CREATE INDEX IF NOT EXISTS idx_payout_history_creator ON payout_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_creator ON creator_subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_subscriber ON creator_subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_creator ON api_keys(creator_id);
CREATE INDEX IF NOT EXISTS idx_referral_tiers_user ON referral_tiers(user_id);
