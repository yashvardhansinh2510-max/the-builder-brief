import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { db } from "@specflow/db";
import { creatorEarnings, payoutHistory, creatorSubscriptions, referralTiers } from "@specflow/db";

const router = Router();

// Get creator earnings dashboard
router.get("/earnings/dashboard", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const earnings = await db.query.creatorEarnings.findMany({
      where: (fields, { eq }) => eq(fields.creatorId, creatorId),
      orderBy: (fields) => fields.month,
    });

    const payouts = await db.query.payoutHistory.findMany({
      where: (fields, { eq }) => eq(fields.creatorId, creatorId),
      limit: 10,
    });

    const referrals = await db.query.referralTiers.findFirst({
      where: (fields, { eq }) => eq(fields.userId, creatorId),
    });

    const totalRevenue = earnings.reduce(
      (sum, e) => sum + parseFloat(e.totalRevenue || "0"),
      0
    );

    res.json({
      totalRevenue,
      earnings,
      payouts,
      referralTier: referrals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

// Request payout
router.post("/earnings/request-payout", verifyUser, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const payout = await db.insert(payoutHistory).values({
      creatorId,
      amount,
      method,
      status: "pending",
    });

    res.json({ success: true, payout });
  } catch (error) {
    res.status(500).json({ error: "Failed to create payout request" });
  }
});

// Get subscriber count & MRR
router.get("/earnings/revenue-metrics", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const subscriptions = await db.query.creatorSubscriptions.findMany({
      where: (fields, { eq, and }) =>
        and(
          eq(fields.creatorId, creatorId),
          eq(fields.status, "active")
        ),
    });

    const mrr = subscriptions.reduce(
      (sum, sub) => sum + parseFloat(sub.monthlyPrice || "0"),
      0
    );

    res.json({
      activeSubscribers: subscriptions.length,
      mrr,
      annualizedRevenue: mrr * 12,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
