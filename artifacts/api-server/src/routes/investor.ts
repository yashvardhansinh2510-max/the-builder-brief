import { Router, IRouter } from "express";
import { db, subscribersTable, wallsTable, investorProfilesTable, investorPreferencesTable, investorMatchesTable, investorConnectionsTable, investorEngagementTable } from "@workspace/db";
import { eq, desc, and, isNotNull, inArray, sql } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

const router: IRouter = Router();

// Middleware to verify investor status
const verifyInvestor = async (req: any, res: any, next: any) => {
  const email = req.user?.email;
  const [subscriber] = await db.select({ isInvestor: subscribersTable.isInvestor }).from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
  if (subscriber?.isInvestor) {
    next();
  } else {
    res.status(403).json({ error: "Investor access required" });
  }
};

// GET /dealflow — Returns top performing founders
router.get("/dealflow", verifyUser, verifyInvestor, async (req, res) => {
  try {
    const topFounders = await db
      .select({
        id: subscribersTable.id,
        score: subscribersTable.foundryScore,
        sector: subscribersTable.startupSector,
        stage: subscribersTable.startupStage,
        name: wallsTable.name,
        startupName: wallsTable.startupName,
      })
      .from(subscribersTable)
      .innerJoin(wallsTable, eq(subscribersTable.id, wallsTable.subscriberId))
      .where(and(isNotNull(subscribersTable.foundryScore), eq(wallsTable.isVisible, true)))
      .orderBy(desc(subscribersTable.foundryScore))
      .limit(20);

    res.json(topFounders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dealflow" });
  }
});

// GET /profile/:subscriberId — Get investor profile
router.get("/profile/:subscriberId", verifyUser, async (req, res) => {
  try {
    const subscriberId = String(req.params.subscriberId);
    const investor = await db
      .select()
      .from(investorProfilesTable)
      .where(eq(investorProfilesTable.subscriberId, parseInt(subscriberId)))
      .limit(1);

    if (investor.length === 0) {
      return res.status(404).json({ error: "Investor profile not found" });
    }

    const preferences = await db
      .select()
      .from(investorPreferencesTable)
      .where(eq(investorPreferencesTable.investorId, investor[0].id))
      .limit(1);

    return res.json({
      profile: investor[0],
      preferences: preferences[0] || null,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch investor profile" });
  }
});

// GET /matches/:subscriberId — Get matched startups for an investor
router.get("/matches/:subscriberId", verifyUser, verifyInvestor, async (req, res) => {
  try {
    const subscriberId = String(req.params.subscriberId);
    const investor = await db
      .select()
      .from(investorProfilesTable)
      .where(eq(investorProfilesTable.subscriberId, parseInt(subscriberId)))
      .limit(1);

    if (investor.length === 0) {
      return res.status(404).json({ error: "Investor not found" });
    }

    const matches = await db
      .select({
        id: investorMatchesTable.id,
        overallScore: investorMatchesTable.overallScore,
        stageAlignment: investorMatchesTable.stageAlignment,
        industryMatch: investorMatchesTable.industryMatch,
        reasons: investorMatchesTable.reasons,
        startupId: investorMatchesTable.startupSubscriberId,
        startupName: wallsTable.startupName,
        founderName: wallsTable.name,
      })
      .from(investorMatchesTable)
      .innerJoin(wallsTable, eq(investorMatchesTable.startupSubscriberId, wallsTable.subscriberId))
      .where(eq(investorMatchesTable.investorId, investor[0].id))
      .orderBy(desc(investorMatchesTable.overallScore))
      .limit(50);

    return res.json(matches);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// POST /connection — Create a connection between investor and startup
router.post("/connection", verifyUser, async (req, res) => {
  try {
    const { investorId, startupSubscriberId, initiatedBy } = req.body;

    const existingConnection = await db
      .select()
      .from(investorConnectionsTable)
      .where(and(
        eq(investorConnectionsTable.investorId, investorId),
        eq(investorConnectionsTable.startupSubscriberId, startupSubscriberId)
      ))
      .limit(1);

    if (existingConnection.length > 0) {
      return res.status(400).json({ error: "Connection already exists" });
    }

    const [connection] = await db.insert(investorConnectionsTable).values({
      investorId,
      startupSubscriberId,
      initiatedBy: initiatedBy || "startup",
      connectionStatus: "interested",
    }).returning();

    // Track engagement
    await db.insert(investorEngagementTable).values({
      investorId,
      startupSubscriberId,
      messagesSent: 1,
      lastInteractionAt: new Date(),
    }).onConflictDoUpdate({
      target: [investorEngagementTable.investorId, investorEngagementTable.startupSubscriberId],
      set: {
        messagesSent: sql`${investorEngagementTable.messagesSent} + 1`,
        lastInteractionAt: new Date(),
      },
    }).catch(() => null); // Ignore conflicts

    return res.json(connection);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create connection" });
  }
});

export default router;
