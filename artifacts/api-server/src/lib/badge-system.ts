import { db, badgeDefinitionsTable, earnedBadgesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

// Define badge earning rules
export const BADGES = {
  PROFILE_STARTED: {
    slug: "profile-started",
    name: "Profile Creator",
    description: "Set up a founder profile on The Builder Brief",
    requirement: "Create a profile on the network",
  },
  NETWORKER: {
    slug: "networker",
    name: "Networker",
    description: "Connect with 5+ other founders",
    requirement: "Reach 5+ connections",
  },
  CONNECTOR: {
    slug: "connector",
    name: "Connector",
    description: "Help connect other founders (10+ profile views)",
    requirement: "Receive 10+ profile views",
  },
  EXPERT: {
    slug: "expert",
    name: "Expert Builder",
    description: "Built a company using Builder Brief insights",
    requirement: "Verify using Builder Brief",
  },
  INFLUENCER: {
    slug: "influencer",
    name: "Influencer",
    description: "50+ profile views in one week",
    requirement: "Get trending on network",
  },
};

export async function initializeDefaultBadges() {
  for (const badge of Object.values(BADGES)) {
    const [existing] = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, badge.slug))
      .limit(1);

    if (!existing) {
      await db.insert(badgeDefinitionsTable).values({
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        requirement: badge.requirement,
      });
    }
  }
}

export async function awardBadgeToFounder(subscriberId: number, badgeSlug: string) {
  const [badgeDef] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, badgeSlug))
    .limit(1);

  if (!badgeDef) return null;

  // Check if already earned
  const [existing] = await db
    .select()
    .from(earnedBadgesTable)
    .where(
      and(
        eq(earnedBadgesTable.subscriberId, subscriberId),
        eq(earnedBadgesTable.badgeId, badgeDef.id)
      )
    )
    .limit(1);

  if (existing) return null;

  const [badge] = await db
    .insert(earnedBadgesTable)
    .values({
      subscriberId,
      badgeId: badgeDef.id,
    })
    .returning();

  return badge;
}
