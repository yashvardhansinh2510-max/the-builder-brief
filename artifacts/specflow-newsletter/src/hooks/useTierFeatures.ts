import React, { useContext } from "react";
import { supabase } from "../lib/supabase";

interface UserContext {
  user?: { id: string; email: string; tier?: string };
  loading: boolean;
}

export interface FeatureAccess {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

const TIER_FEATURES: Record<string, Record<string, { limit: number | null }>> = {
  free: {
    aiCommands: { limit: 5 },
    downloads: { limit: 10 },
    briefCustomization: { limit: 1 },
    analytics: { limit: 0 },
    apiAccess: { limit: 0 },
  },
  pro: {
    aiCommands: { limit: 50 },
    downloads: { limit: 100 },
    briefCustomization: { limit: 5 },
    analytics: { limit: 1 },
    apiAccess: { limit: 100 },
    teamSeats: { limit: 1 },
    customBranding: { limit: 1 },
    priority: { limit: 1 },
    webhooks: { limit: 1 },
  },
  max: {
    aiCommands: { limit: 500 },
    downloads: { limit: 1000 },
    briefCustomization: { limit: -1 },
    analytics: { limit: 1 },
    apiAccess: { limit: -1 },
    teamSeats: { limit: 10 },
    customBranding: { limit: 1 },
    priority: { limit: 1 },
    webhooks: { limit: 1 },
    sso: { limit: 1 },
    customIntegrations: { limit: 1 },
    dedicatedSlack: { limit: 1 },
    seatOverage: { limit: 25 },
  },
  incubator: {
    aiCommands: { limit: -1 },
    downloads: { limit: -1 },
    briefCustomization: { limit: -1 },
    analytics: { limit: 1 },
    apiAccess: { limit: -1 },
    teamSeats: { limit: -1 },
    customBranding: { limit: 1 },
    priority: { limit: 1 },
    webhooks: { limit: 1 },
    sso: { limit: 1 },
    customIntegrations: { limit: 1 },
    dedicatedSlack: { limit: 1 },
    whiteLabel: { limit: 1 },
  },
};

const TIER_HIERARCHY = { free: 0, pro: 1, max: 2, incubator: 3 };

export function useTierFeatures(userTier: string = "free") {
  const checkFeatureAccess = (featureKey: string): FeatureAccess => {
    const tierFeatures = TIER_FEATURES[userTier] || TIER_FEATURES.free;

    if (!(featureKey in tierFeatures)) {
      return {
        allowed: false,
        reason: `Feature ${featureKey} not available`,
      };
    }

    const feature = tierFeatures[featureKey];
    if (feature.limit === 0) {
      return {
        allowed: false,
        reason: `Feature ${featureKey} requires a higher tier`,
      };
    }

    return {
      allowed: true,
      limit: feature.limit === -1 ? undefined : feature.limit,
    };
  };

  const hasFeature = (featureKey: string): boolean => {
    return checkFeatureAccess(featureKey).allowed;
  };

  const requiresTier = (featureKey: string, minimumTier: string): boolean => {
    const currentLevel = TIER_HIERARCHY[userTier as keyof typeof TIER_HIERARCHY] ?? -1;
    const minimumLevel = TIER_HIERARCHY[minimumTier as keyof typeof TIER_HIERARCHY] ?? 0;
    return currentLevel >= minimumLevel;
  };

  const getTierFeatures = () => {
    return TIER_FEATURES[userTier] || TIER_FEATURES.free;
  };

  const getUpgradeRequired = (featureKey: string): string | null => {
    const tiers = ["free", "pro", "max", "incubator"];
    for (const tier of tiers) {
      if (TIER_FEATURES[tier]?.[featureKey]?.limit !== 0) {
        return tier;
      }
    }
    return null;
  };

  return {
    checkFeatureAccess,
    hasFeature,
    requiresTier,
    getTierFeatures,
    getUpgradeRequired,
    currentTier: userTier,
  };
}

export function useFeatureUsage(userId: string, featureKey: string) {
  const [usage, setUsage] = React.useState<{
    currentUsage: number;
    limit: number | null;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from("user_tier_usage")
          .select("usage_count, limit_value")
          .eq("user_id", userId)
          .eq("feature_key", featureKey)
          .eq("month", new Date().toISOString().slice(0, 7))
          .single();

        if (err && err.code !== "PGRST116") {
          throw err;
        }

        setUsage(
          data
            ? {
                currentUsage: data.usage_count,
                limit: data.limit_value,
              }
            : {
                currentUsage: 0,
                limit: null,
              }
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch usage");
      } finally {
        setLoading(false);
      }
    };

    if (userId && featureKey) {
      fetchUsage();
    }
  }, [userId, featureKey]);

  return { usage, loading, error };
}
