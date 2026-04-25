import { Router } from "express";
import { db } from "@specflow/db";
import { vaults } from "@specflow/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAdmin } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allVaults = await db
      .select()
      .from(vaults)
      .where(eq(vaults.isPublished, true))
      .orderBy(desc(vaults.publishedAt))
      .limit(10);

    res.json(allVaults);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vaults" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const vault = await db
      .select()
      .from(vaults)
      .where(eq(vaults.id, parseInt(id)))
      .limit(1);

    if (!vault.length) {
      return res.status(404).json({ error: "Vault not found" });
    }

    res.json(vault[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vault" });
  }
});

// POST /vaults/:id/publish - Admin only
router.post("/:id/publish", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const [updated] = await db
      .update(vaults)
      .set({ isPublished: true, publishedAt: now })
      .where(eq(vaults.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Vault not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to publish vault" });
  }
});

export default router;
