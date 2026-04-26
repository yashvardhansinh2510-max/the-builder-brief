import { Router } from "express";
import { db } from "@workspace/db";
import { dailyBriefsTable, personalizationTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { buildDailyContextForUser } from "../services/context";

const router = Router();

router.get("/today", async (req, res) => {
  try {
    const subscriberId = (req as any).subscriberId;
    if (!subscriberId) return res.status(401).json({ error: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];
    const existingBrief = await db
      .select()
      .from(dailyBriefsTable)
      .where(
        (b) => eq(b.subscriberId, subscriberId) && eq(b.briefDate, today)
      )
      .limit(1);

    if (existingBrief.length > 0) {
      return res.json(existingBrief[0]);
    }

    const context = await buildDailyContextForUser(subscriberId);
    const [brief] = await db
      .insert(dailyBriefsTable)
      .values({
        subscriberId,
        briefDate: today,
        summary: context.summary,
        highlights: context.highlights,
        sourceArticleIds: [],
      })
      .returning();

    return res.json(brief);
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate brief" });
  }
});

router.post("/personalization", async (req, res) => {
  try {
    const subscriberId = (req as any).subscriberId;
    if (!subscriberId) return res.status(401).json({ error: "Unauthorized" });

    const { interests, focusAreas, contextStyle } = req.body;

    const [updated] = await db
      .insert(personalizationTable)
      .values({
        subscriberId,
        interests,
        focusAreas,
        contextStyle,
      })
      .onConflictDoUpdate({
        target: personalizationTable.subscriberId,
        set: { interests, focusAreas, contextStyle },
      })
      .returning();

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update personalization" });
  }
});

export default router;
