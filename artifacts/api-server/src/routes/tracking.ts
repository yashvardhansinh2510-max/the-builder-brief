import { Router } from "express";
import { db } from "@workspace/db";
import { dailyBriefsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// GET /api/track/open/:briefId - Open tracking pixel
router.get("/track/open/:briefId", async (req, res) => {
  const { briefId } = req.params;
  
  try {
    await db.update(dailyBriefsTable)
      .set({ openCount: sql`open_count + 1` })
      .where(eq(dailyBriefsTable.id, parseInt(briefId)));
    
    logger.info({ briefId }, "Brief open tracked");
  } catch (error) {
    logger.error({ error, briefId }, "Failed to track brief open");
  }

  // Return a transparent 1x1 pixel
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-cache, no-store, must-revalidate",
  });
  res.end(pixel);
});

// GET /api/track/click/:briefId - Click tracking
router.get("/track/click/:briefId", async (req, res) => {
  const { briefId } = req.params;
  const { url } = req.query;

  try {
    await db.update(dailyBriefsTable)
      .set({ clickCount: sql`click_count + 1` })
      .where(eq(dailyBriefsTable.id, parseInt(briefId)));
    
    logger.info({ briefId, url }, "Brief click tracked");
  } catch (error) {
    logger.error({ error, briefId }, "Failed to track brief click");
  }

  if (url && typeof url === "string") {
    res.redirect(url);
  } else {
    res.redirect("https://build.specflowai.com");
  }
});

export default router;
