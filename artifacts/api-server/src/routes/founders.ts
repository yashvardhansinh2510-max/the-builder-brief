import { Router, IRouter } from "express";
import { db, wallsTable, founderLeaderboardTable, founderConnectionsTable, profileEngagementTable, earnedBadgesTable, badgeDefinitionsTable, subscribersTable, builtWithVerificationTable } from "@workspace/db";
import { eq, desc, sql, and, or } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import crypto from "crypto";

const router: IRouter = Router();

// Hash IP for anonymous tracking
function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + process.env.IP_HASH_SALT || "salt").digest("hex");
}

// GET /api/founders/leaderboard — Founder rankings by engagement
router.get("/founders/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const leaderboard = await db
      .select({
        id: wallsTable.id,
        name: wallsTable.name,
        startupName: wallsTable.startupName,
        avatarUrl: wallsTable.avatarUrl,
        sector: wallsTable.sector,
        stage: wallsTable.stage,
        profileViews: founderLeaderboardTable.profileViews,
        connectionsCount: founderLeaderboardTable.connectionsCount,
        badgesCount: founderLeaderboardTable.badgesCount,
        networkEngagementScore: founderLeaderboardTable.networkEngagementScore,
      })
      .from(founderLeaderboardTable)
      .innerJoin(wallsTable, eq(founderLeaderboardTable.subscriberId, wallsTable.subscriberId))
      .where(eq(wallsTable.isVisible, true))
      .orderBy(desc(founderLeaderboardTable.networkEngagementScore))
      .limit(limit)
      .offset(offset);

    return res.json(leaderboard);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/founders/directory — Search and discover founders
router.get("/founders/directory", async (req, res) => {
  try {
    const search = req.query.search as string;
    const sector = req.query.sector as string;
    const stage = req.query.stage as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const conditions = [eq(wallsTable.isVisible, true)];

    if (search) {
      conditions.push(
        or(
          sql`${wallsTable.name} ILIKE ${"%" + search + "%"}`,
          sql`${wallsTable.startupName} ILIKE ${"%" + search + "%"}`,
          sql`${wallsTable.bio} ILIKE ${"%" + search + "%"}`
        ) || sql`true`
      );
    }

    if (sector) {
      conditions.push(eq(wallsTable.sector, sector));
    }

    if (stage) {
      conditions.push(eq(wallsTable.stage, stage));
    }

    const founders = await db
      .select({
        id: wallsTable.id,
        name: wallsTable.name,
        startupName: wallsTable.startupName,
        sector: wallsTable.sector,
        stage: wallsTable.stage,
        bio: wallsTable.bio,
        avatarUrl: wallsTable.avatarUrl,
        linkedinUrl: wallsTable.linkedinUrl,
        twitterUrl: wallsTable.twitterUrl,
        websiteUrl: wallsTable.websiteUrl,
        networkEngagementScore: founderLeaderboardTable.networkEngagementScore,
      })
      .from(wallsTable)
      .leftJoin(founderLeaderboardTable, eq(wallsTable.subscriberId, founderLeaderboardTable.subscriberId))
      .where(and(...conditions))
      .orderBy(desc(founderLeaderboardTable.networkEngagementScore))
      .limit(limit);

    return res.json(founders);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch founders" });
  }
});

// GET /api/founders/:id — Get single founder profile with stats
router.get("/founders/:id", async (req, res) => {
  try {
    const founderId = parseInt(req.params.id as string);
    const viewerEmail = req.user?.email;

    const [founder] = await db
      .select({
        id: wallsTable.id,
        subscriberId: wallsTable.subscriberId,
        name: wallsTable.name,
        startupName: wallsTable.startupName,
        sector: wallsTable.sector,
        stage: wallsTable.stage,
        bio: wallsTable.bio,
        avatarUrl: wallsTable.avatarUrl,
        linkedinUrl: wallsTable.linkedinUrl,
        twitterUrl: wallsTable.twitterUrl,
        githubUrl: wallsTable.githubUrl,
        websiteUrl: wallsTable.websiteUrl,
        skills: wallsTable.skills,
        lookingFor: wallsTable.lookingFor,
        profileViews: founderLeaderboardTable.profileViews,
        connectionsCount: founderLeaderboardTable.connectionsCount,
        badgesCount: founderLeaderboardTable.badgesCount,
        networkEngagementScore: founderLeaderboardTable.networkEngagementScore,
      })
      .from(wallsTable)
      .leftJoin(founderLeaderboardTable, eq(wallsTable.subscriberId, founderLeaderboardTable.subscriberId))
      .where(eq(wallsTable.id, founderId));

    if (!founder) {
      return res.status(404).json({ error: "Founder not found" });
    }

    // Track profile view
    if (viewerEmail && founder.subscriberId !== null) {
      const [viewer] = await db.select({ id: subscribersTable.id }).from(subscribersTable).where(eq(subscribersTable.email, viewerEmail)).limit(1);

      await db.insert(profileEngagementTable).values({
        profileSubscriberId: founder.subscriberId,
        viewerSubscriberId: viewer?.id || null,
        interactionType: "view",
      });

      // Update profile view count
      await db
        .update(founderLeaderboardTable)
        .set({ profileViews: sql`${founderLeaderboardTable.profileViews} + 1` })
        .where(eq(founderLeaderboardTable.subscriberId, founder.subscriberId));
    } else if (!viewerEmail && founder.subscriberId) {
      const ipHash = hashIp(req.ip || "unknown");
      await db.insert(profileEngagementTable).values({
        profileSubscriberId: founder.subscriberId,
        interactionType: "view",
        ipHash,
      });

      await db
        .update(founderLeaderboardTable)
        .set({ profileViews: sql`${founderLeaderboardTable.profileViews} + 1` })
        .where(eq(founderLeaderboardTable.subscriberId, founder.subscriberId));
    }

    // Get badges
    const badges = await db
      .select({
        id: badgeDefinitionsTable.id,
        slug: badgeDefinitionsTable.slug,
        name: badgeDefinitionsTable.name,
        description: badgeDefinitionsTable.description,
        iconUrl: badgeDefinitionsTable.iconUrl,
        earnedAt: earnedBadgesTable.earnedAt,
      })
      .from(earnedBadgesTable)
      .innerJoin(badgeDefinitionsTable, eq(earnedBadgesTable.badgeId, badgeDefinitionsTable.id))
      .where(eq(earnedBadgesTable.subscriberId, founder.subscriberId || 0));

    // Get "Built with Builder Brief" verification
    const [builtWith] = await db
      .select()
      .from(builtWithVerificationTable)
      .where(eq(builtWithVerificationTable.subscriberId, founder.subscriberId || 0));

    return res.json({
      ...founder,
      badges,
      builtWith: builtWith?.verificationStatus === "verified" ? builtWith : null,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch founder" });
  }
});

// POST /api/founders/me/connect — Connect with another founder
router.post("/founders/:id/connect", verifyUser, async (req, res) => {
  try {
    const targetFounderId = parseInt(req.params.id as string);
    const email = req.user?.email;

    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const connectionType = typeof req.body.connectionType === "string" ? req.body.connectionType : "colleague";

    // Check if already connected
    const [existing] = await db
      .select()
      .from(founderConnectionsTable)
      .where(
        or(
          and(eq(founderConnectionsTable.subscriberId1, subscriber.id), eq(founderConnectionsTable.subscriberId2, targetFounderId)),
          and(eq(founderConnectionsTable.subscriberId1, targetFounderId), eq(founderConnectionsTable.subscriberId2, subscriber.id))
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "Already connected" });
    }

    const [connection] = await db
      .insert(founderConnectionsTable)
      .values({
        subscriberId1: subscriber.id,
        subscriberId2: targetFounderId,
        connectionType,
        strength: 1,
      })
      .returning();

    // Update both founders' connection counts
    await db
      .update(founderLeaderboardTable)
      .set({ connectionsCount: sql`${founderLeaderboardTable.connectionsCount} + 1` })
      .where(eq(founderLeaderboardTable.subscriberId, subscriber.id));

    await db
      .update(founderLeaderboardTable)
      .set({ connectionsCount: sql`${founderLeaderboardTable.connectionsCount} + 1` })
      .where(eq(founderLeaderboardTable.subscriberId, targetFounderId));

    return res.json(connection);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create connection" });
  }
});

// GET /api/founders/me/connections — Get my network
router.get("/founders/me/connections", verifyUser, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const connections = await db
      .select({
        id: founderConnectionsTable.id,
        connectionType: founderConnectionsTable.connectionType,
        strength: founderConnectionsTable.strength,
        founder: {
          id: wallsTable.id,
          name: wallsTable.name,
          startupName: wallsTable.startupName,
          avatarUrl: wallsTable.avatarUrl,
        },
      })
      .from(founderConnectionsTable)
      .innerJoin(wallsTable, eq(founderConnectionsTable.subscriberId2, wallsTable.subscriberId))
      .where(eq(founderConnectionsTable.subscriberId1, subscriber.id));

    return res.json(connections);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// GET /api/founders/me/stats — Profile analytics
router.get("/founders/me/stats", verifyUser, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const [stats] = await db
      .select({
        profileViews: founderLeaderboardTable.profileViews,
        connectionsCount: founderLeaderboardTable.connectionsCount,
        badgesCount: founderLeaderboardTable.badgesCount,
        networkEngagementScore: founderLeaderboardTable.networkEngagementScore,
      })
      .from(founderLeaderboardTable)
      .where(eq(founderLeaderboardTable.subscriberId, subscriber.id));

    if (!stats) {
      return res.json({
        profileViews: 0,
        connectionsCount: 0,
        badgesCount: 0,
        networkEngagementScore: 0,
      });
    }

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// POST /api/founders/verify-built-with — Verify "Built with Builder Brief"
router.post("/founders/verify-built-with", verifyUser, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const { companyName, websiteUrl, traction } = req.body;

    const [existing] = await db
      .select()
      .from(builtWithVerificationTable)
      .where(eq(builtWithVerificationTable.subscriberId, subscriber.id))
      .limit(1);

    const data = { subscriberId: subscriber.id, companyName, websiteUrl, traction };

    if (existing) {
      const [updated] = await db
        .update(builtWithVerificationTable)
        .set(data)
        .where(eq(builtWithVerificationTable.subscriberId, subscriber.id))
        .returning();
      return res.json(updated);
    }

    const [inserted] = await db.insert(builtWithVerificationTable).values(data).returning();
    return res.json(inserted);
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit verification" });
  }
});

export default router;
