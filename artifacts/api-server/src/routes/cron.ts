import { Router, type IRouter } from "express";
import { eq, and, sql, or, inArray } from "drizzle-orm";
import { createHmac } from "crypto";
import { db, subscribersTable, founderLeaderboardTable, wallsTable, founderConnectionsTable, earnedBadgesTable, badgeDefinitionsTable } from "@workspace/db";
import { resend, FROM_EMAIL, SITE_URL } from "../lib/resend";
import { newsletterEmailHtml } from "../lib/email-templates";
import { getLatestIssue } from "../lib/issues-data";
import { awardBadgeToFounder, initializeDefaultBadges } from "../lib/badge-system";

function makeUnsubToken(email: string): string {
  const secret = process.env.CRON_SECRET ?? "changeme";
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

const router: IRouter = Router();

router.get("/cron/newsletter", async (req, res): Promise<void> => {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const issue = getLatestIssue();

  const subscribers = await db
    .select({ email: subscribersTable.email })
    .from(subscribersTable)
    .where(
      and(
        eq(subscribersTable.confirmed, true),
        eq(subscribersTable.unsubscribed, false),
      ),
    );

  if (subscribers.length === 0) {
    res.json({ sent: 0, message: "No confirmed subscribers" });
    return;
  }

  const BATCH_SIZE = 100;
  let totalSent = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const emails = batch.map((sub) => {
      const sig = makeUnsubToken(sub.email);
      const unsubUrl = `${SITE_URL}/api/subscribers/unsubscribe-link?email=${encodeURIComponent(sub.email)}&sig=${sig}`;
      return {
        from: FROM_EMAIL,
        to: sub.email,
        subject: `The Builder Brief #${issue.number}: ${issue.title}`,
        html: newsletterEmailHtml(issue, sub.email, unsubUrl),
      };
    });
    const result = await resend.batch.send(emails);
    const successCount = result.data?.data?.length ?? batch.length;
    totalSent += successCount;
    if (result.error) {
      console.error("Resend batch error:", result.error);
    }
  }

  res.json({ sent: totalSent, issue: issue.number });
});

router.get("/cron/calculate-founder-network", async (req, res): Promise<void> => {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Initialize default badges if not already done
    await initializeDefaultBadges();

    // Get all founders with their current stats
    const founders = await db
      .select({
        subscriberId: founderLeaderboardTable.subscriberId,
        profileViews: founderLeaderboardTable.profileViews,
      })
      .from(founderLeaderboardTable);

    if (founders.length === 0) {
      res.json({ success: true, updated: 0, message: "No founders to update" });
      return;
    }

    const founderIds = founders.map((f) => f.subscriberId);

    // Batch query: connection counts per founder (both sides of the relationship)
    const connCounts = await db
      .select({
        subscriberId: founderConnectionsTable.subscriberId1,
        count: sql<number>`count(*)::int`,
      })
      .from(founderConnectionsTable)
      .where(inArray(founderConnectionsTable.subscriberId1, founderIds))
      .groupBy(founderConnectionsTable.subscriberId1);

    const connCounts2 = await db
      .select({
        subscriberId: founderConnectionsTable.subscriberId2,
        count: sql<number>`count(*)::int`,
      })
      .from(founderConnectionsTable)
      .where(inArray(founderConnectionsTable.subscriberId2, founderIds))
      .groupBy(founderConnectionsTable.subscriberId2);

    const connMap = new Map<number, number>();
    for (const r of [...connCounts, ...connCounts2]) {
      connMap.set(r.subscriberId, (connMap.get(r.subscriberId) ?? 0) + r.count);
    }

    // Award badges in parallel
    await Promise.all(
      founders.flatMap((f) => {
        const connections = connMap.get(f.subscriberId) ?? 0;
        const views = f.profileViews ?? 0;
        const tasks: Promise<unknown>[] = [];
        if (connections >= 5) tasks.push(awardBadgeToFounder(f.subscriberId, "networker"));
        if (views >= 10) tasks.push(awardBadgeToFounder(f.subscriberId, "connector"));
        if (views >= 50) tasks.push(awardBadgeToFounder(f.subscriberId, "influencer"));
        return tasks;
      })
    );

    // Batch query: badge counts per founder
    const badgeCounts = await db
      .select({
        subscriberId: earnedBadgesTable.subscriberId,
        count: sql<number>`count(*)::int`,
      })
      .from(earnedBadgesTable)
      .where(inArray(earnedBadgesTable.subscriberId, founderIds))
      .groupBy(earnedBadgesTable.subscriberId);

    const badgeMap = new Map(badgeCounts.map((r) => [r.subscriberId, r.count]));

    // Bulk update leaderboard rows
    await Promise.all(
      founders.map((f) => {
        const connections = connMap.get(f.subscriberId) ?? 0;
        const badges = badgeMap.get(f.subscriberId) ?? 0;
        const engagementScore = (f.profileViews ?? 0) * 1 + connections * 5 + badges * 10;
        return db
          .update(founderLeaderboardTable)
          .set({ connectionsCount: connections, badgesCount: badges, networkEngagementScore: engagementScore })
          .where(eq(founderLeaderboardTable.subscriberId, f.subscriberId));
      })
    );

    res.json({
      success: true,
      updated: founders.length,
      message: `Updated engagement scores and badges for ${founders.length} founders`,
    });
  } catch (error) {
    console.error("Founder network calculation error:", error);
    res.status(500).json({ error: "Failed to calculate founder network" });
  }
});

export default router;
