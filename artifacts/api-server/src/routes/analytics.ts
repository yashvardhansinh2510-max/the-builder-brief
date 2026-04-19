import { Router, type IRouter } from "express";
import { desc, gte, count, sql } from "drizzle-orm";
import { db, pageviewsTable } from "@workspace/db";
import { TrackPageviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/analytics/pageview", async (req, res): Promise<void> => {
  const parsed = TrackPageviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(pageviewsTable).values({
    page: parsed.data.page,
    referrer: req.headers.referer ?? parsed.data.referrer ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  });

  res.status(201).json({ message: "Tracked" });
});

router.get("/analytics/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRow] = await db
    .select({ count: count() })
    .from(pageviewsTable);

  const [todayRow] = await db
    .select({ count: count() })
    .from(pageviewsTable)
    .where(gte(pageviewsTable.createdAt, today));

  const topPages = await db
    .select({
      page: pageviewsTable.page,
      count: count(),
    })
    .from(pageviewsTable)
    .groupBy(pageviewsTable.page)
    .orderBy(desc(count()))
    .limit(10);

  res.json({
    totalViews: totalRow.count,
    todayViews: todayRow.count,
    topPages,
  });
});

export default router;
