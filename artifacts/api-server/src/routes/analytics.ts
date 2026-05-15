import { Router, type IRouter } from "express";
import { desc, gte, count, eq } from "drizzle-orm";
import { db, pageviewsTable, analyticsEventsTable } from "@workspace/db";
import { TrackPageviewBody } from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

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

  res.status(201).json({ ok: true });
});

router.post("/analytics/event", async (req, res): Promise<void> => {
  const { event, properties, userId, sessionId } = req.body;
  if (!event || typeof event !== "string") {
    res.status(400).json({ error: "event required" });
    return;
  }

  try {
    await db.insert(analyticsEventsTable).values({
      event,
      userId: userId ?? getAuth(req).userId ?? null,
      sessionId: sessionId ?? null,
      properties: properties ?? {},
    });
    res.status(201).json({ ok: true });
  } catch {
    // Table may not exist yet — fail silently so the frontend never breaks
    res.status(201).json({ ok: true });
  }
});

router.get("/analytics/my-activity", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const events = await db
      .select()
      .from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.userId, userId))
      .orderBy(desc(analyticsEventsTable.createdAt))
      .limit(50);

    res.json({ events });
  } catch {
    res.json({ events: [] });
  }
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
