import { db } from "@workspace/db";
import { tierFeaturesTable, userTierUsageTable, subscribersTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { tierPrices } from "@workspace/db";

export async function canUseFeature(
  userId: number,
  featureKey: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get user's current tier
    const user = await db
      .select({ tier: subscribersTable.tier })
      .from(subscribersTable)
      .where(eq(subscribersTable.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return { allowed: false, reason: "User not found" };
    }

    const userTier = user[0].tier || "free";

    // Check if this tier has access to this feature
    const tierFeature = await db
      .select()
      .from(tierFeaturesTable)
      .where(
        and(
          eq(tierFeaturesTable.tier, userTier),
          eq(tierFeaturesTable.featureKey, featureKey)
        )
      )
      .limit(1);

    if (!tierFeature || tierFeature.length === 0) {
      return { allowed: false, reason: `Feature ${featureKey} not available on ${userTier} tier` };
    }

    // Check usage limits
    if (tierFeature[0].limitValue !== null) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const usage = await db
        .select({ usageCount: userTierUsageTable.usageCount })
        .from(userTierUsageTable)
        .where(
          and(
            eq(userTierUsageTable.userId, userId),
            eq(userTierUsageTable.featureKey, featureKey),
            eq(userTierUsageTable.month, currentMonth)
          )
        )
        .limit(1);

      const currentUsage = (usage && usage.length > 0) ? (usage[0].usageCount || 0) : 0;
      const limit = tierFeature[0].limitValue;

      if (limit !== null && currentUsage >= limit) {
        return {
          allowed: false,
          reason: `Usage limit reached (${currentUsage}/${limit})`,
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking feature access:", error);
    return { allowed: false, reason: "Internal error checking feature access" };
  }
}

export async function incrementFeatureUsage(
  userId: number,
  featureKey: string
): Promise<{ success: boolean; newCount?: number; error?: string }> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Check if usage record exists
    const existing = await db
      .select()
      .from(userTierUsageTable)
      .where(
        and(
          eq(userTierUsageTable.userId, userId),
          eq(userTierUsageTable.featureKey, featureKey),
          eq(userTierUsageTable.month, currentMonth)
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing record
      const updated = await db
        .update(userTierUsageTable)
        .set({
          usageCount: (existing[0].usageCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(userTierUsageTable.id, existing[0].id))
        .returning();

      return { success: true, newCount: updated[0].usageCount || 0 };
    } else {
      // Create new record
      const created = await db
        .insert(userTierUsageTable)
        .values({
          userId,
          featureKey,
          month: currentMonth,
          usageCount: 1,
        })
        .returning();

      return { success: true, newCount: 1 };
    }
  } catch (error) {
    console.error("Error incrementing feature usage:", error);
    return { success: false, error: "Failed to update usage" };
  }
}

export async function getFeatureUsage(
  userId: number,
  featureKey: string
): Promise<{ usageCount: number; limitValue: number | null } | null> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const usage = await db
      .select({
        usageCount: userTierUsageTable.usageCount,
        limitValue: tierFeaturesTable.limitValue,
      })
      .from(userTierUsageTable)
      .leftJoin(
        tierFeaturesTable,
        and(
          eq(tierFeaturesTable.featureKey, userTierUsageTable.featureKey),
          eq(tierFeaturesTable.tier, subscribersTable.tier)
        )
      )
      .where(
        and(
          eq(userTierUsageTable.userId, userId),
          eq(userTierUsageTable.featureKey, featureKey),
          eq(userTierUsageTable.month, currentMonth)
        )
      )
      .limit(1);

    if (!usage || usage.length === 0) {
      return null;
    }

    return {
      usageCount: usage[0].usageCount || 0,
      limitValue: usage[0].limitValue,
    };
  } catch (error) {
    console.error("Error getting feature usage:", error);
    return null;
  }
}

export function getTierFeatures(tier: string): Record<string, any> {
  const tierFeatures: Record<string, any> = {
    free: {
      aiCommands: { limit: 5, description: "AI-powered commands per month" },
      downloads: { limit: 10, description: "Document downloads per month" },
      briefCustomization: { limit: 1, description: "Custom brief templates" },
      analytics: { limit: 0, description: "Basic analytics" },
      apiAccess: { limit: 0, description: "API access" },
    },
    pro: {
      aiCommands: { limit: 50, description: "AI-powered commands per month" },
      downloads: { limit: 100, description: "Document downloads per month" },
      briefCustomization: { limit: 5, description: "Custom brief templates" },
      analytics: { limit: 1, description: "Advanced analytics" },
      apiAccess: { limit: 100, description: "API calls per month" },
      teamSeats: { limit: 1, description: "Team members" },
      customBranding: { limit: 1, description: "Custom branding" },
      priority: { limit: 1, description: "Priority support" },
      webhooks: { limit: 1, description: "Webhook support" },
    },
    max: {
      aiCommands: { limit: 500, description: "AI-powered commands per month" },
      downloads: { limit: 1000, description: "Document downloads per month" },
      briefCustomization: { limit: -1, description: "Unlimited custom templates" },
      analytics: { limit: 1, description: "Advanced analytics" },
      apiAccess: { limit: -1, description: "Unlimited API calls" },
      teamSeats: { limit: 10, description: "Team members" },
      customBranding: { limit: 1, description: "Custom branding" },
      priority: { limit: 1, description: "24/7 priority support" },
      webhooks: { limit: 1, description: "Advanced webhooks" },
      sso: { limit: 1, description: "Single sign-on" },
      customIntegrations: { limit: 1, description: "Custom integrations" },
      dedicatedSlack: { limit: 1, description: "Dedicated Slack channel" },
      seatOverage: { limit: 25, description: "Additional seat overage" },
    },
    incubator: {
      aiCommands: { limit: -1, description: "Unlimited AI commands" },
      downloads: { limit: -1, description: "Unlimited downloads" },
      briefCustomization: { limit: -1, description: "Unlimited customization" },
      analytics: { limit: 1, description: "Full analytics" },
      apiAccess: { limit: -1, description: "Unlimited API access" },
      teamSeats: { limit: -1, description: "Unlimited team members" },
      customBranding: { limit: 1, description: "Custom branding" },
      priority: { limit: 1, description: "24/7 dedicated support" },
      webhooks: { limit: 1, description: "Advanced webhooks" },
      sso: { limit: 1, description: "Enterprise SSO" },
      customIntegrations: { limit: 1, description: "Unlimited integrations" },
      dedicatedSlack: { limit: 1, description: "Dedicated success team" },
      whiteLabel: { limit: 1, description: "White-label option" },
    },
  };

  return tierFeatures[tier] || tierFeatures.free;
}
