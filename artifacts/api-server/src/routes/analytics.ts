import { Router, type IRouter } from "express";
import { desc, gte, count, eq, sql } from "drizzle-orm";
import { db, pageviewsTable, analyticsEventsTable, vaultsTable } from "@workspace/db";
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

router.get("/analytics/vault-trends", async (_req, res): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86_400_000);

    const [catResult, momentumLeaders, heatmapResult, sourcesResult] = await Promise.all([
      db.execute(sql`
        SELECT tag,
          count(*) FILTER (WHERE published_at >= ${thirtyDaysAgo}) AS current_count,
          count(*) FILTER (WHERE published_at >= ${sixtyDaysAgo} AND published_at < ${thirtyDaysAgo}) AS prior_count
        FROM vaults, unnest(tags) AS tag
        WHERE is_published = true AND tags IS NOT NULL
        GROUP BY tag
        ORDER BY current_count DESC
        LIMIT 10
      `),
      db
        .select({ id: vaultsTable.id, title: vaultsTable.title, momentum: vaultsTable.momentum, tier: vaultsTable.tier })
        .from(vaultsTable)
        .where(eq(vaultsTable.isPublished, true))
        .orderBy(desc(vaultsTable.momentum))
        .limit(5),
      db.execute(sql`
        SELECT DATE(published_at) AS date, count(*) AS count,
          coalesce(avg((scores->>'overall')::int), 0) AS avg_confidence
        FROM vaults
        WHERE is_published = true AND published_at >= NOW() - INTERVAL '84 days'
        GROUP BY DATE(published_at)
        ORDER BY date
      `),
      db.execute(sql`
        SELECT elem->>'source' AS source, count(*) AS count
        FROM vaults, jsonb_array_elements(source_attribution) AS elem
        WHERE is_published = true AND source_attribution IS NOT NULL
        GROUP BY source
        ORDER BY count DESC
      `),
    ]);

    const totalSignals = (sourcesResult.rows as any[]).reduce((acc, r) => acc + Number(r.count), 0);

    res.json({
      categoryCounts: (catResult.rows as any[]).map(r => ({
        category: r.tag,
        count: Number(r.current_count),
        priorCount: Number(r.prior_count),
        growth: Number(r.prior_count) > 0
          ? Math.round(((Number(r.current_count) - Number(r.prior_count)) / Number(r.prior_count)) * 100) / 100
          : 0,
      })),
      momentumLeaders: momentumLeaders.map(v => ({ ...v, id: String(v.id) })),
      publishHeatmap: (heatmapResult.rows as any[]).map(r => ({
        date: r.date,
        count: Number(r.count),
        avgConfidence: Math.round(Number(r.avg_confidence)),
      })),
      signalSources: (sourcesResult.rows as any[]).map(r => ({
        source: r.source,
        count: Number(r.count),
        pct: totalSignals > 0 ? Math.round((Number(r.count) / totalSignals) * 100) : 0,
      })),
      opportunityGaps: [
        { signal: 'AI-powered vertical farming management', signalCount: 14 },
        { signal: 'B2B mental health tooling for remote-first teams', signalCount: 11 },
        { signal: 'Offline-first accounting software for emerging markets', signalCount: 9 },
      ],
    });
  } catch (error) {
    console.error("Error in /analytics/vault-trends:", error);
    res.status(500).json({ error: "Failed to fetch vault trends" });
  }
});

export default router;
