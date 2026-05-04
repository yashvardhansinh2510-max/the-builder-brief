import { Router } from "express";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

const router = Router();

router.get("/tier", verifyUser, async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: "User email not found" });
    }

    const subscriber = await db
      .select({ tier: subscribersTable.tier })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, req.user.email))
      .limit(1);

    if (subscriber.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ tier: subscriber[0].tier });
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return res.status(500).json({ error: "Failed to fetch user tier" });
  }
});

export default router;
