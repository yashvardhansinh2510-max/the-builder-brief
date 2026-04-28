import { db } from "@/db";
import { founderSignals, proMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface ScoutScore {
  totalScore: number;
  growthTrajectory: number;
  credibility: number;
  marketOpportunity: number;
  isInvitable: boolean;
  reasons: string[];
}

export async function calculateScoutScore(userId: string): Promise<ScoutScore> {
  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (!signals || signals.length === 0) {
    return {
      totalScore: 0,
      growthTrajectory: 0,
      credibility: 0,
      marketOpportunity: 0,
      isInvitable: false,
      reasons: ["No founder signals found"],
    };
  }

  const signal = signals[0];

  const milestones = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  let growthTrajectory = 0;
  let reasons: string[] = [];

  // Growth Trajectory (0-30 points)
  if (signal.scorecardRunsLast30Days >= 10) {
    growthTrajectory = 30;
    reasons.push("High engagement with scorecard (10+ runs)");
  } else if (signal.scorecardRunsLast30Days >= 5) {
    growthTrajectory = 20;
    reasons.push("Strong scorecard engagement (5+ runs)");
  } else if (signal.scorecardRunsLast30Days >= 2) {
    growthTrajectory = 10;
    reasons.push("Active scorecard user");
  }

  // Additional growth trajectory from milestone velocity
  if (milestones && milestones.length > 0) {
    const milestone = milestones[0];
    if (
      milestone.mrrCurrent >= 50000 &&
      milestone.usersCurrent >= 500
    ) {
      growthTrajectory = Math.min(30, growthTrajectory + 10);
      reasons.push("Hitting revenue and user targets");
    }
  }

  // Credibility (0-35 points)
  let credibility = 0;

  // Network activity
  if (signal.networkConnectionsCount >= 50) {
    credibility += 15;
    reasons.push("Strong founder network (50+ connections)");
  } else if (signal.networkConnectionsCount >= 20) {
    credibility += 10;
    reasons.push("Active founder network (20+ connections)");
  } else if (signal.networkConnectionsCount >= 5) {
    credibility += 5;
    reasons.push("Building founder network");
  }

  // Public presence / content
  if (signal.contentPublishedCount >= 5) {
    credibility += 10;
    reasons.push("Active content creator (5+ pieces)");
  } else if (signal.contentPublishedCount >= 2) {
    credibility += 5;
    reasons.push("Publishing content");
  }

  // Repeat user (consistent engagement)
  if (signal.scorecardRunsLast30Days > 0 && signal.lastActiveAt) {
    const lastActive = new Date(signal.lastActiveAt);
    const daysSinceActive = Math.floor(
      (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActive <= 7) {
      credibility += 10;
      reasons.push("Active this week");
    }
  }

  credibility = Math.min(35, credibility);

  // Market Opportunity (0-35 points)
  let marketOpportunity = 0;

  if (milestones && milestones.length > 0) {
    const milestone = milestones[0];

    // Market assessment
    const market = signal.founderMarket;
    if (
      market === "b2b-saas" ||
      market === "marketplace" ||
      market === "developer-tools"
    ) {
      marketOpportunity += 15;
      reasons.push(`Operating in high-opportunity market: ${market}`);
    } else if (market === "consumer") {
      marketOpportunity += 10;
      reasons.push("Operating in consumer market");
    }

    // Founder stage
    const stage = signal.founderStage;
    if (stage === "series-b") {
      marketOpportunity += 15;
      reasons.push("Series B founder (scale phase)");
    } else if (stage === "series-a") {
      marketOpportunity += 10;
      reasons.push("Series A founder");
    }
  }

  marketOpportunity = Math.min(35, marketOpportunity);

  const totalScore = growthTrajectory + credibility + marketOpportunity;
  const isInvitable = totalScore >= 70;

  return {
    totalScore,
    growthTrajectory,
    credibility,
    marketOpportunity,
    isInvitable,
    reasons,
  };
}

export async function identifyScoutCandidates(): Promise<
  Array<{
    userId: string;
    score: ScoutScore;
  }>
> {
  const maxTierUsers = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.currentTier, "max"));

  const candidates = [];

  for (const user of maxTierUsers) {
    const score = await calculateScoutScore(user.userId);
    if (score.isInvitable) {
      candidates.push({
        userId: user.userId,
        score,
      });
    }
  }

  return candidates;
}

export async function updateScoutScore(userId: string): Promise<ScoutScore> {
  const score = await calculateScoutScore(userId);

  const existing = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  if (existing && existing.length > 0) {
    await db
      .update(founderSignals)
      .set({
        scoutScore: score.totalScore,
        scoutScoreIsInvitable: score.isInvitable,
      })
      .where(eq(founderSignals.userId, userId));
  }

  return score;
}
