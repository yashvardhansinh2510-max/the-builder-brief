import { Router, IRouter } from "express";
import { db, wallsTable, subscribersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

const router: IRouter = Router();

// GET /api/walls — Fetch all visible founder profiles
router.get("/walls", async (req, res) => {
  try {
    const profiles = await db.select()
      .from(wallsTable)
      .where(eq(wallsTable.isVisible, true))
      .orderBy(desc(wallsTable.isFeatured), desc(wallsTable.createdAt));

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch founder wall" });
  }
});

// GET /api/walls/me — Fetch own profile
router.get("/walls/me", verifyUser, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const [profile] = await db.select().from(wallsTable).where(eq(wallsTable.subscriberId, subscriber.id)).limit(1);
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// POST /api/walls/me — Create or update own profile
router.post("/walls/me", verifyUser, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const { name, startupName, sector, stage, bio, linkedinUrl, twitterUrl, githubUrl, websiteUrl, avatarUrl, isVisible } = req.body;

    const profileData = {
      subscriberId: subscriber.id,
      name,
      startupName,
      sector,
      stage,
      bio,
      linkedinUrl,
      twitterUrl,
      githubUrl,
      websiteUrl,
      avatarUrl,
      isVisible: isVisible ?? true,
    };

    const [existing] = await db.select().from(wallsTable).where(eq(wallsTable.subscriberId, subscriber.id)).limit(1);

    if (existing) {
      const [updated] = await db.update(wallsTable)
        .set(profileData)
        .where(eq(wallsTable.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db.insert(wallsTable)
        .values(profileData)
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
