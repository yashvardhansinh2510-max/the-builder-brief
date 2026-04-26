import { Router, IRouter } from "express";
import { db, subscribersTable, referralsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import { nanoid } from "nanoid";

const router: IRouter = Router();

// GET /api/referrals/me — Get referral stats and code
router.get("/referrals/me", verifyUser, async (req, res) => {
  try {
    const email = (req as any).user?.email;
    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    // Ensure referral code exists
    let referralCode = subscriber.referralCode;
    if (!referralCode) {
      referralCode = nanoid(10);
      await db.update(subscribersTable).set({ referralCode }).where(eq(subscribersTable.id, subscriber.id));
    }

    const [referralStats] = await db
      .select({ count: count() })
      .from(referralsTable)
      .where(eq(referralsTable.referrerId, subscriber.id));

    return res.json({
      referralCode,
      referralCount: Number(referralStats?.count || 0),
      shareUrl: `https://thebuildbrief.com?ref=${referralCode}`
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch referral stats" });
  }
});

// POST /api/referrals/verify-milestone — Check and award rewards
router.post("/referrals/verify-milestone", verifyUser, async (req, res) => {
  try {
    const email = (req as any).user?.email;
    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const [referralStats] = await db
      .select({ count: count() })
      .from(referralsTable)
      .where(eq(referralsTable.referrerId, subscriber.id));

    const referralCount = Number(referralStats?.count || 0);
    let newTier = subscriber.tier;
    let upgraded = false;

    // Milestone logic: 3 = Pro, 10 = Max
    if (referralCount >= 10 && subscriber.tier !== "max" && subscriber.tier !== "incubator") {
      newTier = "max";
      upgraded = true;
    } else if (referralCount >= 3 && subscriber.tier === "free") {
      newTier = "pro";
      upgraded = true;
    }

    if (upgraded) {
      await db.update(subscribersTable)
        .set({ tier: newTier, updatedAt: new Date() })
        .where(eq(subscribersTable.id, subscriber.id));
    }

    return res.json({
      success: true,
      upgraded,
      currentTier: newTier,
      referralCount
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify milestones" });
  }
});

export default router;
