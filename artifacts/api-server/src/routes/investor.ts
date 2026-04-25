import { Router, IRouter } from "express";
import { db, subscribersTable, wallsTable } from "@workspace/db";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

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

// GET /api/investor/dealflow — Returns top performing founders
router.get("/investor/dealflow", verifyUser, verifyInvestor, async (req, res) => {
  try {
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
      .limit(20);

    res.json(topFounders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dealflow" });
  }
});

export default router;
