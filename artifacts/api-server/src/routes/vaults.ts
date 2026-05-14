import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { vaultsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAdmin } from "../middleware/auth";

const numericId = z.coerce.number().int().positive();

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allVaults = await db
      .select()
      .from(vaultsTable)
      .where(eq(vaultsTable.isPublished, true))
      .orderBy(desc(vaultsTable.publishedAt))
      .limit(10);

    return res.json(allVaults);
  } catch (error) {
    console.error("DB Error in /api/vaults:", error);
    return res.status(500).json({ error: "Failed to fetch vaultsTable" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  try {
    const vault = await db
      .select()
      .from(vaultsTable)
      .where(eq(vaultsTable.id, parsed.data))
      .limit(1);

    if (!vault.length) {
      return res.status(404).json({ error: "Vault not found" });
    }

    return res.json(vault[0]);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch vault" });
  }
});

// POST /vaultsTable/:id/publish - Admin only
router.post("/:id/publish", isAdmin, async (req, res) => {
  const parsed = numericId.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid vault ID" });
  try {
    const now = new Date();

    const [updated] = await db
      .update(vaultsTable)
      .set({ isPublished: true, publishedAt: now })
      .where(eq(vaultsTable.id, parsed.data))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Vault not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Failed to publish vault" });
  }
});

export default router;
