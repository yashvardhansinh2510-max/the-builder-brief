import { Router, IRouter } from "express";
import { z } from "zod";
import { db, subscribersTable, wallsTable, investorProfilesTable, investorPreferencesTable, investorMatchesTable, investorConnectionsTable, investorEngagementTable } from "@workspace/db";
import { eq, desc, and, isNotNull, inArray, sql } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

const connectionSchema = z.object({
  investorId: z.number().int().positive(),
  startupSubscriberId: z.number().int().positive(),
  initiatedBy: z.enum(["startup", "investor"]).optional(),
});

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
    const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
    const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;

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
      .limit(limit)
      .offset(offset);

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
  const parsed = connectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const { investorId, startupSubscriberId, initiatedBy } = parsed.data;

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

// GET /founder-matches — Get matched investors for the current founder
router.get("/founder-matches", verifyUser, async (req, res): Promise<void> => {
  try {
    const email = req.user?.email;
    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Find current subscriber
    const [subscriber] = await db
      .select({ id: subscribersTable.id })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);

    if (!subscriber) {
      res.status(404).json({ error: "Subscriber not found" });
      return;
    }

    // Get matches where the founder is this subscriber
    const matches = await db
      .select({
        matchId: investorMatchesTable.id,
        overallScore: investorMatchesTable.overallScore,
        stageAlignment: investorMatchesTable.stageAlignment,
        industryMatch: investorMatchesTable.industryMatch,
        reasons: investorMatchesTable.reasons,
        investorId: investorProfilesTable.id,
        firmName: investorProfilesTable.firmName,
        investorName: investorProfilesTable.investorName,
        bio: investorProfilesTable.bio,
        ticketSize: investorProfilesTable.ticketSize,
        linkedinUrl: investorProfilesTable.linkedinUrl,
        verified: investorProfilesTable.verified,
        investmentThesis: investorProfilesTable.investmentThesis,
        focusGeography: investorProfilesTable.focusGeography,
      })
      .from(investorMatchesTable)
      .innerJoin(
        investorProfilesTable,
        eq(investorMatchesTable.investorId, investorProfilesTable.id),
      )
      .where(eq(investorMatchesTable.startupSubscriberId, subscriber.id))
      .orderBy(desc(investorMatchesTable.overallScore))
      .limit(20);

    // Get preferences for each investor
    const investorIds = matches.map((m) => m.investorId);
    const preferences = investorIds.length > 0
      ? await db
          .select()
          .from(investorPreferencesTable)
          .where(inArray(investorPreferencesTable.investorId, investorIds))
      : [];

    const prefMap = new Map(preferences.map((p) => [p.investorId, p]));

    const enriched = matches.map((m) => {
      const pref = prefMap.get(m.investorId);
      return {
        id: m.investorId,
        name: m.firmName,
        investorName: m.investorName,
        bio: m.bio,
        ticketSize: m.ticketSize,
        linkedinUrl: m.linkedinUrl,
        verified: m.verified,
        matchScore: m.overallScore,
        stageAlignment: m.stageAlignment,
        industryMatch: m.industryMatch,
        reasons: (m.reasons as string[]) ?? [],
        investmentThesis: m.investmentThesis ?? "",
        preferredStages: (pref?.preferredStages as string[]) ?? [],
        preferredIndustries: (pref?.preferredIndustries as string[]) ?? [],
        focusGeography: (m.focusGeography as string[]) ?? [],
        stage: ((pref?.preferredStages as string[]) ?? []).join(", "),
        focus: (pref?.preferredIndustries as string[]) ?? [],
        checkSize: m.ticketSize ?? "",
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("founder-matches error:", error);
    res.status(500).json({ error: "Failed to fetch founder matches" });
  }
});

export default router;
