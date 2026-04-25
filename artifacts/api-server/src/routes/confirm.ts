import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { SITE_URL } from "../lib/resend";

const router: IRouter = Router();

router.get("/subscribers/confirm", async (req, res): Promise<void> => {
  const token = req.query.token as string;

  if (!token) {
    res.redirect(`${SITE_URL}/?error=missing-token`);
    return;
  }

  const [subscriber] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.confirmationToken, token))
    .limit(1);

  if (!subscriber) {
    res.redirect(`${SITE_URL}/?error=invalid-token`);
    return;
  }

  await db
    .update(subscribersTable)
    .set({
      confirmed: true,
      confirmedAt: new Date(),
      confirmationToken: null,
    })
    .where(eq(subscribersTable.id, subscriber.id));

  res.redirect(`${SITE_URL}/?confirmed=true`);
});

export default router;
