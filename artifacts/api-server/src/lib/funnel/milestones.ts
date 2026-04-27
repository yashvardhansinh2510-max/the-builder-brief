import { db } from "@/db";
import { proMilestones, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface MilestoneProgress {
  mrrTarget: { achieved: number; target: number; isHit: boolean };
  usersTarget: { achieved: number; target: number; isHit: boolean };
  featureShipped: boolean;
  milestonesHit: number;
  maxUpgradeEligibleAt?: Date;
}

export async function updateMilestoneProgress(
  userId: string,
  update: {
    currentMRR?: number;
    activeUsers?: number;
    featureShipped?: boolean;
  }
): Promise<MilestoneProgress> {
  const existing = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  const milestone = existing[0];

  if (!milestone) {
    throw new Error(`No milestone record found for user ${userId}`);
  }

  const mrrHit = update.currentMRR !== undefined
    ? update.currentMRR >= 500
    : milestone.mrrTargetHit;
  const usersHit = update.activeUsers !== undefined
    ? update.activeUsers >= 500
    : milestone.usersTargetHit;
  const featureHit = update.featureShipped !== undefined
    ? update.featureShipped
    : milestone.featureShippedHit;

  const milestonesHit = [mrrHit, usersHit, featureHit].filter(Boolean).length;
  const maxEligibleAt = milestonesHit >= 2 ? new Date() : null;

  await db
    .update(proMilestones)
    .set({
      mrrTargetHit: mrrHit,
      usersTargetHit: usersHit,
      featureShippedHit: featureHit,
      milestonesHit,
      maxUpgradeEligibleAt: maxEligibleAt,
      updatedAt: new Date(),
    })
    .where(eq(proMilestones.userId, userId));

  return getMilestoneProgress(userId);
}

export async function getMilestoneProgress(userId: string): Promise<MilestoneProgress> {
  const milestone = await db
    .select()
    .from(proMilestones)
    .where(eq(proMilestones.userId, userId))
    .limit(1);

  if (!milestone || milestone.length === 0) {
    throw new Error(`No milestone record found for user ${userId}`);
  }

  const m = milestone[0];

  return {
    mrrTarget: {
      achieved: m.currentMRR || 0,
      target: 500,
      isHit: m.mrrTargetHit,
    },
    usersTarget: {
      achieved: m.activeUsers || 0,
      target: 500,
      isHit: m.usersTargetHit,
    },
    featureShipped: m.featureShippedHit,
    milestonesHit: m.milestonesHit,
    maxUpgradeEligibleAt: m.maxUpgradeEligibleAt || undefined,
  };
}
