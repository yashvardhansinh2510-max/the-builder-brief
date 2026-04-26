import { Router, type IRouter } from "express";
import { eq, gte, count } from "drizzle-orm";
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import { db, subscribersTable } from "@workspace/db";
import { CreateSubscriberBody, UnsubscribeBody } from "@workspace/api-zod";
import { resend, FROM_EMAIL, SITE_URL } from "../lib/resend";
import { confirmationEmailHtml } from "../lib/email-templates";
import { verifyUser } from "../middleware/verifyUser";

function makeUnsubToken(email: string): string {
  const secret = process.env.CRON_SECRET ?? "changeme";
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

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

  if (existing.length > 0 && existing[0].confirmed && !existing[0].unsubscribed) {
    res.status(409).json({ error: "Already subscribed" });
    return;
  }

  const token = randomUUID();

  if (existing.length > 0) {
    await db
      .update(subscribersTable)
      .set({
        unsubscribed: false,
        confirmed: false,
        confirmationToken: token,
        confirmedAt: null,
        source: parsed.data.source ?? "homepage",
      })
      .where(eq(subscribersTable.email, parsed.data.email));
  } else {
    await db.insert(subscribersTable).values({
      email: parsed.data.email,
      source: parsed.data.source ?? "homepage",
      confirmationToken: token,
    });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: parsed.data.email,
      subject: "Confirm your subscription to The Builder Brief",
      html: confirmationEmailHtml(token),
    });
  } catch {
    await db
      .update(subscribersTable)
      .set({ unsubscribed: true, confirmationToken: null })
      .where(eq(subscribersTable.email, parsed.data.email));
    res.status(502).json({ error: "Failed to send confirmation email. Please try again." });
    return;
  }

  res.status(201).json({ message: "Check your inbox to confirm your subscription" });
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

router.get("/subscribers/unsubscribe-link", async (req, res): Promise<void> => {
  const email = req.query.email as string;
  const sig = req.query.sig as string;

  if (!email || !sig) {
    res.status(400).json({ error: "Invalid unsubscribe link" });
    return;
  }

  const expected = makeUnsubToken(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig.slice(0, expected.length).padEnd(expected.length, " "));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(400).json({ error: "Invalid unsubscribe link" });
    return;
  }

  await db
    .update(subscribersTable)
    .set({ unsubscribed: true })
    .where(eq(subscribersTable.email, email));

  res.redirect(`${SITE_URL}/?unsubscribed=true`);
});

router.get("/subscribers/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalRow] = await db.select({ count: count() }).from(subscribersTable);
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

router.get("/subscribers/me", verifyUser, async (req, res): Promise<void> => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [subscriber] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);

  if (!subscriber) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  res.json(subscriber);
});

router.post("/subscribers/me/sync", verifyUser, async (req, res): Promise<void> => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { whatBuilding, startupSector, startupStage, targetCustomer, biggestChallenge, contextUpdatedAt } = req.body;

  const [existing] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(subscribersTable)
      .set({
        whatBuilding,
        startupSector,
        startupStage,
        targetCustomer,
        biggestChallenge,
        contextUpdatedAt: contextUpdatedAt ? new Date(contextUpdatedAt) : new Date(),
      })
      .where(eq(subscribersTable.email, email));
  } else {
    // If somehow they exist in Clerk but not our DB, create them
    await db.insert(subscribersTable).values({
      email,
      confirmed: true,
      whatBuilding,
      startupSector,
      startupStage,
      targetCustomer,
      biggestChallenge,
      contextUpdatedAt: new Date(),
    });
  }

  res.json({ success: true });
});

export default router;
