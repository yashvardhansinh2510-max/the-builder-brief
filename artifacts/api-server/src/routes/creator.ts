import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { db, creatorSubscriptions } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  requireParsedId,
  unauthorizedError,
  badRequestError,
  notFoundError,
  serverError,
  successResponse,
} from "../utils";

const router = Router();

// Create creator subscription (set up tiered offering)
router.post("/creator/subscriptions", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return unauthorizedError(res);

    const { tier, monthlyPrice } = req.body;
    if (!tier || monthlyPrice === undefined) {
      return badRequestError(res, "Tier and monthly price are required");
    }

    const creatorIdNum = requireParsedId(creatorId);
    const parsedPrice = parseFloat(monthlyPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return badRequestError(res, "Monthly price must be a valid positive number");
    }

    const subscription = await db
      .insert(creatorSubscriptions)
      .values({
        creatorId: creatorIdNum,
        tier: tier.toLowerCase(),
        monthlyPrice: String(parsedPrice),
        status: "active",
      })
      .returning();

    return successResponse(res, { success: true, subscription: subscription[0] });
  } catch (error) {
    return serverError(res, "Failed to create subscription", error);
  }
});

// Get creator subscriptions
router.get("/creator/subscriptions", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) return unauthorizedError(res);

    const creatorIdNum = requireParsedId(creatorId);

    const subscriptions = await db
      .select()
      .from(creatorSubscriptions)
      .where(eq(creatorSubscriptions.creatorId, creatorIdNum));

    return successResponse(res, { subscriptions });
  } catch (error) {
    return serverError(res, "Failed to fetch subscriptions", error);
  }
});

// Update creator subscription tier/pricing
router.put("/creator/subscriptions/:id", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    const { id } = req.params;
    const { tier, monthlyPrice, status } = req.body;

    if (!creatorId) return unauthorizedError(res);
    if (!id) return badRequestError(res, "Subscription ID is required");

    const creatorIdNum = requireParsedId(creatorId);
    const subId = requireParsedId(id);

    // Verify ownership
    const existing = await db
      .select()
      .from(creatorSubscriptions)
      .where(
        eq(creatorSubscriptions.id, subId),
      );

    if (!existing.length || existing[0].creatorId !== creatorIdNum) {
      return notFoundError(res, "Subscription");
    }

    type UpdatePayload = Partial<{
      tier: string;
      monthlyPrice: string;
      status: string;
    }>;

    const updates: UpdatePayload = {};
    if (tier) {
      updates.tier = tier.toLowerCase();
    }
    if (monthlyPrice !== undefined) {
      const parsedPrice = parseFloat(monthlyPrice);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return badRequestError(res, "Monthly price must be a valid positive number");
      }
      updates.monthlyPrice = String(parsedPrice);
    }
    if (status) {
      updates.status = status;
    }
    if (Object.keys(updates).length === 0) {
      return badRequestError(res, "No fields to update");
    }

    const updated = await db
      .update(creatorSubscriptions)
      .set(updates)
      .where(eq(creatorSubscriptions.id, subId))
      .returning();

    return successResponse(res, { success: true, subscription: updated[0] });
  } catch (error) {
    return serverError(res, "Failed to update subscription", error);
  }
});

// Delete creator subscription
router.delete("/creator/subscriptions/:id", verifyUser, async (req, res) => {
  try {
    const creatorId = req.user?.id;
    const { id } = req.params;

    if (!creatorId) return unauthorizedError(res);
    if (!id) return badRequestError(res, "Subscription ID is required");

    const creatorIdNum = requireParsedId(creatorId);
    const subId = requireParsedId(id);

    // Verify ownership
    const existing = await db
      .select()
      .from(creatorSubscriptions)
      .where(eq(creatorSubscriptions.id, subId));

    if (!existing.length || existing[0].creatorId !== creatorIdNum) {
      return notFoundError(res, "Subscription");
    }

    await db.delete(creatorSubscriptions).where(eq(creatorSubscriptions.id, subId));

    return successResponse(res, { success: true, message: "Subscription deleted" });
  } catch (error) {
    return serverError(res, "Failed to delete subscription", error);
  }
});

export default router;
