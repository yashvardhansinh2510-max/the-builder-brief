import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { createHmac } from "crypto";
import { db, subscribersTable } from "@workspace/db";
import { resend, FROM_EMAIL, SITE_URL } from "../lib/resend";
import { newsletterEmailHtml } from "../lib/email-templates";
import { getLatestIssue } from "../lib/issues-data";

function makeUnsubToken(email: string): string {
  const secret = process.env.CRON_SECRET ?? "changeme";
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

const router: IRouter = Router();

router.get("/cron/newsletter", async (req, res): Promise<void> => {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const issue = getLatestIssue();

  const subscribers = await db
    .select({ email: subscribersTable.email })
    .from(subscribersTable)
    .where(
      and(
        eq(subscribersTable.confirmed, true),
        eq(subscribersTable.unsubscribed, false),
      ),
    );

  if (subscribers.length === 0) {
    res.json({ sent: 0, message: "No confirmed subscribers" });
    return;
  }

  const BATCH_SIZE = 100;
  let totalSent = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const emails = batch.map((sub) => {
      const sig = makeUnsubToken(sub.email);
      const unsubUrl = `${SITE_URL}/api/subscribers/unsubscribe-link?email=${encodeURIComponent(sub.email)}&sig=${sig}`;
      return {
        from: FROM_EMAIL,
        to: sub.email,
        subject: `The Builder Brief #${issue.number}: ${issue.title}`,
        html: newsletterEmailHtml(issue, sub.email, unsubUrl),
      };
    });
    const result = await resend.batch.send(emails);
    const successCount = result.data?.data?.length ?? batch.length;
    totalSent += successCount;
    if (result.error) {
      console.error("Resend batch error:", result.error);
    }
  }

  res.json({ sent: totalSent, issue: issue.number });
});

export default router;
