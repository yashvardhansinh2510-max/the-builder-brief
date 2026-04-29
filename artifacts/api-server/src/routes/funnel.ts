import { Router, Request, Response } from "express";
import { db } from "@/db";
import { subscribersTable, upgradeOffers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  checkFreeToProEligibility,
  checkProToMaxEligibility,
  checkMaxToIncubatorEligibility,
  checkAndNotifyFreeToProEligibility,
} from "@/lib/funnel/eligibility";
import {
  updateMilestoneProgress,
  getMilestoneProgress,
} from "@/lib/funnel/milestones";
import {
  calculateScoutScore,
  identifyScoutCandidates,
  updateScoutScore,
} from "@/lib/funnel/scouts";

const router = Router();

router.post("/check-free-to-pro", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const eligibility = await checkFreeToProEligibility(userId);
    res.json(eligibility);
  } catch (error) {
    console.error("Check Free→Pro eligibility error:", error);
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

router.post("/check-pro-to-max", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const eligibility = await checkProToMaxEligibility(userId);
    res.json(eligibility);
  } catch (error) {
    console.error("Check Pro→Max eligibility error:", error);
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

router.post("/check-max-to-incubator", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const eligibility = await checkMaxToIncubatorEligibility(userId);
    res.json(eligibility);
  } catch (error) {
    console.error("Check Max→Incubator eligibility error:", error);
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

router.post("/notify-free-to-pro", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const result = await checkAndNotifyFreeToProEligibility(userId);
    res.json(result);
  } catch (error) {
    console.error("Notify Free→Pro error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

router.post("/claim/:offerId", async (req: Request, res: Response): Promise<void> => {
  try {
    const offerId = typeof req.params.offerId === "string" ? req.params.offerId : "";
    const { userId } = req.body;

    if (!offerId || !userId) {
      res
        .status(400)
        .json({ error: "offerId and userId required" });
      return;
    }

    const offer = await db
      .select()
      .from(upgradeOffers)
      .where(and(eq(upgradeOffers.id, offerId), eq(upgradeOffers.userId, userId)))
      .limit(1);

    if (!offer || offer.length === 0) {
      res.status(404).json({ error: "Offer not found" });
      return;
    }

    if (offer[0].acceptedAt || offer[0].rejectedAt) {
      res.status(400).json({ error: "Offer already claimed or rejected" });
      return;
    }

    if (offer[0].expiresAt && new Date() > offer[0].expiresAt) {
      res.status(400).json({ error: "Offer expired" });
      return;
    }

    await db
      .update(upgradeOffers)
      .set({ acceptedAt: new Date() })
      .where(eq(upgradeOffers.id, offerId));

    const updatedUser = await db
      .update(subscribersTable)
      .set({ tier: offer[0].toTier as "free" | "pro" | "max" | "incubator" })
      .where(eq(subscribersTable.id, userId))
      .returning();

    res.json({
      success: true,
      offerId,
      newTier: updatedUser[0]?.tier,
    });
  } catch (error) {
    console.error("Claim offer error:", error);
    res.status(500).json({ error: "Failed to claim offer" });
  }
});

router.post("/reject/:offerId", async (req: Request, res: Response): Promise<void> => {
  try {
    const offerId = typeof req.params.offerId === "string" ? req.params.offerId : "";
    const { userId } = req.body;

    if (!offerId || !userId) {
      res
        .status(400)
        .json({ error: "offerId and userId required" });
      return;
    }

    const offer = await db
      .select()
      .from(upgradeOffers)
      .where(and(eq(upgradeOffers.id, offerId), eq(upgradeOffers.userId, userId)))
      .limit(1);

    if (!offer || offer.length === 0) {
      res.status(404).json({ error: "Offer not found" });
      return;
    }

    if (offer[0].acceptedAt || offer[0].rejectedAt) {
      res.status(400).json({ error: "Offer already claimed or rejected" });
      return;
    }

    await db
      .update(upgradeOffers)
      .set({ rejectedAt: new Date() })
      .where(eq(upgradeOffers.id, offerId));

    res.json({ success: true, offerId });
  } catch (error) {
    console.error("Reject offer error:", error);
    res.status(500).json({ error: "Failed to reject offer" });
  }
});

router.post("/milestones/update", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, currentMRR, activeUsers, featureShipped } = req.body;

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const progress = await updateMilestoneProgress(userId, {
      currentMRR,
      activeUsers,
      featureShipped,
    });

    res.json(progress);
  } catch (error) {
    console.error("Update milestone error:", error);
    res.status(500).json({ error: "Failed to update milestone progress" });
  }
});

router.get("/milestones/progress/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : "";

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const progress = await getMilestoneProgress(userId);
    res.json(progress);
  } catch (error) {
    console.error("Get milestone progress error:", error);
    res.status(500).json({ error: "Failed to get milestone progress" });
  }
});

router.post("/scouts/identify", async (req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await identifyScoutCandidates();
    res.json({
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("Identify scouts error:", error);
    res.status(500).json({ error: "Failed to identify scout candidates" });
  }
});

router.get("/scouts/score/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : "";

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const score = await calculateScoutScore(userId);
    res.json(score);
  } catch (error) {
    console.error("Get scout score error:", error);
    res.status(500).json({ error: "Failed to calculate scout score" });
  }
});

router.post("/scouts/update/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : "";

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const score = await updateScoutScore(userId);
    res.json(score);
  } catch (error) {
    console.error("Update scout score error:", error);
    res.status(500).json({ error: "Failed to update scout score" });
  }
});

export default router;
