import { Router, type IRouter } from "express";
import { eq, and, sql, or } from "drizzle-orm";
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
        connectionsCount: founderLeaderboardTable.connectionsCount,
        badgesCount: founderLeaderboardTable.badgesCount,
      })
      .from(founderLeaderboardTable);

    let updatedCount = 0;

    for (const founder of founders) {
      // Get current connection count from founderConnectionsTable
      const [connResult] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(founderConnectionsTable)
        .where(
          or(
            eq(founderConnectionsTable.subscriberId1, founder.subscriberId),
            eq(founderConnectionsTable.subscriberId2, founder.subscriberId)
          )
        );

      const connectionsCount = connResult?.count || 0;

      // Calculate engagement score: profileViews (1pt each) + connections (5pts each) + badges (10pts each)
      const engagementScore =
        (founder.profileViews || 0) * 1 +
        connectionsCount * 5 +
        (founder.badgesCount || 0) * 10;

      // Award badges based on thresholds
      if (connectionsCount >= 5) {
        await awardBadgeToFounder(founder.subscriberId, "networker");
      }

      if ((founder.profileViews || 0) >= 10) {
        await awardBadgeToFounder(founder.subscriberId, "connector");
      }

      if ((founder.profileViews || 0) >= 50) {
        await awardBadgeToFounder(founder.subscriberId, "influencer");
      }

      // Get updated badge count
      const [badgeCountResult] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(earnedBadgesTable)
        .where(eq(earnedBadgesTable.subscriberId, founder.subscriberId));

      const badgeCount = badgeCountResult?.count || 0;

      // Update leaderboard
      await db
        .update(founderLeaderboardTable)
        .set({
          connectionsCount,
          badgesCount: badgeCount,
          networkEngagementScore: engagementScore,
        })
        .where(eq(founderLeaderboardTable.subscriberId, founder.subscriberId));

      updatedCount++;
    }

    res.json({
      success: true,
      updated: updatedCount,
      message: `Updated engagement scores and badges for ${updatedCount} founders`,
    });
  } catch (error) {
    console.error("Founder network calculation error:", error);
    res.status(500).json({ error: "Failed to calculate founder network" });
  }
});

export default router;
