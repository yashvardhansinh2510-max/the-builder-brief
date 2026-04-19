import { Router, type IRouter } from "express";
import { eq, sql, and, gte, count } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { CreateSubscriberBody, UnsubscribeBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/subscribers", async (req, res): Promise<void> => {
  const parsed = CreateSubscriberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0 && !existing[0].unsubscribed) {
    res.status(409).json({ error: "Already subscribed" });
    return;
  }

  if (existing.length > 0 && existing[0].unsubscribed) {
    const [updated] = await db
      .update(subscribersTable)
      .set({ unsubscribed: false, source: parsed.data.source ?? "homepage" })
      .where(eq(subscribersTable.email, parsed.data.email))
      .returning();
    res.status(201).json({
      id: updated.id,
      email: updated.email,
      source: updated.source,
      confirmed: updated.confirmed,
      createdAt: updated.createdAt,
    });
    return;
  }

  const [subscriber] = await db
    .insert(subscribersTable)
    .values({
      email: parsed.data.email,
      source: parsed.data.source ?? "homepage",
    })
    .returning();

  res.status(201).json({
    id: subscriber.id,
    email: subscriber.email,
    source: subscriber.source,
    confirmed: subscriber.confirmed,
    createdAt: subscriber.createdAt,
  });
});

router.post("/subscribers/unsubscribe", async (req, res): Promise<void> => {
  const parsed = UnsubscribeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(subscribersTable)
    .set({ unsubscribed: true })
    .where(eq(subscribersTable.email, parsed.data.email))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  res.json({ message: "Unsubscribed successfully" });
});

router.get("/subscribers/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalRow] = await db
    .select({ count: count() })
    .from(subscribersTable);

  const [confirmedRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(eq(subscribersTable.confirmed, true));

  const [unsubscribedRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(eq(subscribersTable.unsubscribed, true));

  const [todayRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(gte(subscribersTable.createdAt, today));

  const [weekRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(gte(subscribersTable.createdAt, weekAgo));

  res.json({
    total: totalRow.count,
    confirmed: confirmedRow.count,
    unsubscribed: unsubscribedRow.count,
    todaySignups: todayRow.count,
    weekSignups: weekRow.count,
  });
});

export default router;
