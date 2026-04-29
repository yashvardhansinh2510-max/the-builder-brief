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
      milestone.currentMrr >= 50000 &&
      milestone.currentUserCount >= 500
    ) {
      growthTrajectory = Math.min(30, growthTrajectory + 10);
      reasons.push("Hitting revenue and user targets");
    }
  }

  // Credibility (0-35 points)
  let credibility = 0;

  // Advisor engagement (credibility through expert guidance)
  if (signal.advisorCallsCompleted >= 3) {
    credibility += 15;
    reasons.push("Strong advisor engagement (3+ calls)");
  } else if (signal.advisorCallsCompleted >= 1) {
    credibility += 10;
    reasons.push("Active advisor engagement");
  }

  // Founded before signal (experience/credibility)
  if (signal.foundedBefore) {
    credibility += 10;
    reasons.push("Prior founding experience");
  }

  // Previous exits
  if (signal.previousExits >= 2) {
    credibility += 10;
    reasons.push("Multiple exits (experienced founder)");
  } else if (signal.previousExits >= 1) {
    credibility += 5;
    reasons.push("Prior successful exit");
  }

  // Playbook engagement (consistent usage)
  if (signal.playbookPagesViewedLast30Days >= 20) {
    credibility += 5;
    reasons.push("Strong playbook engagement");
  } else if (signal.playbookPagesViewedLast30Days >= 5) {
    credibility += 3;
    reasons.push("Active playbook user");
  }

  // Recent activity check
  if (signal.lastScorecardRunAt) {
    const lastRun = new Date(signal.lastScorecardRunAt);
    const daysSinceActive = Math.floor(
      (Date.now() - lastRun.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActive <= 7) {
      credibility += 5;
      reasons.push("Active this week");
    }
  }

  credibility = Math.min(35, credibility);

  // Market Opportunity (0-35 points)
  let marketOpportunity = 0;

  // TAM assessment
  const tam = signal.estimatedTam;
  if (tam === "$1B+" || tam === "$500M+") {
    marketOpportunity += 15;
    reasons.push(`Large TAM: ${tam}`);
  } else if (tam === "$100M+" || tam === "$50M+") {
    marketOpportunity += 10;
    reasons.push(`Mid-range TAM: ${tam}`);
  }

  // Defensibility
  if (signal.defensibility === "high") {
    marketOpportunity += 10;
    reasons.push("High product defensibility");
  } else if (signal.defensibility === "medium") {
    marketOpportunity += 5;
    reasons.push("Medium defensibility");
  }

  // Growth trajectory (consecutive quarters)
  if (signal.consecutiveGrowthQuarters >= 3) {
    marketOpportunity += 10;
    reasons.push("Strong multi-quarter growth");
  } else if (signal.consecutiveGrowthQuarters >= 1) {
    marketOpportunity += 5;
    reasons.push("Showing growth trajectory");
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
  const allSignals = await db
    .select()
    .from(founderSignals);

  const candidates = [];

  for (const signal of allSignals) {
    const score = await calculateScoutScore(signal.userId);
    if (score.isInvitable) {
      candidates.push({
        userId: signal.userId,
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
        scoutScore: score.totalScore.toString(),
        scoutInvitedAt: score.isInvitable ? new Date() : existing[0].scoutInvitedAt,
      })
      .where(eq(founderSignals.userId, userId));
  }

  return score;
}
