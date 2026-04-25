import { Router, IRouter } from "express";
import { db, productsTable, purchasesTable, subscribersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

const router: IRouter = Router();

// GET /api/marketplace/products — List all active products
router.get("/marketplace/products", async (req, res) => {
  try {
    const products = await db.select().from(productsTable).where(eq(productsTable.isActive, true));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/marketplace/my-purchases — List user's owned products
router.get("/marketplace/my-purchases", verifyUser, async (req, res) => {
  try {
    const email = (req as any).user?.email;
    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const purchases = await db
      .select({
        productId: purchasesTable.productId,
        name: productsTable.name,
        description: productsTable.description,
        contentUrl: productsTable.contentUrl
      })
      .from(purchasesTable)
      .innerJoin(productsTable, eq(purchasesTable.productId, productsTable.id))
      .where(eq(purchasesTable.subscriberId, subscriber.id));

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

export default router;
