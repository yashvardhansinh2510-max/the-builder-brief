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

export default router;
