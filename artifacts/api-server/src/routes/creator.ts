import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { db, creatorSubscriptions, subscribersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// Create creator subscription (set up tiered offering)
router.post("/creator/subscriptions", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const { tier, monthlyPrice } = req.body;
    if (!tier || monthlyPrice === undefined) {
      return res.status(400).json({ error: "Tier and monthly price are required" });
    }

    const creatorIdNum = parseInt(creatorId, 10);

    const subscription = await db
      .insert(creatorSubscriptions)
      .values({
        creatorId: creatorIdNum,
        tier: tier.toLowerCase(),
        monthlyPrice: String(parseFloat(monthlyPrice)),
        status: "active",
      })
      .returning();

    return res.json({ success: true, subscription: subscription[0] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create subscription" });
  }
});

// Get creator subscriptions
router.get("/creator/subscriptions", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

    const creatorIdNum = parseInt(creatorId, 10);

    const subscriptions = await db
      .select()
      .from(creatorSubscriptions)
      .where(eq(creatorSubscriptions.creatorId, creatorIdNum));

    return res.json({ subscriptions });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// Update creator subscription tier/pricing
router.put("/creator/subscriptions/:id", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    const { id } = req.params;
    const { tier, monthlyPrice, status } = req.body;

    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });
    if (!id) return res.status(400).json({ error: "Subscription ID is required" });

    const creatorIdNum = parseInt(creatorId, 10);
    const subId = parseInt(id, 10);

    // Verify ownership
    const existing = await db
      .select()
      .from(creatorSubscriptions)
      .where(
        and(
          eq(creatorSubscriptions.id, subId),
          eq(creatorSubscriptions.creatorId, creatorIdNum)
        )
      );

    if (!existing.length) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const updates: any = {};
    if (tier) updates.tier = tier.toLowerCase();
    if (monthlyPrice !== undefined) updates.monthlyPrice = String(parseFloat(monthlyPrice));
    if (status) updates.status = status;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updated = await db
      .update(creatorSubscriptions)
      .set(updates)
      .where(eq(creatorSubscriptions.id, subId))
      .returning();

    return res.json({ success: true, subscription: updated[0] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update subscription" });
  }
});

// Delete creator subscription
router.delete("/creator/subscriptions/:id", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    const { id } = req.params;

    if (!creatorId) return res.status(401).json({ error: "Unauthorized" });
    if (!id) return res.status(400).json({ error: "Subscription ID is required" });

    const creatorIdNum = parseInt(creatorId, 10);
    const subId = parseInt(id, 10);

    // Verify ownership
    const existing = await db
      .select()
      .from(creatorSubscriptions)
      .where(
        and(
          eq(creatorSubscriptions.id, subId),
          eq(creatorSubscriptions.creatorId, creatorIdNum)
        )
      );

    if (!existing.length) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    await db.delete(creatorSubscriptions).where(eq(creatorSubscriptions.id, subId));

    return res.json({ success: true, message: "Subscription deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete subscription" });
  }
});

export default router;
