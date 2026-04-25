import { Router } from "express";
import { db } from "@specflow/db";
import { vaults } from "@specflow/db/schema";
import { eq, desc } from "drizzle-orm";

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

export default router;
