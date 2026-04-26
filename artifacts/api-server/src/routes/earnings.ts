import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { db } from "@workspace/db";
import { creatorEarnings, payoutHistory, creatorSubscriptions, referralTiers } from "@workspace/db";

const router = Router();

// Get creator earnings dashboard
router.get("/earnings/dashboard", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const creatorIdNum = parseInt(creatorId, 10);

    const earnings = await db.query.creatorEarnings.findMany({
      where: (fields, { eq }) => eq(fields.creatorId, creatorIdNum),
      orderBy: (fields) => fields.month,
    });

    const payouts = await db.query.payoutHistory.findMany({
      where: (fields, { eq }) => eq(fields.creatorId, creatorIdNum),
      limit: 10,
    });

    const referrals = await db.query.referralTiers.findFirst({
      where: (fields, { eq }) => eq(fields.userId, creatorIdNum),
    });

    const totalRevenue = earnings.reduce(
      (sum, e) => sum + parseFloat(e.totalRevenue || "0"),
      0
    );

    return res.json({
      totalRevenue,
      earnings,
      payouts,
      referralTier: referrals,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

// Request payout
router.post("/earnings/request-payout", verifyUser, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const creatorIdNum = parseInt(creatorId, 10);

    const payout = await db.insert(payoutHistory).values({
      creatorId: creatorIdNum,
      amount: String(parseFloat(amount)),
      method,
      status: "pending",
    });

    return res.json({ success: true, payout });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create payout request" });
  }
});

// Get subscriber count & MRR
router.get("/earnings/revenue-metrics", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const creatorIdNum = parseInt(creatorId, 10);

    const subscriptions = await db.query.creatorSubscriptions.findMany({
      where: (fields, { eq, and }) =>
        and(
          eq(fields.creatorId, creatorIdNum),
          eq(fields.status, "active")
        ),
    });

    const mrr = subscriptions.reduce(
      (sum, sub) => sum + parseFloat(sub.monthlyPrice || "0"),
      0
    );

    return res.json({
      activeSubscribers: subscriptions.length,
      mrr,
      annualizedRevenue: mrr * 12,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
