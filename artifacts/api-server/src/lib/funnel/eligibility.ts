import { db } from "@/db";
import { subscribersTable, founderSignals, proMilestones, advisorAssignments, upgradeOffers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

export interface UpgradeEligibility {
  tier: "free" | "pro" | "max";
  isEligible: boolean;
  reason?: string;
  triggerType?: string;
}

export async function checkFreeToProEligibility(userId: string): Promise<UpgradeEligibility> {
  const user = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.id, parseInt(userId, 10)))
    .limit(1);

  if (!user || user[0]?.tier !== "free") {
    return { tier: "free", isEligible: false, reason: "User is not on Free tier" };
  }

  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals) {
    return { tier: "free", isEligible: false, reason: "No signal data found" };
  }

  const signal = signals[0];

  const hasWeakHealthScore = signal.scorecardRunsLast30Days >= 1;
  const hasPlaybookClicks = signal.playbookPagesViewedLast30Days >= 3;
  const hasConsistentUsage = signal.scorecardRunsLast30Days >= 2;

  if (hasWeakHealthScore || hasPlaybookClicks || hasConsistentUsage) {
    return {
      tier: "free",
      isEligible: true,
      reason: "Qualifies for Pro upgrade",
      triggerType: hasWeakHealthScore
        ? "health_score"
        : hasPlaybookClicks
          ? "playbook_clicks"
          : "usage_pattern",
    };
  }

  return { tier: "free", isEligible: false, reason: "Not ready for upgrade yet" };
}

export async function checkProToMaxEligibility(userId: string): Promise<UpgradeEligibility> {
  const user = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.id, parseInt(userId, 10)))
    .limit(1);

  if (!user || user[0]?.tier !== "pro") {
    return { tier: "pro", isEligible: false, reason: "User is not on Pro tier" };
  }

  const milestones = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  if (!milestones) {
    return { tier: "pro", isEligible: false, reason: "No milestone tracking found" };
  }

  const milestone = milestones[0];

  if (milestone.milestonesHit >= 2) {
    return {
      tier: "pro",
      isEligible: true,
      reason: `Qualified: ${milestone.milestonesHit} milestones hit`,
      triggerType: "milestone_hit",
    };
  }

  return {
    tier: "pro",
    isEligible: false,
    reason: `Need 2 of 3 milestones. Currently at: ${milestone.milestonesHit}`,
  };
}

export async function checkMaxToIncubatorEligibility(userId: string): Promise<UpgradeEligibility> {
  const user = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.id, parseInt(userId, 10)))
    .limit(1);

  if (!user || user[0]?.tier !== "max") {
    return { tier: "max", isEligible: false, reason: "User is not on Max tier" };
  }

  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals) {
    return { tier: "max", isEligible: false, reason: "No signal data found" };
  }

  const signal = signals[0];

  const hasGrowthTrajectory = signal.consecutiveGrowthQuarters >= 2;
  const hasCredibility =
    signal.previousExits > 0 ||
    signal.advisorCallsCompleted >= 2 ||
    signal.foundedBefore === true;
  const hasMarketOpportunity =
    signal.estimatedTam === "$1B+" ||
    signal.defensibility === "high";

  const scoutScore =
    (hasGrowthTrajectory ? 30 : 0) +
    (hasCredibility ? 35 : 0) +
    (hasMarketOpportunity ? 35 : 0);

  if (scoutScore >= 70) {
    return {
      tier: "max",
      isEligible: true,
      reason: `Scout score: ${scoutScore}/100. Qualifies for Incubator invitation.`,
      triggerType: "scout_invite",
    };
  }

  return {
    tier: "max",
    isEligible: false,
    reason: `Scout score: ${scoutScore}/100. Need 70+ for Incubator.`,
  };
}

export async function checkAndNotifyFreeToProEligibility(userId: string) {
  const eligibility = await checkFreeToProEligibility(userId);

  if (!eligibility.isEligible) {
    return { sent: false, reason: eligibility.reason };
  }

  const offerId = `offer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(upgradeOffers).values({
    id: offerId,
    userId,
    fromTier: "free",
    toTier: "pro",
    triggerType: eligibility.triggerType || "usage_pattern",
    emailSentAt: new Date(),
    expiresAt,
    createdAt: new Date(),
  });

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "founders@thebuilderbrief.com",
    to: "founder@example.com",
    subject: "You're ready to unlock Pro insights",
    html: `<p>You've shown strong engagement with The Builder Brief. Your next step: Pro tier unlocks playbook guidance, founder calls, and market intel personalized to your stage.</p><p><a href="https://thebuilderbrief.com/upgrade/pro?offerId=${offerId}">Upgrade to Pro</a></p>`,
  });

  return { sent: true, offerId };
}

export async function checkAllUpgradeEligibilities(userId: string) {
  const freeToProResult = await checkFreeToProEligibility(userId);
  const proToMaxResult = await checkProToMaxEligibility(userId);
  const maxToIncubatorResult = await checkMaxToIncubatorEligibility(userId);

  return {
    freeToProResult,
    proToMaxResult,
    maxToIncubatorResult,
  };
}
